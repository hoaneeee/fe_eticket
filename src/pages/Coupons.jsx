import { useEffect, useState } from 'react'
import { listCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../api/coupons'

// util: FE nhập local -> gửi ISO (UTC); khi nhận ISO -> hiển thị local
const toISO = (local) => local ? new Date(local).toISOString() : null
const fromISO = (iso) => {
  if (!iso) return ''
  // to "YYYY-MM-DDTHH:mm" theo local timezone (phù hợp input datetime-local)
  const d = new Date(iso)
  const pad = (n)=> String(n).padStart(2,'0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Coupons(){
  const [list,setList] = useState([])
  const [editingId,setEditingId] = useState(null)
  const [form,setForm] = useState({
    code:'SALE10', type:'PERCENT', value:10,
    startAt:'', endAt:'', maxUse:'', perUserLimit:''
  })

  const refresh = ()=> listCoupons().then(setList)
  useEffect(()=>{ refresh() },[])

  async function onSave(){
    const body = {
      code: form.code?.trim(),
      type: form.type,
      value: Number(form.value),
      startAt: toISO(form.startAt),
      endAt:   toISO(form.endAt),
      maxUse: form.maxUse===''? null : Number(form.maxUse),
      perUserLimit: form.perUserLimit===''? null : Number(form.perUserLimit),
    }
    if (editingId) await updateCoupon(editingId, body)
    else           await createCoupon(body)
    setEditingId(null)
    setForm({ code:'', type:'PERCENT', value:10, startAt:'', endAt:'', maxUse:'', perUserLimit:'' })
    refresh()
  }

  function onEdit(c){
    setEditingId(c.id)
    setForm({
      code: c.code, type: c.type, value: c.value,
      startAt: fromISO(c.startAt), endAt: fromISO(c.endAt),
      maxUse: c.maxUse ?? '', perUserLimit: c.perUserLimit ?? ''
    })
  }

  return (
    <div>
      <h3>Coupons</h3>
      <div className="row g-2 mb-3">
        <div className="col-2">
          <input className="form-control" placeholder="CODE"
            value={form.code||''}
            onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))}/>
        </div>

        <div className="col-2">
          <select className="form-select" value={form.type}
            onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
            <option value="PERCENT">% Percent</option>
            <option value="AMOUNT">Amount (VND)</option>
          </select>
        </div>

        <div className="col-2">
          <input type="number" className="form-control" placeholder="Value"
            value={form.value||0}
            onChange={e=>setForm(f=>({...f,value:Number(e.target.value)}))}/>
        </div>

        {/* Start / End at */}
        <div className="col-2">
          <input type="datetime-local" className="form-control"
            value={form.startAt}
            onChange={e=>setForm(f=>({...f,startAt:e.target.value}))}/>
        </div>
        <div className="col-2">
          <input type="datetime-local" className="form-control"
            value={form.endAt}
            onChange={e=>setForm(f=>({...f,endAt:e.target.value}))}/>
        </div>

        <div className="col-1">
          <input type="number" className="form-control" placeholder="Max use"
            value={form.maxUse}
            onChange={e=>setForm(f=>({...f,maxUse:e.target.value}))}/>
        </div>
        <div className="col-1">
          <input type="number" className="form-control" placeholder="Per user"
            value={form.perUserLimit}
            onChange={e=>setForm(f=>({...f,perUserLimit:e.target.value}))}/>
        </div>

        <div className="col"><button className="btn btn-primary" onClick={onSave}>
          {editingId ? 'Update':'Create'}</button></div>
      </div>

      <table className="table table-sm">
        <thead><tr>
          <th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Start</th><th>End</th><th/></tr></thead>
        <tbody>
          {list.map(c=>(
            <tr key={c.id}>
              <td>{c.code}</td>
              <td>{c.type}</td>
              <td>{c.value}</td>
              <td>{c.used}</td>
              <td>{fromISO(c.startAt)}</td>
              <td>{fromISO(c.endAt)}</td>
              <td className="text-end">
                <button className="btn btn-outline-primary btn-sm me-2" onClick={()=>onEdit(c)}>Edit</button>
                <button className="btn btn-outline-danger btn-sm" onClick={async()=>{await deleteCoupon(c.id); refresh()}}>Delete</button>
                <button className="btn btn-outline-secondary btn-sm ms-2"
                  onClick={async()=>{ const r = await validateCoupon(c.code); alert('OK: '+JSON.stringify(r.coupon)) }}>
                  Validate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
