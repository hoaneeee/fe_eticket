import { http } from './http';

export const listZonePricesByEvent = (eventId) =>
  http.get(`/admin/v1/zone-prices/by-event/${eventId}`).then(r => r.data)

export const upsertZonePrice = (body) =>
  http.post('/admin/v1/zone-prices', body).then(r => r.data)

export const deleteZonePrice = (id) =>
  http.delete(`/admin/v1/zone-prices/${id}`)