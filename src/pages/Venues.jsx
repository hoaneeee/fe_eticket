import { useEffect, useState } from 'react'
import { listVenues, createVenue, updateVenue, deleteVenue } from '../api/venues'

export default function Venues(){
  const [page,setPage] = useState(0)
  const [data,setData] = useState(null)
  const [editingId,setEditingId] = useState(null)
  const [form,setForm] = useState({ name:'', address:'', capacity:'', imageUrl:'', description:'' })

  const refresh = ()=> listVenues(page, 10).then(setData)
  useEffect(()=>{ refresh() },[page])

  function reset(){ setForm({ name:'', address:'', capacity:'', imageUrl:'', description:'' }); setEditingId(null) }

  async function onSave(){
    const body = { ...form, capacity: form.capacity ? Number(form.capacity) : null }
    if (editingId) await updateVenue(editingId, body)
    else await createVenue(body)
    reset(); refresh()
  }

  function startEdit(v){ setEditingId(v.id); setForm({
    name:v.name, address:v.address, capacity:v.capacity||'', imageUrl:v.imageUrl||'', description:v.description||''
  }) }

  return (
    <div>
      <h3 className="mb-3">Venues</h3>

      <div className="row g-2 mb-3">
        <div className="col-3"><input className="form-control" placeholder="Name"
          value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
        <div className="col-4"><input className="form-control" placeholder="Address"
          value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
        <div className="col-2"><input className="form-control" type="number" placeholder="Capacity"
          value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}/></div>
        <div className="col-3"><input className="form-control" placeholder="Image URL"
          value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))}/></div>
        <div className="col-10"><input className="form-control" placeholder="Description"
          value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
        <div className="col-2 d-grid">
          <button className="btn btn-primary" onClick={onSave}>{editingId?'Update':'Add'}</button>
          {editingId && <button className="btn btn-secondary mt-2" onClick={reset}>Cancel</button>}
        </div>
      </div>

      <table className="table table-sm align-middle">
        <thead><tr><th>Name</th><th>Address</th><th>Capacity</th><th/></tr></thead>
        <tbody>
          {data?.content?.map(v=>(
            <tr key={v.id}>
              <td>{v.name}</td>
              <td>{v.address}</td>
              <td>{v.capacity ?? '-'}</td>
              <td className="text-end">
                <button className="btn btn-outline-primary btn-sm me-2" onClick={()=>startEdit(v)}>Edit</button>
                <button className="btn btn-outline-danger btn-sm" onClick={async()=>{ await deleteVenue(v.id); refresh() }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex gap-2">
        <button className="btn btn-light" disabled={page<=0} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <button className="btn btn-light" disabled={page>=(data?.totalPages-1)} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  )
}
