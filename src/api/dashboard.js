import { http } from './http';

export const getDashboardSummary = (params) =>
  http.get('/admin/v1/dashboard/summary', { params }).then(r => r.data);
