import { http } from "./http";

export const getInventoryConfig = (eventId) =>
  http.get(`/admin/v1/inventory/events/${eventId}/config`).then((r) => r.data);

export const upsertInventoryConfig = (eventId, body) =>
  http
    .put(`/admin/v1/inventory/events/${eventId}/config`, body)
    .then((r) => r.data);
