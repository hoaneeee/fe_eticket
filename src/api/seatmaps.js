
import { http } from './http'

export const uploadSeatMap = (venueId, file, name) => {   // <-- đúng tên uploadSeatMap
  const form = new FormData()
  form.append('file', file)
  if (name) form.append('name', name)
  return http.post(`/admin/v1/venues/${venueId}/seatmap`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const getSeatMapsByVenue = (venueId) =>
  http.get(`/admin/v1/seatmaps/by-venue/${venueId}`).then(r => r.data)

export const getZones = (mapId) =>
  http.get(`/admin/v1/seatmaps/${mapId}/zones`).then(r => r.data)

export const createZone = (mapId, body) =>
  http.post(`/admin/v1/seatmaps/${mapId}/zones`, body).then(r => r.data)

export const updateZone = (id, body) =>
  http.put(`/admin/v1/seatmaps/zones/${id}`, body).then(r => r.data)

export const deleteZone = (id) =>
  http.delete(`/admin/v1/seatmaps/zones/${id}`)
