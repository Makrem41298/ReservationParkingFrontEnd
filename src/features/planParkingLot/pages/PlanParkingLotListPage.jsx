import { useState, useEffect } from 'react';
import { planParkingLotAPI } from '../planParkingLotAPI';
import { planAPI } from '../../plans/planAPI';
import { parkingLotAPI } from '../../parkingLot/parkingLotAPI';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/formatDate';

export default function PlanParkingLotListPage() {
  const [items, setItems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { isAdmin } = useAuth();

  const emptyForm = { planId: '', parkingLotId: '', renewFee: '', subscriptionFee: '', status: 'ACTIVE' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, plansRes, lotsRes] = await Promise.all([
        planParkingLotAPI.getAll(),
        planAPI.getAll().catch(() => ({ data: [] })),
        parkingLotAPI.getAll(),
      ]);
      setItems(itemsRes.data);
      setPlans(plansRes.data);
      setLots(lotsRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleEdit = (item) => {
    setForm({
      planId: String(item.planId),
      parkingLotId: String(item.parkingLotId),
      renewFee: String(item.renewFee),
      subscriptionFee: String(item.subscriptionFee),
      status: item.status,
    });
    setEditing(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      planId: Number(form.planId),
      parkingLotId: Number(form.parkingLotId),
      renewFee: Number(form.renewFee),
      subscriptionFee: Number(form.subscriptionFee),
      status: form.status,
    };
    try {
      if (editing) { await planParkingLotAPI.update(editing, payload); }
      else { await planParkingLotAPI.create(payload); }
      resetForm();
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this link?')) return;
    try { await planParkingLotAPI.delete(id); setItems((prev) => prev.filter((i) => i.id !== id)); }
    catch { setError('Failed to delete'); }
  };

  const statusStyles = {
    ACTIVE: 'bg-accent-500/10 text-accent-600',
    SUSPENDED: 'bg-warning-500/10 text-warning-500',
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Plan – Parking Links</h1>
          <p className="text-dark-500 mt-1">{items.length} links configured</p>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 cursor-pointer">
            + New Link
          </button>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">{error}</div>}

      {showForm && isAdmin && (
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-dark-800 mb-4">{editing ? 'Edit' : 'Create'} Link</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Plan</label>
                <select required value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">Select plan...</option>
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Parking Lot</label>
                <select required value={form.parkingLotId} onChange={(e) => setForm({ ...form, parkingLotId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">Select lot...</option>
                  {lots.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Subscription Fee (TND)</label>
                <input type="number" step="0.01" required value={form.subscriptionFee} onChange={(e) => setForm({ ...form, subscriptionFee: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Renew Fee (TND)</label>
                <input type="number" step="0.01" required value={form.renewFee} onChange={(e) => setForm({ ...form, renewFee: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all cursor-pointer">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl bg-dark-100 hover:bg-dark-200 text-dark-700 text-sm font-semibold transition-all cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Parking Lot</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Sub. Fee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Renew Fee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                {isAdmin && <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-dark-800">{item.plan?.name || `#${item.planId}`}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{item.parkingLot?.name || `#${item.parkingLotId}`}</td>
                  <td className="px-6 py-4 text-sm font-medium text-dark-800">{formatCurrency(item.subscriptionFee)}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{formatCurrency(item.renewFee)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[item.status] || 'bg-dark-100 text-dark-600'}`}>{item.status}</span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(item)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors cursor-pointer">Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <div className="p-8 text-center text-dark-400">No links found</div>}
      </div>
    </div>
  );
}
