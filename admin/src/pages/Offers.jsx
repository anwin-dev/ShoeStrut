import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Percent } from 'lucide-react';
import api from '../api/axios';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/categoryOffer')
      .then(({ data }) => setOffers(data.data?.offerList || []))
      .catch(() => toast.error('Failed to load offers'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Category Offers</h1>
          <p>Manage promotional offers per category</p>
        </div>
      </header>

      {loading ? (
        <div className="skeleton" style={{ height: 260 }} />
      ) : offers.length === 0 ? (
        <div className="empty-state card"><h3>No categories for offers</h3></div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Offer Period</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o._id}>
                  <td>{o.name}</td>
                  <td>{o.discount ? `${o.discount}%` : '—'}</td>
                  <td>
                    <span className={`badge ${o.catOfferStatus === 'Active' ? 'badge-success' : 'badge-muted'}`}>
                      {o.catOfferStatus || 'None'}
                    </span>
                  </td>
                  <td>
                    {o.OfferStartDate && o.OfferStartDate !== 'false'
                      ? `${o.OfferStartDate} → ${o.OfferEndDate}`
                      : '—'}
                  </td>
                  <td>
                    <Link to={`/offers/${o._id}`} className="btn btn-sm btn-outline">
                      <Percent size={14} /> Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Offers;
