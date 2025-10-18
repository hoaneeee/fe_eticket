import { useEffect, useRef, useState } from 'react'
import { listVenues } from '../api/venues'
import { uploadSeatMap, getSeatMapsByVenue, getZones, createZone, deleteZone } from '../api/seatmaps'

export default function SeatMapEditor(){
  const [venues, setVenues] = useState([])
  const [venueId, setVenueId] = useState('')
  const [maps, setMaps] = useState([])
  const [mapId, setMapId] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [zones, setZones] = useState([])
  const [form, setForm] = useState({ code:'', name:'', capacity:'', polygon:'' })

  // polygon drawing
  const imgRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [points, setPoints] = useState([])

useEffect(() => {
  console.log("[SeatMapEditor] mount → listVenues");
  listVenues(0, 100)
    .then((d) => {
      console.log("[SeatMapEditor] venues", d);
      setVenues(d.content || []);
    })
    .catch((e) => console.error("[SeatMapEditor] venues error", e));
}, []);

useEffect(() => {
  console.log("[SeatMapEditor] venueId =", venueId);
  if (!venueId) {
    setMaps([]);
    setMapId("");
    setMapUrl("");
    setZones([]);
    return;
  }
  getSeatMapsByVenue(venueId)
    .then((ms) => {
      console.log("[SeatMapEditor] maps", ms);
      setMaps(ms);
    })
    .catch((e) => console.error("[SeatMapEditor] maps error", e));
}, [venueId]);
////////////////////////////////////////////////////////////
  useEffect(()=>{
    if(!mapId){ setMapUrl(''); setZones([]); return }
    const m = maps.find(x=>x.id===Number(mapId))
    setMapUrl(m?.svgPath || '')
    getZones(mapId).then(setZones)
  },[mapId, maps])

  async function onUploadSvg(e){
    const f = e.target.files?.[0]
    if(!f || !venueId) return
    const name = prompt('Tên seat map? (ví dụ: Sảnh A)') || ''
    await uploadSeatMap(Number(venueId), f, name)
    const ms = await getSeatMapsByVenue(Number(venueId)); setMaps(ms)
  }

  function onImgClick(ev){
    if(!drawing || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = Math.round(ev.clientX - rect.left)
    const y = Math.round(ev.clientY - rect.top)
    setPoints(ps => [...ps, {x,y}])
  }

  function finishPolygon(){
    const poly = points.map(p=>`${p.x},${p.y}`).join(' ')
    setForm(f=>({...f, polygon: poly}))
    setDrawing(false); setPoints([])
  }

  async function onAddZone(){
    if(!mapId) return
    const body = {
      code: form.code,
      name: form.name,
      capacity: form.capacity ? Number(form.capacity) : null,
      polygon: form.polygon
    }
    await createZone(Number(mapId), body)
    setForm({ code:'', name:'', capacity:'', polygon:'' })
    setZones(await getZones(Number(mapId)))
  }

  return (
    <div>
      <h3 className="mb-3">Seat Map Editor</h3>

      <div className="row g-2 mb-3">
        <div className="col-4">
          <select className="form-select" value={venueId} onChange={e=>setVenueId(e.target.value)}>
            <option value="">-- Chọn Venue --</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="col-4">
          <select className="form-select" value={mapId} onChange={e=>setMapId(e.target.value)}>
            <option value="">-- Chọn SeatMap --</option>
            {maps.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="col-4">
          <input className="form-control" type="file" accept=".svg" disabled={!venueId} onChange={onUploadSvg}/>
        </div>
      </div>

   {mapUrl && (
  <>
    <div className="mb-2">
      Nhấn “Vẽ polygon”, rồi click lên ảnh để lấy điểm. Xong bấm “Finish polygon”.
    </div>

    <div
      className="mb-3 position-relative border"
      style={{ width: "100%", maxWidth: "1000px" }}
      onClick={onImgClick}
    >
      {/* Ảnh nền */}
      <img
        ref={imgRef}
        src={mapUrl}
        alt="seatmap"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />

      {/* Overlay điểm đang vẽ */}
      {points.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x - 3,
            top: p.y - 3,
            width: 6,
            height: 6,
            background: "#0d6efd",
            borderRadius: "50%",
            pointerEvents: "none", // để không cản click chuột
          }}
        />
      ))}
    </div>

    <div className="mb-3 d-flex gap-2">
      <button
        className={`btn ${drawing ? "btn-secondary" : "btn-outline-primary"}`}
        onClick={() => {
          setDrawing((d) => !d);
          setPoints([]);
        }}
      >
        {drawing ? "Đang vẽ… (click trên ảnh)" : "Vẽ polygon"}
      </button>
      {drawing && (
        <button className="btn btn-primary" onClick={finishPolygon}>
          Finish polygon
        </button>
      )}
    </div>
  </>
)}


      <div className="row g-2 mb-3">
        <div className="col-2"><input className="form-control" placeholder="Code" value={form.code}
              onChange={e=>setForm(f=>({...f,code:e.target.value}))}/></div>
        <div className="col-3"><input className="form-control" placeholder="Name" value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
        <div className="col-2"><input className="form-control" type="number" placeholder="Capacity" value={form.capacity}
              onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}/></div>
        <div className="col-5"><input className="form-control" placeholder="Polygon (x,y ...)" value={form.polygon}
              onChange={e=>setForm(f=>({...f,polygon:e.target.value}))}/></div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-primary" onClick={onAddZone}
                  disabled={!form.code || !form.name || !form.polygon || !mapId}>
            Add Zone
          </button>
        </div>
      </div>

      <table className="table table-sm align-middle">
        <thead><tr><th>Code</th><th>Name</th><th>Capacity</th><th>Polygon</th><th/></tr></thead>
        <tbody>
          {zones.map(z=>(
            <tr key={z.id}>
              <td>{z.code}</td>
              <td>{z.name}</td>
              <td>{z.capacity ?? '-'}</td>
              <td className="small text-muted" style={{maxWidth:320, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{z.polygon}</td>
              <td className="text-end">
                <button className="btn btn-outline-danger btn-sm" onClick={async()=>{ await deleteZone(z.id); setZones(await getZones(Number(mapId))) }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
