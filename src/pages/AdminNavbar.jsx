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
          Dashboard
        </NavLink>
        <NavLink className={linkCls} to="/admin/events">
          Events
        </NavLink>
        <NavLink className={linkCls} to="/admin/orders">
          Orders
        </NavLink>
        <NavLink className={linkCls} to="/admin/checkin">
          Check-in
        </NavLink>
        <NavLink className={linkCls} to="/admin/venues">
          Venues
        </NavLink>
        <NavLink className={linkCls} to="/admin/seatmaps">
          Seat Maps
        </NavLink>
        <NavLink className={linkCls} to="/admin/coupons">
          Coupons
        </NavLink>
        <NavLink className={linkCls} to="/admin/inventory">
          Inventory
        </NavLink>

        {/* Refunds + badge */}
        <button
          className="btn btn-outline-secondary position-relative"
          onClick={() => navigate("/admin/refunds")}
          title="Refunds"
        >
          Refunds
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
          Logout
        </button>
      </div>
    </div>
  );
}
