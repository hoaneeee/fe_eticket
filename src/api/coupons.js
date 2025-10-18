import { http } from "./http";

export const listCoupons = () =>
    http.get("/admin/v1/coupons").then((r) => r.data);

export const createCoupon = (b) =>
    http.post("/admin/v1/coupons", b).then((r) => r.data);

export const updateCoupon = (id, b) =>
    http.put(`/admin/v1/coupons/${id}`, b).then((r) => r.data);

export const deleteCoupon = (id) =>
    http.delete(`/admin/v1/coupons/${id}`);

export const validateCoupon = (code) =>
  http.post("/admin/v1/coupons/validate", { code }).then((r) => r.data);
