import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "../api/orders";

export default function OrderDetails() {
  const { code } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const currency = (n) => Number(n).toLocaleString("vi-VN") + "đ";

  useEffect(() => {
    setLoading(true);
    getOrder(code)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div>Đang tải...</div>;
  if (!order)
    return (
      <div>
        Không tìm thấy đơn hàng.
        <div className="mt-2">
          <Link to="/admin/orders" className="btn btn-light">
            Quay lại
          </Link>
        </div>
      </div>
    );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Chi tiết đơn hàng {order.code}</h3>
        <Link to="/admin/orders" className="btn btn-light">
          Quay lại
        </Link>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div>
                <strong>Trạng thái:</strong> {order.status}
              </div>
              <div>
                <strong>Tổng tiền:</strong> {currency(order.total)}
              </div>
              <div>
                <strong>PT thanh toán:</strong> {order.paymentMethod ?? "-"}
              </div>
              <div>
                <strong>Thời gian tạo:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div>
                <strong>Sự kiện:</strong> {order.eventName ?? "-"}
              </div>
              <div>
                <strong>Khách hàng:</strong> {order.userEmail ?? "Guest"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mt-4">Vé / Hạng vé</h5>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Ticket Type</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tạm tính</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((it, idx) => (
            <tr key={idx}>
              <td>{it.ticketName}</td>
              <td>{currency(it.price)}</td>
              <td>{it.qty}</td>
              <td>{currency(Number(it.price) * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
