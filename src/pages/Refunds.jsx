// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import {
//   createRefund, listRefundsByOrder,
//   approveRefund, rejectRefund, markRefundPaid
// } from '../api/refunds';

// export default function Refunds(){
//   const [sp] = useSearchParams();
//   const orderId = Number(sp.get('orderId'));   // /admin/refunds?orderId=123
//   const [list, setList] = useState([]);
//   const [amount, setAmount] = useState('');
//   const [reason, setReason] = useState('');

//   const refresh = ()=> listRefundsByOrder(orderId).then(setList);
//   useEffect(()=>{ if(orderId) refresh(); },[orderId]);

//   async function onCreate(){
//     if(!amount) return alert('Nhập số tiền');
//     await createRefund(orderId, Number(amount), reason);
//     setAmount(''); setReason(''); await refresh();
//   }

//   return (
//     <div>
//       <h3>Refunds for Order #{orderId}</h3>

//       <div className="row g-2 mb-3" style={{maxWidth:600}}>
//         <div className="col-4">
//           <input className="form-control" placeholder="Amount"
//             type="number" value={amount} onChange={e=>setAmount(e.target.value)} />
//         </div>
//         <div className="col">
//           <input className="form-control" placeholder="Reason"
//             value={reason} onChange={e=>setReason(e.target.value)} />
//         </div>
//         <div className="col-auto">
//           <button className="btn btn-primary" onClick={onCreate}>Create</button>
//         </div>
//       </div>

//       <table className="table table-sm">
//         <thead><tr><th>ID</th><th>Amount</th><th>Status</th><th>Reason</th><th>At</th><th/></tr></thead>
//         <tbody>
//         {list.map(r=>(
//           <tr key={r.id}>
//             <td>{r.id}</td>
//             <td>{(r.amount||0).toLocaleString('vi-VN')}đ</td>
//             <td><span className={`badge ${
//               r.status==='PENDING'?'bg-warning':
//               r.status==='APPROVED'?'bg-info':
//               r.status==='PAID'?'bg-success': 'bg-secondary'
//             }`}>{r.status}</span></td>
//             <td>{r.reason}</td>
//             <td>{new Date(r.createdAt).toLocaleString()}</td>
//             <td className="text-end">
//               {r.status==='PENDING' && <>
//                 <button className="btn btn-outline-success btn-sm me-1" onClick={async()=>{ await approveRefund(r.id); await refresh(); }}>Approve</button>
//                 <button className="btn btn-outline-danger btn-sm me-1"  onClick={async()=>{ await rejectRefund(r.id); await refresh(); }}>Reject</button>
//               </>}
//               {r.status==='APPROVED' &&
//                 <button className="btn btn-outline-primary btn-sm" onClick={async()=>{ await markRefundPaid(r.id); await refresh(); }}>Mark paid</button>}
//             </td>
//           </tr>
//         ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
// src/pages/Refunds.jsx
// -------------------------------
// Trang quản trị Refunds cho Admin
// -------------------------------
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createRefund,
  listRefundsByOrder,
  approveRefund,
  rejectRefund,
  markRefundPaid,
  pendingCount,
  recentPending,
} from "../api/refunds";

export default function Refunds() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const orderId = Number(sp.get("orderId"));

  // 🟡 Dashboard (khi không có orderId)
  const [pending, setPending] = useState([]);
  const [pendingBadge, setPendingBadge] = useState(0);
  const [quickOrder, setQuickOrder] = useState("");
  const [loadingDash, setLoadingDash] = useState(false);

  // 🟢 Chi tiết refund theo order
  const [list, setList] = useState([]);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  // ================== LOAD DASHBOARD ==================
  useEffect(() => {
    if (!orderId) {
      (async () => {
        setLoadingDash(true);
        try {
          const [cnt, items] = await Promise.all([pendingCount(), recentPending()]);
          setPendingBadge(cnt || 0);
          setPending(items || []);
        } finally {
          setLoadingDash(false);
        }
      })();
    }
  }, [orderId]);

  // ================== LOAD CHI TIẾT ==================
  const refresh = () => listRefundsByOrder(orderId).then(setList);
  useEffect(() => {
    if (orderId) refresh();
  }, [orderId]);

  // ================== DASHBOARD VIEW ==================
  if (!orderId) {
    return (
      <div>
        <div className="d-flex align-items-center mb-3">
          <h3 className="mb-0">Hoàn tiền</h3>
          <span className="badge bg-warning ms-3">Chờ duyệt: {pendingBadge}</span>
        </div>

        <div className="row g-2 align-items-center mb-3" style={{ maxWidth: 520 }}>
          <div className="col">
            <input
              className="form-control"
              placeholder="Đi đến Order ID hoặc Order Code"
              value={quickOrder}
              onChange={(e) => setQuickOrder(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary"
              onClick={() => {
                const v = (quickOrder || "").trim();
                if (!v) return;
                const idNum = Number(v);
                if (!Number.isNaN(idNum)) {
                  nav(`/admin/refunds?orderId=${idNum}`);
                } else {
                  nav(`/admin/orders?q=${encodeURIComponent(v)}`);
                }
              }}
            >
              Mở
            </button>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Yêu cầu hoàn tiền chờ duyệt gần đây</h6>

            {loadingDash ? (
              <div className="text-secondary">Đang tải...</div>
            ) : pending.length === 0 ? (
              <div className="text-secondary">Không có yêu cầu chờ duyệt.</div>
            ) : (
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Đơn hàng</th>
                    <th>Số tiền</th>
                    <th>Lý do</th>
                    <th>Tạo lúc</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>
                        #{r.orderId}
                        {r.orderCode ? ` · ${r.orderCode}` : ""}
                      </td>
                      <td>{(r.amount || 0).toLocaleString("vi-VN")}₫</td>
                      <td>{r.reason}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => nav(`/admin/refunds?orderId=${r.orderId}`)}
                        >
                          Mở đơn hàng
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================== DETAIL VIEW ==================
  async function onCreate() {
    if (!amount) return alert("Nhập số tiền hoàn");
    setBusy(true);
    try {
      await createRefund(orderId, Number(amount), reason);
      setAmount("");
      setReason("");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h3>Hoàn tiền cho Đơn hàng #{orderId}</h3>

      <div className="row g-2 mb-3" style={{ maxWidth: 600 }}>
        <div className="col-4">
          <input
            className="form-control"
            placeholder="Số tiền"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Lý do"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" disabled={busy} onClick={onCreate}>
            Tạo
          </button>
        </div>
      </div>

      <table className="table table-sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Số tiền</th>
            <th>Trạng thái</th>
            <th>Lý do</th>
            <th>Lúc</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{(r.amount || 0).toLocaleString("vi-VN")}₫</td>
              <td>
                <span
                  className={`badge ${
                    r.status === "PENDING"
                      ? "bg-warning"
                      : r.status === "APPROVED"
                      ? "bg-info"
                      : r.status === "PAID"
                      ? "bg-success"
                      : "bg-secondary"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td>{r.reason}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td className="text-end">
                {r.status === "PENDING" && (
                  <>
                    <button
                      className="btn btn-outline-success btn-sm me-1"
                      onClick={async () => {
                        await approveRefund(r.id);
                        await refresh();
                      }}
                    >
                      Duyệt
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={async () => {
                        await rejectRefund(r.id);
                        await refresh();
                      }}
                    >
                      Từ chối
                    </button>
                  </>
                )}
                {r.status === "APPROVED" && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={async () => {
                      await markRefundPaid(r.id);
                      await refresh();
                    }}
                  >
                    Đánh dấu đã thanh toán
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
