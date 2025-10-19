import { useState } from 'react'
import { checkin } from '../api/checkin'

export default function Checkin(){
  const [code,setCode] = useState('')
  const [msg,setMsg] = useState(null)

  async function onCheck(){
    setMsg(null)
    try{
      const data = await checkin(code)
      setMsg(`✅ OK: đã quét lúc ${data.scannedAt}`)
      setCode('') // clear input if success
    }catch(ex){
      setMsg(ex?.response?.data?.message || '❌ Check-in thất bại')
    }
  }

  return (
    <div>
      <h3>Check-in</h3>
      <div className="input-group" style={{maxWidth:420}}>
        <input className="form-control" placeholder="Quét hoặc nhập mã"
               value={code} onChange={e=>setCode(e.target.value)} />
        <button className="btn btn-primary" onClick={onCheck}>Kiểm tra</button>
      </div>
      {msg && <div className="mt-3 alert alert-info">{msg}</div>}
    </div>
  )
}
