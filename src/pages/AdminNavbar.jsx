// src/pages/AdminNavbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../store/auth";
import { pendingCount } from "../api/refunds";

export default function AdminNavbar() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const lastCount = useRef(0);

  const linkCls = ({ isActive }) =>
    `btn ${isActive ? "btn-primary" : "btn-outline-secondary"}`;

  useEffect(() => {
    let timer;
    const tick = async () => {
      try {
        const c = await pendingCount(); // GET /api/admin/v1/refunds/pending-count
        setCount(c);
        if (c > lastCount.current) {
          // Có yêu cầu mới → bạn có thể thay alert bằng toast lib nếu có
          console.log(`Refund mới: +${c - lastCount.current}`);
        }
        lastCount.current = c;
      } catch (e) {
        console.warn("pendingCount failed", e);
      } finally {
        timer = setTimeout(tick, 15000);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="m-0">E-Ticket Admin</h4>
      <div className="d-flex gap-2 align-items-center">
        <NavLink className={linkCls} to="/admin">
          Bảng điều khiển
        </NavLink>
        <NavLink className={linkCls} to="/admin/events">
          Sự kiện
        </NavLink>
        <NavLink className={linkCls} to="/admin/orders">
          Đơn hàng
        </NavLink>
        <NavLink className={linkCls} to="/admin/checkin">
          Check-in
        </NavLink>
        <NavLink className={linkCls} to="/admin/venues">
          Địa điểm
        </NavLink>
        <NavLink className={linkCls} to="/admin/seatmaps">
          Sơ đồ chỗ ngồi
        </NavLink>
        <NavLink className={linkCls} to="/admin/coupons">
          Phiếu giảm giá
        </NavLink>
        <NavLink className={linkCls} to="/admin/inventory">
          Kho hàng
        </NavLink>

        {/* Refunds + badge */}
        <button
          className="btn btn-outline-secondary position-relative"
          onClick={() => navigate("/admin/refunds")}
          title="Hoàn tiền"
        >
          Hoàn tiền
          {count > 0 && (
            <span
              className="badge rounded-pill bg-danger ms-2"
              data-testid="refunds-badge"
            >
              {count}
            </span>
          )}
        </button>

        <button
          className="btn btn-outline-danger"
          onClick={() => setToken(null)}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
