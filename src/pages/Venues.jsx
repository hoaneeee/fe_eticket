import { useEffect, useState } from 'react'
import { listVenues, createVenue, updateVenue, deleteVenue } from '../api/venues'

export default function Venues(){
  const [page,setPage] = useState(0)
  const [data,setData] = useState(null)
  const [editingId,setEditingId] = useState(null)
  const [form,setForm] = useState({ name:'', address:'', capacity:'', imageUrl:'', description:'' })
  const [error,setError] = useState('')
  const [message,setMessage] = useState('')

  const refresh = async ()=>{
    try {
      const res = await listVenues(page, 10)
      setData(res)
    } catch(e){
      setError(e.response?.data || e.message)
    }
  }

  useEffect(()=>{ refresh() },[page])

  const reset = ()=>{
    setForm({ name:'', address:'', capacity:'', imageUrl:'', description:'' })
    setEditingId(null)
    setError('')
    setMessage('')
  }

  const onSave = async ()=>{
    try{
      setError('')
      setMessage('')
      const body = { ...form, capacity: form.capacity ? Number(form.capacity) : null }
      if(editingId) await updateVenue(editingId, body)
      else await createVenue(body)
      setMessage(editingId ? 'Cập nhật thành công' : 'Thêm mới thành công')
      reset()
      refresh()
    }catch(e){
      setError(e.response?.data || e.message)
    }
  }

  const onDelete = async(id)=>{
    try{
      setError('')
      setMessage('')
      await deleteVenue(id)
      setMessage('Đã xóa thành công')
      refresh()
    }catch(e){
      setError(e.response?.data || e.message)
    }
  }

  const startEdit = (v)=>{
    setEditingId(v.id)
    setForm({
      name:v.name, address:v.address, capacity:v.capacity||'', imageUrl:v.imageUrl||'', description:v.description||''
    })
    setError('')
    setMessage('')
  }

  return (
    <div>
      <h3 className="mb-3">Địa điểm</h3>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {message && <div className="alert alert-success py-2">{message}</div>}

      <div className="row g-2 mb-3">
        <div className="col-3"><input className="form-control" placeholder="Tên"
          value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
        <div className="col-4"><input className="form-control" placeholder="Địa chỉ"
          value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
        <div className="col-2"><input className="form-control" type="number" placeholder="Sức chứa"
          value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}/></div>
        <div className="col-3"><input className="form-control" placeholder="URL Hình ảnh"
          value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))}/></div>
        <div className="col-10"><input className="form-control" placeholder="Mô tả"
          value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
        <div className="col-2 d-grid">
          <button className="btn btn-primary" onClick={onSave}>{editingId?'Cập nhật':'Thêm'}</button>
          {editingId && <button className="btn btn-secondary mt-2" onClick={reset}>Hủy</button>}
        </div>
      </div>

      <table className="table table-sm align-middle">
        <thead><tr><th>Tên</th><th>Địa chỉ</th><th>Sức chứa</th><th/></tr></thead>
        <tbody>
          {!data?.content?.length && (
            <tr><td colSpan={4}>Không có dữ liệu</td></tr>
          )}
          {data?.content?.map(v=>(
            <tr key={v.id}>
              <td>{v.name}</td>
              <td>{v.address}</td>
              <td>{v.capacity ?? '-'}</td>
              <td className="text-end">
                <button className="btn btn-outline-primary btn-sm me-2" onClick={()=>startEdit(v)}>Chỉnh sửa</button>
                <button className="btn btn-outline-danger btn-sm" onClick={()=>onDelete(v.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex gap-2">
        <button className="btn btn-light" disabled={page<=0} onClick={()=>setPage(p=>p-1)}>Trước</button>
        <button className="btn btn-light" disabled={page>=(data?.totalPages-1)} onClick={()=>setPage(p=>p+1)}>Tiếp</button>
      </div>
    </div>
  )
}
