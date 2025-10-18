// import { useEffect, useState } from 'react'
// import { getDashboardSummary } from '../api/dashboard'

// const toNumber = v => (typeof v === 'string' ? Number(v) : (v ?? 0))
// const fmtVND = n => toNumber(n).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

// function Stat({ title, value }) {
//   return (
//     <div className="col">
//       <div className="p-3 border rounded-3 bg-white">
//         <div className="text-muted small">{title}</div>
//         <div className="fs-5 fw-bold">{value}</div>
//       </div>
//     </div>
//   )
// }

// export default function Dashboard() {
//   const [data, setData] = useState(null)
//   const [err, setErr] = useState('')

//   useEffect(() => {
//     getDashboardSummary()
//       .then(setData)
//       .catch(e => setErr(e?.response?.data?.message || e?.message || 'Load dashboard failed'))
//   }, [])

//   if (err) return <div className="alert alert-danger">{err}</div>
//   if (!data) return <div>Loading...</div>

//   const s = data.summary || {}

//   return (
//     <div>
//       <h3 className="mb-3">Dashboard</h3>

//       <div className="row g-3">
//         <Stat title="Doanh thu" value={fmtVND(s.totalRevenue)} />
//         <Stat title="Đơn đã thanh toán" value={s.totalPaidOrders ?? 0} />
//         <Stat title="Vé đã bán" value={s.totalTicketsSold ?? 0} />
//         <Stat title="Sự kiện Public" value={s.publishedEvents ?? 0} />
//         <Stat title="Sắp diễn ra" value={s.upcomingEvents ?? 0} />
//       </div>

//       <h5 className="mt-4">Doanh thu (14 ngày)</h5>
//       <ul className="small">
//         {(data.revenueByDate || []).map(p => (
//           <li key={p.date}>{p.date}: {fmtVND(p.amount)}</li>
//         ))}
//       </ul>

//       <h5 className="mt-3">Top Events</h5>
//       <ul className="small">
//         {(data.topEvents || []).map(t => (
//           <li key={t.eventId}>
//             {t.title} — {fmtVND(t.revenue)} ({t.tickets} vé)
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { getDashboardSummary } from "../api/dashboard";

// ===== Utils =====
const toNumber = (v) => (typeof v === "string" ? Number(v) : v ?? 0);
const fmtVND = (n) =>
  toNumber(n).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
const fmtInt = (n) => new Intl.NumberFormat("vi-VN").format(toNumber(n));
const truncate = (s, max = 22) =>
  s?.length > max ? s.slice(0, max - 1) + "…" : s || "";

// Màu & gradient
const PALETTE = ["#198754", "#0d6efd", "#d97706", "#7c3aed", "#ef4444"];

function Stat({ title, value, sub }) {
  return (
    <div className="col-12 col-sm-6 col-md">
      <div className="etk-card p-3 h-100">
        <div className="text-muted small">{title}</div>
        <div className="fs-5 fw-bold">{value}</div>
        {sub ? <div className="text-muted small mt-1">{sub}</div> : null}
      </div>
    </div>
  );
}

function SectionHeader({ title, right }) {
  return (
    <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
      <h5 className="m-0">{title}</h5>
      <div>{right}</div>
    </div>
  );
}

