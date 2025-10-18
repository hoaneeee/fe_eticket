import { http } from './http'
export const listOrders = (page=0,size=10) =>
  http.get('/admin/v1/orders',{ params:{page,size} }).then(r=>r.data)
export const getOrder = (code) =>
  http.get(`/admin/v1/orders/${code}`).then((r) => r.data);