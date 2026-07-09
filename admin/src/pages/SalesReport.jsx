import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import api from '../api/axios';
import { formatDate, formatPrice } from '../utils/format';

const SalesReport = () => {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/admin/product/SalesReport', { params: { page: p, limit: 8 } });
      setData(res.data);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const exportExcel = async () => {
    const orders = data?.latestOrders || [];
    if (!orders.length) {
      toast.error('No data to export');
      return;
    }

    const salesDataArray = orders.map((o) => ({
      OrderID: o.orderId,
      Customer: o.userId?.username || '',
      Date: formatDate(o.createdAt || o.orderDate),
      Total: o.billTotal,
      Payment: o.paymentOption || '',
      Discount: o.discountPrice || 0,
    }));

    try {
      const response = await api.post('/admin/product/excel', { salesDataArray }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  if (loading && !data) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Sales Report</h1>
          <p>Delivered orders and revenue analytics</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={exportExcel}>
          <Download size={16} /> Export Excel
        </button>
      </header>

      {data && (
        <>
          <div className="grid-4" style={{ marginBottom: 16 }}>
            <div className="card" style={{ padding: '1rem' }}>
              <p className="muted">Delivered Orders</p>
              <h2>{data.deliveredOrderCount}</h2>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <p className="muted">Revenue</p>
              <h2>{formatPrice(data.deliveredRevenue)}</h2>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <p className="muted">Total Discounts</p>
              <h2>{formatPrice(data.totalDiscount)}</h2>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(data.latestOrders || []).map((o) => (
                  <tr key={o._id}>
                    <td>#{o.orderId}</td>
                    <td>{o.userId?.username || '—'}</td>
                    <td>{formatDate(o.createdAt || o.orderDate)}</td>
                    <td>{o.paymentOption || '—'}</td>
                    <td>{o.billTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesReport;
