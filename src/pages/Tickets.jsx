import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTicketsByEvent, createTicket, updateTicket, deleteTicket } from '../api/tickets'

export default function Tickets() {
  const id = Number(useParams().eventId)
  const [list, setList] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    eventId: id,
    name: 'Standard',
    price: 150000,
    quota: 100
  })

  const refresh = () => getTicketsByEvent(id).then(setList)
  useEffect(() => { refresh() }, [id])

  // Reset form
  function resetForm() {
    setForm({ eventId: id, name: 'Standard', price: 150000, quota: 100 })
    setEditingId(null)
  }

  async function onSave() {
    if (editingId) {
      // UPDATE
      await updateTicket(editingId, form)
    } else {
      // CREATE
      await createTicket(form)
    }
    resetForm()
    await refresh()
  }

  function startEdit(ticket) {
    setForm({
      eventId: id,
      name: ticket.name,
      price: ticket.price,
      quota: ticket.quota
    })
    setEditingId(ticket.id)
  }

  return (
    <div>
      <h3>Vé của Sự kiện #{id}</h3>
      <div className="row g-2 mb-3">
        <div className="col-4">
          <input className="form-control" placeholder="Tên"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="col-3">
          <input className="form-control" type="number" placeholder="Giá"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
        </div>
        <div className="col-3">
          <input className="form-control" type="number" placeholder="Hạn ngạch"
            value={form.quota}
            onChange={e => setForm(f => ({ ...f, quota: Number(e.target.value) }))} />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={onSave}>
            {editingId ? 'Cập nhật' : 'Thêm'}
          </button>
          {editingId && (
            <button className="btn btn-secondary ms-2" onClick={resetForm}>
              Hủy
            </button>
          )}
        </div>
      </div>

      <table className="table table-sm">
        <thead>
          <tr><th>Tên</th><th>Giá</th><th>Hạn ngạch</th><th>Đã bán</th><th /></tr>
        </thead>
        <tbody>
          {list.map(t => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.price.toLocaleString('vi-VN')}đ</td>
              <td>{t.quota}</td>
              <td>{t.sold}</td>
              <td className="text-end">
                <button className="btn btn-outline-primary btn-sm me-2" onClick={() => startEdit(t)}>Chỉnh sửa</button>
                <button className="btn btn-outline-danger btn-sm" onClick={async () => { await deleteTicket(t.id); await refresh() }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
