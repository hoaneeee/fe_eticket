import { http } from "./http";

export const adminLogin = (email, password) => 
http.post('/admin/v1/auth/login', { email, password }).then((r) => r.data)
