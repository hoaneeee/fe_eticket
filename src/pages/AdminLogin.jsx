import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogin } from "../api/auth";
import { useAuth } from "../store/auth";

export default function AdminLogin() {
  const nav = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const toastRef = useRef(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { token } = await adminLogin(email.trim(), password);
      setToken(token);
      nav("/admin", { replace: true });
    } catch (ex) {
      const msg =
        ex?.msg ||
        (ex?.raw?.code === "ERR_NETWORK"
          ? "Không kết nối được Backend (ECONNREFUSED)"
          : ex?.raw?.message) ||
        "Đăng nhập thất bại";
      setErr(msg);
      const toastEl = toastRef.current;
      if (toastEl && window.bootstrap?.Toast) {
        new window.bootstrap.Toast(toastEl).show();
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = "Admin Login • E-Ticket";
  }, []);

  return (
    <div className="auth-wrap">
      {/* Toast lỗi */}
      <div className="toast-container position-fixed top-0 end-0 p-3">
        <div
          ref={toastRef}
          className="toast align-items-center text-bg-danger border-0"
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">{err}</div>
            <button
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>

      <div className="auth-card row g-0">
        {/* Left illustration / brand */}
        <div className="col-lg-6 p-4 p-md-5 auth-side d-none d-lg-block">
          <div className="d-flex align-items-center gap-3">
            <div className="brand-badge">
              <i className="bi bi-ticket-perforated-fill fs-4"></i>
            </div>
            <div>
              <div className="fw-bold fs-5 mb-0">E-Ticket Admin</div>
              <div className="small-muted">Quản trị sự kiện & bán vé</div>
            </div>
          </div>

          <div className="mt-5">
            <h2 className="fw-bold mb-3">Chào mừng trở lại 👋</h2>
            <p className="small-muted mb-0">
              Đăng nhập để truy cập dashboard, quản lý sự kiện, loại vé, đơn
              hàng & check-in.
            </p>
          </div>

          <div className="mt-5">
            <div className="d-flex align-items-center gap-3 small-muted">
              <i className="bi bi-shield-lock-fill"></i>
              Bảo mật JWT • Phiên làm việc
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="col-12 col-lg-6 p-4 p-md-5 bg-white">
          <div className="d-lg-none mb-4 d-flex align-items-center gap-2">
            <div className="brand-badge">
              <i className="bi bi-ticket-perforated-fill fs-5"></i>
            </div>
            <span className="fw-bold">E-Ticket Admin</span>
          </div>

          <h4 className="fw-bold mb-3">Đăng nhập</h4>
          <p className="small-muted mb-4">Sử dụng tài khoản quản trị ADMIN</p>

          <form className="vstack gap-3" onSubmit={onSubmit} noValidate>
            <div className="form-floating">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email">
                <i className="bi bi-envelope me-2"></i>Email
              </label>
            </div>

            <div className="input-group">
              <div className="form-floating flex-grow-1">
                <input
                  type={showPw ? "text" : "password"}
                  className="form-control"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="password">
                  <i className="bi bi-lock-fill me-2"></i>Mật khẩu
                </label>
              </div>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowPw((s) => !s)}
                title={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                  defaultChecked
                />
                <label
                  className="form-check-label small-muted"
                  htmlFor="remember"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a className="small" href="#" onClick={(e) => e.preventDefault()}>
                Quên mật khẩu?
              </a>
            </div>

            <button className="btn btn-brand w-100 py-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang đăng nhập…
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <div className="text-center">
              <Link to="/" className="small">
                ← Về trang chủ
              </Link>
            </div>
          </form>

          <hr className="my-4" />
          <div className="small-muted">
            Demo: <code>admin@eticket.com</code> / <code>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
