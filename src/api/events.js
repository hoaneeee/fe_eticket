

import { http } from './http'

export const listEvents = (page = 0, size = 10, { q, venueId } = {}) =>
  http.get('/admin/v1/events', { params: { page, size, q, venueId } })
      .then(r => r.data)

export const getEventById = (id) =>
  http.get(`/admin/v1/events/${id}`).then(r => r.data)

export const createEvent = (body) =>
  http.post('/admin/v1/events', body).then(r => r.data)

export const updateEvent = (id, body) =>
  http.put(`/admin/v1/events/${id}`, body).then(r => r.data)

export const deleteEvent = (id) =>
  http.delete(`/admin/v1/events/${id}`)