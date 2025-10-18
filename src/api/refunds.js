// import { http } from "./http";

// export const createRefund = (orderId, amount, reason) =>
//   http
//     .post("/admin/v1/refunds", { orderId, amount, reason })
//     .then((r) => r.data);

// export const listRefundsByOrder = (orderId) =>
//   http.get(`/admin/v1/refunds/by-order/${orderId}`).then((r) => r.data);

// export const approveRefund = (id, note) =>
//   http.post(`/admin/v1/refunds/${id}/approve`, { note }).then((r) => r.data);

// export const rejectRefund = (id, note) =>
//   http.post(`/admin/v1/refunds/${id}/reject`, { note }).then((r) => r.data);

// export const markRefundPaid = (id, note) =>
//   http.post(`/admin/v1/refunds/${id}/paid`, { note }).then((r) => r.data);

// //  Admin badge & panel:
// export const pendingCount = () =>
//   http.get("/admin/v1/refunds/pending-count").then((r) => r.data.count);

// export const recentPending = () =>
//   http.get("/admin/v1/refunds/recent-pending").then((r) => r.data);
// src/api/refunds.js
// -------------------------------
// Toàn bộ API dành cho Admin Refunds
// -------------------------------
import { http } from "./http";

export const createRefund = (orderId, amount, reason) =>
  http.post("/admin/v1/refunds", { orderId, amount, reason }).then((r) => r.data);

export const listRefundsByOrder = (orderId) =>
  http.get(`/admin/v1/refunds/by-order/${orderId}`).then((r) => r.data);

export const approveRefund = (id, note) =>
  http.post(`/admin/v1/refunds/${id}/approve`, { note }).then((r) => r.data);

export const rejectRefund = (id, note) =>
  http.post(`/admin/v1/refunds/${id}/reject`, { note }).then((r) => r.data);

export const markRefundPaid = (id, note) =>
  http.post(`/admin/v1/refunds/${id}/paid`, { note }).then((r) => r.data);

export const pendingCount = () =>
  http.get("/admin/v1/refunds/pending-count").then((r) => r.data.count);

export const recentPending = () =>
  http.get("/admin/v1/refunds/recent-pending").then((r) => r.data);
