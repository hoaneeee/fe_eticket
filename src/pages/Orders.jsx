import { useEffect, useState } from "react";
import { listOrders } from "../api/orders";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    listOrders(page, 10)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const currency = (n) => Number(n).toLocaleString("vi-VN") + "đ";

  return (
    <div>
      <h3>Đơn hàng</h3>

      {loading && <div>Đang tải...</div>}

      {!loading && (
        <>
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
                <th>Tạo lúc</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data?.content?.map((o) => (
                <tr key={o.id}>
                  <td>{o.code}</td>
                  <td>{currency(o.total)}</td>
                  <td>{o.status}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-secondary btn-sm me-1"
                      onClick={() => navigate(`/admin/orders/${o.code}`)}
                    >
                      Xem chi tiết
                    </button>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate(`/admin/refunds?orderId=${o.id}`)}
                    >
                      Hoàn tiền
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex gap-2">
            <button
              className="btn btn-light"
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>
            <button
              className="btn btn-light"
              disabled={page >= (data?.totalPages ?? 1) - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Tiếp
            </button>
          </div>
        </>
      )}
    </div>
  );
}
