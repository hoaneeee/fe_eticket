import { http } from './http'

export async function uploadFile(file, onProgress){
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post('/admin/v1/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }, 
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total)
        onProgress(percent)
      }
    }
  })
  return data   // { url: '/uploads/xxx.png' }
}