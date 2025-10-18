import { http } from './http'

/**
 * Gọi API check-in với mã vé/code
 * @param {string} code - mã đơn hoặc mã vé
 * @returns {Promise<Object>} - dữ liệu trả về từ server
 */
export const checkin = (code) => 
  http.post('/admin/v1/checkin', { code }).then(r => r.data)