// Tooltip tùy biến cho Top Events
function TopTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const p = payload[0].payload;
    return (
      <div className="etk-tip">
        <div className="fw-semibold">{p.title}</div>
        <div className="small text-muted">ID: {p.eventId}</div>
        <div className="mt-1">
          <div>
            <span className="text-muted me-1">Doanh thu:</span>
            <span className="fw-semibold">{fmtVND(p.revenue)}</span>
          </div>
          <div>
            <span className="text-muted me-1">Vé:</span>
            <span className="fw-semibold">{fmtInt(p.tickets)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [days, setDays] = useState(14); // quick range filter
  const [topMode, setTopMode] = useState("revenue"); // 'revenue' | 'tickets'

  useEffect(() => {
    setErr("");
    setData(null);
    getDashboardSummary({ days })
      .then(setData)
      .catch((e) =>
        setErr(
          e?.response?.data?.message || e?.message || "Load dashboard failed"
        )
      );
  }, [days]);

  const s = data?.summary || {};

  // Revenue chart data
  const revenueData = useMemo(() => {
    const arr = data?.revenueByDate || [];
    return [...arr]
      .map((d) => ({ date: d.date, amount: toNumber(d.amount) }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [data]);

  // Top events (lấy top 10 theo doanh thu)
  const topEventsData = useMemo(() => {
    const arr = data?.topEvents || [];
    const prepared = [...arr]
      .map((t) => ({
        eventId: t.eventId,
        title: t.title,
        revenue: toNumber(t.revenue),
        tickets: toNumber(t.tickets),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    // thêm index để hiển thị rank/badge
    return prepared.map((x, i) => ({ ...x, _rank: i + 1 }));
  }, [data]);

  if (err) return <div className="alert alert-danger my-3">{err}</div>;
  if (!data) {
    return (
      <div className="d-flex align-items-center gap-2 my-3">
        <div className="spinner-border spinner-border-sm" role="status" />
        <span>Đang tải dashboard…</span>
      </div>
    );
  }

  const sumRevenue = revenueData.reduce((a, b) => a + b.amount, 0);

  return (
    <div>
      {/* Local CSS cho card, tip, list… */}
      <style>{`
        .etk-card {
          background: #fff;
          border: 1px solid rgba(2,8,23,.06);
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(2,8,23,.06);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .etk-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 50px rgba(2,8,23,.08);
        }
        .etk-pane {
          background: linear-gradient(180deg, #ffffff, #fbfcff);
          border: 1px solid rgba(2,8,23,.06);
          border-radius: 18px;
          box-shadow: 0 16px 50px rgba(2,8,23,.06);
        }
        .etk-pane .etk-pane-head {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom: .5rem;
        }
        .etk-tip {
          background: #111827;
          color: #fff;
          padding: .5rem .6rem;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25);
          max-width: 280px;
        }
        .etk-badge {
          display:inline-flex; align-items:center; justify-content:center;
          width: 28px; height: 28px; border-radius: 999px;
          font-weight: 700; font-size: .85rem;
          background: #eef2ff; color:#4338ca;
          border: 1px solid rgba(67,56,202,.25);
        }
        .etk-badge.top1 { background:#fff7ed; color:#b45309; border-color:#fdba74; }
        .etk-badge.top2 { background:#f0f9ff; color:#0369a1; border-color:#7dd3fc; }
        .etk-badge.top3 { background:#f0fdf4; color:#15803d; border-color:#86efac; }
        .etk-list {
          list-style: none; padding:0; margin:0;
        }
        .etk-list li {
          display:flex; align-items:center; gap:.6rem;
          padding:.5rem .25rem; border-bottom: 1px dashed rgba(2,8,23,.06);
        }
        .etk-list li:last-child { border-bottom: none; }
        .etk-pill {
          border: 1px solid rgba(2,8,23,.08);
          background: #fff; color:#111827;
        }
        .etk-pill.active {
          background: #0d6efd; color:#fff; border-color:#0d6efd;
          box-shadow: 0 8px 28px rgba(13,110,253,.25);
        }
      `}</style>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">Dashboard</h3>
        <div className="btn-group">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              className={`btn btn-sm ${
                days === d ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setDays(d)}
              title={`Xem ${d} ngày gần nhất`}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3">
        <Stat title="Doanh thu" value={fmtVND(s.totalRevenue)} />
        <Stat
          title="Đơn đã thanh toán"
          value={fmtInt(s.totalPaidOrders ?? 0)}
        />
        <Stat title="Vé đã bán" value={fmtInt(s.totalTicketsSold ?? 0)} />
        <Stat title="Sự kiện Public" value={fmtInt(s.publishedEvents ?? 0)} />
        <Stat title="Sắp diễn ra" value={fmtInt(s.upcomingEvents ?? 0)} />
      </div>

      {/* Revenue Area Chart */}
      <SectionHeader
        title={`Doanh thu (${days} ngày gần đây)`}
        right={
          <span className="text-muted small">Tổng: {fmtVND(sumRevenue)}</span>
        }
      />
      <div className="etk-pane p-3">
        {revenueData.length ? (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${Math.round(v / 1_000_000)}tr`
                      : `${Math.round(v / 1_000)}k`
                  }
                  width={56}
                />
                <Tooltip
                  formatter={(val) => [fmtVND(val), "Doanh thu"]}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Legend />
                <ReferenceLine
                  y={sumRevenue / revenueData.length || 0}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Doanh thu"
                  stroke="#0d6efd"
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-muted small">Chưa có dữ liệu doanh thu.</div>
        )}
      </div>

      {/* Top Events – đẹp & dễ đọc hơn */}
      <SectionHeader
        title="Top Events theo doanh thu"
        right={
          <div className="btn-group btn-group-sm">
            <button
              className={`btn etk-pill ${
                topMode === "revenue" ? "active" : ""
              }`}
              onClick={() => setTopMode("revenue")}
              title="Xếp theo doanh thu"
            >
              Doanh thu
            </button>
            <button
              className={`btn etk-pill ${
                topMode === "tickets" ? "active" : ""
              }`}
              onClick={() => setTopMode("tickets")}
              title="Xếp theo số vé"
            >
              Số vé
            </button>
          </div>
        }
      />

      <div className="etk-pane p-3">
        {topEventsData.length ? (
          <>
            {/* Bar ngang để tên dài vẫn gọn */}
            <div style={{ width: "100%", height: 420 }}>
              <ResponsiveContainer>
                <BarChart
                  data={[...topEventsData]
                    .sort((a, b) =>
                      topMode === "revenue"
                        ? b.revenue - a.revenue
                        : b.tickets - a.tickets
                    )
                    .map((x, i) => ({ ...x, _idx: i }))}
                  layout="vertical"
                  margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) =>
                      topMode === "revenue"
                        ? v >= 1_000_000
                          ? `${Math.round(v / 1_000_000)}tr`
                          : `${Math.round(v / 1_000)}k`
                        : fmtInt(v)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={180}
                    tickFormatter={(v) => truncate(v, 28)}
                  />
                  <Tooltip content={<TopTooltip mode={topMode} />} />
                  <Legend />
                  <defs>
                    {PALETTE.map((c, i) => (
                      <linearGradient
                        key={i}
                        id={`grad-${i}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor={c} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={c} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Bar
                    dataKey={topMode === "revenue" ? "revenue" : "tickets"}
                    name={topMode === "revenue" ? "Doanh thu" : "Vé"}
                    radius={[8, 8, 8, 8]}
                    fillOpacity={1}
                    strokeOpacity={0.8}
                    // tô màu theo rank
                    fill={(d) => `url(#grad-${d._idx % PALETTE.length})`}
                    stroke={(d) => PALETTE[d._idx % PALETTE.length]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Danh sách chi tiết dưới chart */}
            <ul className="etk-list small mt-3 mb-0">
              {[...topEventsData]
                .sort((a, b) =>
                  topMode === "revenue"
                    ? b.revenue - a.revenue
                    : b.tickets - a.tickets
                )
                .map((t, idx) => {
                  const badgeClass =
                    idx === 0
                      ? "top1"
                      : idx === 1
                      ? "top2"
                      : idx === 2
                      ? "top3"
                      : "";
                  return (
                    <li key={t.eventId}>
                      <span className={`etk-badge ${badgeClass}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{t.title}</div>
                        <div className="text-muted">
                          {fmtVND(t.revenue)} • {fmtInt(t.tickets)} vé
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </>
        ) : (
          <div className="text-muted small">Chưa có dữ liệu Top Events.</div>
        )}
      </div>
    </div>
  );
}

/* bieu do dung  */
// {/* <SectionHeader
//   title="Top Events theo doanh thu"
//   right={
//     <div className="btn-group btn-group-sm">
//       <button
//         className={`btn etk-pill ${topMode === "revenue" ? "active" : ""}`}
//         onClick={() => setTopMode("revenue")}
//         title="Xếp theo doanh thu"
//       >
//         Doanh thu
//       </button>
//       <button
//         className={`btn etk-pill ${topMode === "tickets" ? "active" : ""}`}
//         onClick={() => setTopMode("tickets")}
//         title="Xếp theo số vé"
//       >
//         Số vé
//       </button>
//     </div>
//   }
// />

// <div className="etk-pane p-3">
//   {topEventsData.length ? (
//     <>
//       <div style={{ width: "100%", height: 420 }}>
//         <ResponsiveContainer>
//           <BarChart
//             data={[...topEventsData]
//               .sort((a, b) =>
//                 topMode === "revenue" ? b.revenue - a.revenue : b.tickets - a.tickets
//               )
//               .map((x, i) => ({ ...x, _idx: i }))}
//             margin={{ top: 10, right: 16, left: 0, bottom: 40 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               dataKey="title"
//               tickFormatter={(v) => truncate(v, 16)}
//               angle={-20}
//               textAnchor="end"
//               height={48}
//             />
//             <YAxis
//               tickFormatter={(v) =>
//                 topMode === "revenue"
//                   ? v >= 1_000_000
//                     ? `${Math.round(v / 1_000_000)}tr`
//                     : `${Math.round(v / 1_000)}k`
//                   : fmtInt(v)
//               }
//               width={60}
//             />
//             <Tooltip
//               content={({ active, payload }) => {
//                 if (active && payload && payload.length) {
//                   const p = payload[0].payload;
//                   return (
//                     <div className="etk-tip">
//                       <div className="fw-semibold">{p.title}</div>
//                       <div className="small text-muted">ID: {p.eventId}</div>
//                       <div className="mt-1">
//                         <div>
//                           <span className="text-muted me-1">Doanh thu:</span>
//                           <span className="fw-semibold">{fmtVND(p.revenue)}</span>
//                         </div>
//                         <div>
//                           <span className="text-muted me-1">Vé:</span>
//                           <span className="fw-semibold">{fmtInt(p.tickets)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 }
//                 return null;
//               }}
//             />
//             <Legend />
//             <defs>
//               {PALETTE.map((c, i) => (
//                 <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor={c} stopOpacity={0.9} />
//                   <stop offset="100%" stopColor={c} stopOpacity={0.4} />
//                 </linearGradient>
//               ))}
//             </defs>
//             <Bar
//               dataKey={topMode === "revenue" ? "revenue" : "tickets"}
//               name={topMode === "revenue" ? "Doanh thu" : "Vé"}
//               radius={[8, 8, 0, 0]}
//               fillOpacity={1}
//               strokeOpacity={0.8}
//               fill={(d) => `url(#grad-${d._idx % PALETTE.length})`}
//               stroke={(d) => PALETTE[d._idx % PALETTE.length]}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Danh sách chi tiết */}
//       <ul className="etk-list small mt-3 mb-0">
//         {[...topEventsData]
//           .sort((a, b) =>
//             topMode === "revenue" ? b.revenue - a.revenue : b.tickets - a.tickets
//           )
//           .map((t, idx) => {
//             const badgeClass =
//               idx === 0 ? "top1" : idx === 1 ? "top2" : idx === 2 ? "top3" : "";
//             return (
//               <li key={t.eventId}>
//                 <span className={`etk-badge ${badgeClass}`}>{idx + 1}</span>
//                 <div className="flex-grow-1">
//                   <div className="fw-semibold">{t.title}</div>
//                   <div className="text-muted">
//                     {fmtVND(t.revenue)} • {fmtInt(t.tickets)} vé
//                   </div>
//                 </div>
//               </li>
//             );
//           })}
//       </ul>
//     </>
//   ) : (
//     <div className="text-muted small">Chưa có dữ liệu Top Events.</div>
//   )}
// </div> */}