import axios from "axios";
import { useAuth } from "../store/auth";

export const http = axios.create({
  baseURL: "/api",
  withCredentials: true, // ok cả trong proxy, không hại
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

http.interceptors.request.use((c) => {
  const full = (c.baseURL || "") + (c.url || "");
  console.log(
    "[HTTP] →",
    c.method?.toUpperCase(),
    full,
    c.params || c.data || ""
  );
  const token = useAuth.getState().token;
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});
http.interceptors.response.use(
  (r) => {
    console.log("[HTTP] ←", r.status, r.config.url, r.data);
    return r;
  },
  (e) => {
    const st = e?.response?.status,
      url = e?.config?.url;
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Request error";
    console.error("[HTTP ERR]", st, url, msg);
    if (st === 401) useAuth.getState().setToken(null);
    return Promise.reject(e);
  }
);
