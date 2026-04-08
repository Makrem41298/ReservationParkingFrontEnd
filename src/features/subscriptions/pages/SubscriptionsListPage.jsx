import { useState, useEffect } from 'react';
import { subscriptionAPI } from '../subscriptionAPI';
import { planParkingLotAPI } from '../../planParkingLot/planParkingLotAPI';
import { useAuth } from '../../../context/AuthContext';
import { formatDate, formatCurrency } from '../../../utils/formatDate';

export default function SubscriptionsListPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [planParkingLots, setPlanParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { isClient } = useAuth();

  const [form, setForm] = useState({ planParkingLotId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [subRes, pplRes] = await Promise.all([
        subscriptionAPI.getAll(),
        planParkingLotAPI.getAll(),
      ]);
      setSubscriptions(subRes.data);
      setPlanParkingLots(pplRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await subscriptionAPI.create({ planParkingLotId: Number(form.planParkingLotId) });
      setForm({ planParkingLotId: '' });
      setShowForm(false);
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create subscription'); }
  };

  const statusStyles = {
    ACTIVE: 'bg-accent-500/10 text-accent-600',
    EXPIRED: 'bg-dark-100 text-dark-500',
    CANCELLED: 'bg-danger-500/10 text-danger-500',
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Subscriptions</h1>
          <p className="text-dark-500 mt-1">{subscriptions.length} subscriptions</p>
        </div>
        {isClient && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 cursor-pointer">
            + Subscribe
          </button>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">{error}</div>}

      {showForm && isClient && (
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-dark-800 mb-4">New Subscription</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Plan – Parking Lot</label>
              <select required value={form.planParkingLotId} onChange={(e) => setForm({ planParkingLotId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Select...</option>
                {planParkingLots.filter((p) => p.status === 'ACTIVE').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plan?.name || `Plan #${p.planId}`} — {p.parkingLot?.name || `Lot #${p.parkingLotId}`} — {formatCurrency(p.subscriptionFee)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all cursor-pointer">Subscribe</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl bg-dark-100 hover:bg-dark-200 text-dark-700 text-sm font-semibold transition-all cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Parking</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Start</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">End</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-dark-600">#{sub.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-dark-800">{sub.planParkingLot?.plan?.name || `#${sub.planParkingLotId}`}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{sub.planParkingLot?.parkingLot?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{formatDate(sub.startDate)}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{formatDate(sub.endDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[sub.status] || 'bg-dark-100 text-dark-600'}`}>{sub.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {subscriptions.length === 0 && <div className="p-8 text-center text-dark-400">No subscriptions found</div>}
      </div>
    </div>
  );
}
