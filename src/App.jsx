// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Orders from "./pages/Orders";
import Tickets from "./pages/Tickets";
import Checkin from "./pages/Checkin";
import Venues from "./pages/Venues";
import SeatMapEditor from "./pages/SeatMapEditor";
import ZonePricing from "./pages/ZonePricing";
import Coupons from "./pages/Coupons";
import Refunds from "./pages/Refunds";
import InventoryConfig from "./pages/InventoryConfigs";
import { useAuth } from "./store/auth";
import AdminNavbar from "./pages/AdminNavbar";
import OrderDetails from "./pages/OrderDetails";

function Protected() {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

function AdminLayout() {
  return (
    <div className="container py-3">
      <AdminNavbar /> {/* ⬅️ NAVBAR mới có badge Refunds */}
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<Protected />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/events" element={<Events />} />
            <Route path="/admin/tickets/:eventId" element={<Tickets />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/checkin" element={<Checkin />} />
            <Route path="/admin/venues" element={<Venues />} />
            <Route path="/admin/seatmaps" element={<SeatMapEditor />} />
            <Route
              path="/admin/events/:eventId/zone-pricing"
              element={<ZonePricing />}
            />
            <Route path="/admin/coupons" element={<Coupons />} />
            <Route path="/admin/inventory" element={<InventoryConfig />} />
            <Route path="/admin/refunds" element={<Refunds />} />
            <Route path="/admin/orders/:code" element={<OrderDetails />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
