import { http } from './http';

export const listVenues = (page = 0, size = 100) =>
  http.get("/admin/v1/venues", { params: { page, size } }).then((r) => r.data);

export const createVenue = (body) =>
  http.post('/admin/v1/venues', body).then(r=>r.data);

export const updateVenue = (id, body) =>
  http.put(`/admin/v1/venues/${id}`, body).then(r=>r.data);

export const deleteVenue = (id) =>
  http.delete(`/admin/v1/venues/${id}`);