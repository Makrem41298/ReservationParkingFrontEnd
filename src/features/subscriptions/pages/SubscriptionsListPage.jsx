import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionAPI } from '../subscriptionAPI';
import { planParkingLotAPI } from '../../planParkingLot/planParkingLotAPI';
import { parkingLotAPI } from '../../parkingLot/parkingLotAPI';
import { useAuth } from '../../../context/AuthContext';
import { formatDate, formatCurrency } from '../../../utils/formatDate';

export default function SubscriptionsListPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [planParkingLots, setPlanParkingLots] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { isClient } = useAuth();

  const [form, setForm] = useState({ planParkingLotId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [subRes, pplRes, parkRes] = await Promise.all([
        subscriptionAPI.getAll(),
        planParkingLotAPI.getAll(),
        parkingLotAPI.getAll(),
      ]);
      setSubscriptions(subRes.data);
      setPlanParkingLots(pplRes.data);
      setParkingLots(parkRes.data);
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

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await subscriptionAPI.updateStatus(id, newStatus);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const statusStyles = {
    ACTIVE: 'bg-accent-500/10 text-accent-600',
    EXPIRED: 'bg-dark-100 text-dark-500',
    CANCELLED: 'bg-danger-500/10 text-danger-500',
    CANCELED: 'bg-danger-500/10 text-danger-500',
    SUSPENDED: 'bg-warning-500/10 text-warning-600',
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
          <Link to="/parkings" className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 cursor-pointer flex items-center justify-center text-center">
            + Subscribe
          </Link>
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
                <th className="text-right px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {subscriptions.map((sub) => {
                const ppl = planParkingLots.find(p => p.id === sub.planParkingLotId) || sub.planParkingLot;
                const parking = parkingLots.find(p => p.id === ppl?.parkingLotId) || ppl?.parkingLot;
                const planName = ppl?.plan?.name || `#${sub.planParkingLotId}`;
                const parkingName = parking?.name || '—';

                return (
                <tr key={sub.id} className={`transition-colors ${sub.status === 'CANCELED' || sub.status === 'CANCELLED' ? 'bg-dark-100 opacity-40 grayscale' : 'hover:bg-dark-50/50'}`}>
                  <td className="px-6 py-4 text-sm text-dark-600">#{sub.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-dark-800">{planName}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{parkingName}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{formatDate(sub.startDate)}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{formatDate(sub.endDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[sub.status] || 'bg-dark-100 text-dark-600'}`}>{sub.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {(() => {
                        const isCanceled = sub.status === 'CANCELED' || sub.status === 'CANCELLED';
                        const isExpired = new Date(sub.endDate) < new Date();
                        const isDisabled = isCanceled || isExpired;

                        return (
                          <>
                            {(sub.status !== 'SUSPENDED' || isDisabled) && (
                              <button 
                                onClick={() => !isDisabled && handleUpdateStatus(sub.id, 'SUSPENDED')} 
                                disabled={isDisabled}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDisabled ? 'bg-dark-200/50 text-dark-400 cursor-not-allowed' : 'bg-warning-500 hover:bg-warning-600 text-white shadow-sm cursor-pointer'}`}>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Suspend
                              </button>
                            )}
                            {(sub.status === 'SUSPENDED' || isDisabled) && (
                              <button 
                                onClick={() => !isDisabled && handleUpdateStatus(sub.id, 'ACTIVE')} 
                                disabled={isDisabled}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDisabled ? 'bg-dark-200/50 text-dark-400 cursor-not-allowed' : 'bg-accent-500 hover:bg-accent-600 text-white shadow-sm cursor-pointer'}`}>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Activate
                              </button>
                            )}
                            {!isDisabled && (
                              <button 
                                onClick={() => handleUpdateStatus(sub.id, 'CANCELED')} 
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-danger-500 hover:bg-danger-600 text-white shadow-sm cursor-pointer">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Cancel
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {subscriptions.length === 0 && <div className="p-8 text-center text-dark-400">No subscriptions found</div>}
      </div>
    </div>
  );
}
