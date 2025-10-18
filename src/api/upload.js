// src/api/upload.js
import { http } from './http'
export const uploadFile = async (file)=>{
  const f = new FormData(); f.append('file', file)
  return http.post('/admin/v1/upload', f, { headers:{ 'Content-Type':'multipart/form-data' } })
    .then(r=>r.data) // { url: '/uploads/xxx.jpg' }
}
