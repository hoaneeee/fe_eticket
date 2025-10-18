// src/pages/Events.jsx
import { useEffect, useState } from 'react'
import { listEvents, createEvent, updateEvent, deleteEvent } from '../api/events'
import { listVenues } from '../api/venues'
import { getSeatMapsByVenue } from '../api/seatmaps'   // <-- THÊM
import { Link } from 'react-router-dom'
import { uploadFile } from '../api/uploadFile'

export default function Events() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)

  const [venues, setVenues] = useState([])
  const [seatMaps, setSeatMaps] = useState([])          // <-- THÊM
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    title: '', slug: '',
    eventDate: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    venueId: '', seatMapId: '',                       // <-- THÊM seatMapId
    status: 'PUBLISHED',
    bannerUrl:'', description:''
  })

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await listEvents(page, 10)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [page])

  useEffect(() => {
    listVenues(0, 100).then(d => setVenues(d.content || []))
  }, [])

  // Khi đổi venue → load danh sách seat map, reset seatMapId
  useEffect(() => {
    const vId = Number(form.venueId) || null
    if (!vId) {
      setSeatMaps([])
      setForm(f => ({ ...f, seatMapId: '' }))
      return
    }
    getSeatMapsByVenue(vId).then(setSeatMaps)
  }, [form.venueId])

  function resetForm(){
    setForm({
      title:'', slug:'',
      eventDate:new Date().toISOString().slice(0,16),
      venueId:'', seatMapId:'',
      status:'PUBLISHED',
      bannerUrl:'', description:''
    })
    setEditingId(null)
  }

  async function onSave(){
    const body = {
      title: form.title?.trim(),
      slug: form.slug?.trim() || null,
      eventDate: new Date(form.eventDate).toISOString(),
      venueId: form.venueId ? Number(form.venueId) : null,
      seatMapId: form.seatMapId ? Number(form.seatMapId) : null,
      status: form.status,
      bannerUrl: form.bannerUrl?.trim() || null,
      description: form.description?.trim() || null
    }
    if (!body.title) { alert('Title required'); return }

    if (editingId) await updateEvent(editingId, body)
    else await createEvent(body)

    resetForm(); refresh()
  }

  function startEdit(e){
    setEditingId(e.id)
    setForm({
      title: e.title || '',
      slug: e.slug || '',
      // e.eventDate là ISO → đưa về datetime-local
      eventDate: e.eventDate ? new Date(e.eventDate).toISOString().slice(0,16) : new Date().toISOString().slice(0,16),
      venueId: e.venueId || '',
      seatMapId: e.seatMapId || '',   // <-- giữ seatMapId khi edit
      status: e.status || 'PUBLISHED',
      bannerUrl: e.bannerUrl || '',
      description: e.description || ''
    })
  }

  return (
    <div>
      <h3 className="mb-3">Events</h3>

      {/* Form */}
      <div className="row g-2 mb-3">
        <div className="col">
          <input className="form-control" placeholder="Title"
                 value={form.title}
                 onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
        </div>
        <div className="col">
          <input className="form-control" placeholder="Slug"
                 value={form.slug}
                 onChange={e=>setForm(f=>({...f,slug:e.target.value}))}/>
        </div>
        <div className="col">
          <input className="form-control" type="datetime-local"
                 value={form.eventDate}
                 onChange={e=>setForm(f=>({...f,eventDate:e.target.value}))}/>
        </div>

        {/* Venue select */}
        <div className="col">
          <select className="form-select"
                  value={form.venueId}
                  onChange={e=>setForm(f=>({...f, venueId:e.target.value}))}>
            <option value="">-- Venue --</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        {/* SeatMap select (theo venue) */}
        <div className="col">
          <select className="form-select"
                  value={form.seatMapId}
                  onChange={e=>setForm(f=>({...f, seatMapId:e.target.value}))}
                  disabled={!form.venueId || !seatMaps.length}>
            <option value="">{form.venueId ? '-- Seat Map --' : 'Chọn Venue trước'}</option>
            {seatMaps.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div className="col">
          <select className="form-select" value={form.status}
                  onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Banner upload + URL */}
        <div className="col-12 col-md">
          <div className="input-group">
            <input className="form-control" placeholder="Banner URL"
                   value={form.bannerUrl}
                   onChange={e=>setForm(f=>({...f,bannerUrl:e.target.value}))}/>
            <input type="file" className="form-control" accept="image/*"
                   onChange={async (e)=>{
                     const f = e.target.files?.[0]
                     if(!f) return
                     const { url } = await uploadFile(f)
                     setForm(prev => ({ ...prev, bannerUrl: url }))
                   }}/>
          </div>
          {form.bannerUrl && (
            <div className="mt-2">
              <img src={form.bannerUrl} alt="banner" style={{height:60}} />
              <small className="text-muted ms-2">{form.bannerUrl}</small>
            </div>
          )}
        </div>

        <div className="col-12">
          <input className="form-control" placeholder="Description"
                 value={form.description}
                 onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
        </div>

        <div className="col-12 col-md-auto d-grid">
          <button className="btn btn-primary" onClick={onSave}>{editingId?'Update':'Create'}</button>
          {editingId && <button className="btn btn-secondary mt-2" onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      {/* List */}
      <div className="d-flex align-items-center gap-2 mb-2">
        {loading && <span className="small text-muted">Loading…</span>}
      </div>

      <table className="table table-sm align-middle">
        <thead><tr>
          <th>ID</th><th>Title</th><th>Date</th><th>Venue</th><th>SeatMap</th><th>Status</th><th/>
        </tr></thead>
        <tbody>
        {data?.content?.map(e=>(
          <tr key={e.id}>
            <td>{e.id}</td>
            <td>{e.title}</td>
            <td>{e.eventDate ? new Date(e.eventDate).toLocaleString() : '-'}</td>
            <td>{e.venueName || e.venueId || '-'}</td>
            <td>{e.seatMapId || <span className="text-muted">-</span>}</td>
            <td><span className={`badge ${
              e.status==='PUBLISHED'?'bg-success':e.status==='DRAFT'?'bg-secondary':'bg-danger'
            }`}>{e.status}</span></td>
            <td className="text-end">
              <Link className="btn btn-outline-secondary btn-sm me-2" to={`/admin/tickets/${e.id}`}>Tickets</Link>
              <Link className="btn btn-outline-warning btn-sm me-2" to={`/admin/events/${e.id}/zone-pricing`}>Zone Pricing</Link>
              <button className="btn btn-outline-primary btn-sm me-2" onClick={()=>startEdit(e)}>Edit</button>
              <button className="btn btn-outline-danger btn-sm" onClick={async()=>{ await deleteEvent(e.id); refresh() }}>Delete</button>
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
