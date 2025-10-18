import { useEffect, useState } from 'react'
import { listZonePricesByEvent, upsertZonePrice, deleteZonePrice } from '../api/zonePrices'
import { getZones } from '../api/seatmaps'
import { getTicketsByEvent } from '../api/tickets'   // bạn đã có
import { http } from '../api/http'
import { useParams } from 'react-router-dom'

export default function ZonePricing(){
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [zones, setZones] = useState([])
  const [prices, setPrices] = useState([])
  const [form, setForm] = useState({ ticketTypeId:'', seatZoneId:'', price:'' })

  // Lấy thông tin event (để biết seatMapId)
  useEffect(()=>{
    http.get(`/admin/v1/events/${eventId}`).then(r=>{
      setEvent(r.data)
      if (r.data.seatMapId) getZones(r.data.seatMapId).then(setZones)
    })
    getTicketsByEvent(Number(eventId)).then(setTickets)
    listZonePricesByEvent(Number(eventId)).then(setPrices)
  },[eventId])

  async function onSave(){
    await upsertZonePrice({
      eventId: Number(eventId),
      ticketTypeId: Number(form.ticketTypeId),
      seatZoneId: Number(form.seatZoneId),
      price: Number(form.price)
    })
    setForm({ ticketTypeId:'', seatZoneId:'', price:'' })
    setPrices(await listZonePricesByEvent(Number(eventId)))
  }

  return (
    <div>
      <h3 className="mb-3">Zone Pricing for Event #{eventId}</h3>
      <div className="mb-2 text-muted">
        Seat map: {event?.seatMapId ? event.seatMapId : <em>(chưa gán)</em>}
      </div>

      {!event?.seatMapId && <div className="alert alert-warning">
        Event chưa gán SeatMap. Hãy vào trang Events để chọn <strong>Seat Map</strong> cho event này.
      </div>}

      <div className="row g-2 mb-3">
        <div className="col-4">
          <select className="form-select" value={form.ticketTypeId}
                  onChange={e=>setForm(f=>({...f, ticketTypeId:e.target.value}))}>
            <option value="">-- Ticket type --</option>
            {tickets.map(t => <option key={t.id} value={t.id}>{t.name} ({t.price.toLocaleString()}đ)</option>)}
          </select>
        </div>
        <div className="col-4">
          <select className="form-select" value={form.seatZoneId}
                  onChange={e=>setForm(f=>({...f, seatZoneId:e.target.value}))} disabled={!zones.length}>
            <option value="">-- Zone --</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.code} - {z.name}</option>)}
          </select>
        </div>
        <div className="col-3">
          <input className="form-control" type="number" placeholder="Price (VND)"
                 value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))}/>
        </div>
        <div className="col-1 d-grid">
          <button className="btn btn-primary" onClick={onSave}
                  disabled={!form.ticketTypeId || !form.seatZoneId || !form.price}>Save</button>
        </div>
      </div>

      <table className="table table-sm">
        <thead><tr><th>Ticket Type</th><th>Zone</th><th>Price</th><th/></tr></thead>
        <tbody>
          {prices.map(p => (
            <tr key={p.id}>
              <td>{p.ticketTypeId}</td>
              <td>{p.seatZoneId}</td>
              <td>{Number(p.price).toLocaleString('vi-VN')}đ</td>
              <td className="text-end">
                <button className="btn btn-outline-danger btn-sm" onClick={async()=>{ await deleteZonePrice(p.id); setPrices(await listZonePricesByEvent(Number(eventId))) }}>
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
