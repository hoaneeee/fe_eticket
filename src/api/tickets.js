import { http } from "./http";
export const getTicketsByEvent = (eventId) =>
    http.get(`/admin/v1/tickets/by-event/${eventId}`).then(r => r.data)
export const createTicket = (body) => http.post('/admin/v1/tickets', body).then(r=>r.data)
export const updateTicket = (id, body) => http.put(`/admin/v1/tickets/${id}`, body).then(r=>r.data)
export const deleteTicket = (id) => http.delete(`/admin/v1/tickets/${id}`)