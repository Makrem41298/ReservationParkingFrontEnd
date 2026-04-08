import { useState, useEffect } from 'react';
import { reservationAPI } from '../reservationAPI';
import { parkingLotAPI } from '../../parkingLot/parkingLotAPI';
import { useAuth } from '../../../context/AuthContext';
import { formatDateTime, formatCurrency } from '../../../utils/formatDate';

export default function ReservationsListPage() {
  const [reservations, setReservations] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { isAdmin, isClient } = useAuth();

  const emptyForm = { parkingLotId: '', startTimeDate: '', endTimeDate: '', status: 'REQUESTED' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [resRes, lotsRes] = await Promise.all([reservationAPI.getAll(), parkingLotAPI.getAll()]);
      setReservations(resRes.data);
      setParkingLots(lotsRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleEdit = (r) => {
    setForm({
      parkingLotId: String(r.parkingLotId),
      startTimeDate: r.startTimeDate?.slice(0, 16) || '',
      endTimeDate: r.endTimeDate?.slice(0, 16) || '',
      totalPrice: String(r.totalPrice),
      status: r.status,
      entryTime: r.entryTime ? r.entryTime.slice(0, 16) : '',
      leaveTime: r.leaveTime ? r.leaveTime.slice(0, 16) : '',
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      parkingLotId: Number(form.parkingLotId),
      startTimeDate: form.startTimeDate,
      endTimeDate: form.endTimeDate,
      status: form.status,
    };
    if (editing) {
      if (form.entryTime) payload.entryTime = form.entryTime;
      if (form.leaveTime) payload.leaveTime = form.leaveTime;
    }
    try {
      if (editing) { await reservationAPI.update(editing, payload); }
      else { await reservationAPI.create(payload); }
      resetForm();
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const statusStyles = {
    REQUESTED: 'bg-warning-500/10 text-warning-500',
    CONFIRMED: 'bg-accent-500/10 text-accent-600',
    CANCELLED: 'bg-danger-500/10 text-danger-500',
    COMPLETED: 'bg-primary-500/10 text-primary-600',
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Reservations</h1>
          <p className="text-dark-500 mt-1">{reservations.length} reservations</p>
        </div>
        {isClient && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 cursor-pointer">
            + New Reservation
          </button>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-dark-800 mb-4">{editing ? 'Edit' : 'New'} Reservation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Parking Lot</label>
                <select required value={form.parkingLotId} onChange={(e) => setForm({ ...form, parkingLotId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">Select...</option>
                  {parkingLots.filter(l => l.reservationAvailability).map((l) => <option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}
                </select>
              </div>
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="REQUESTED">REQUESTED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CANCELED">CANCELED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="USED">USED</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Start</label>
                <input type="datetime-local" required value={form.startTimeDate} onChange={(e) => setForm({ ...form, startTimeDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">End</label>
                <input type="datetime-local" required value={form.endTimeDate} onChange={(e) => setForm({ ...form, endTimeDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              {editing && form.totalPrice != null && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Price (TND)</label>
                  <div className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-100 text-dark-600 cursor-not-allowed">
                    {formatCurrency(form.totalPrice)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all cursor-pointer">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl bg-dark-100 hover:bg-dark-200 text-dark-700 text-sm font-semibold transition-all cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Parking</th>
                {isAdmin && <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">User</th>}
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Start</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">End</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-dark-600">#{r.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-dark-800">{r.parkingLot?.name || `#${r.parkingLotId}`}</td>
                  {isAdmin && <td className="px-6 py-4 text-sm text-dark-600">{r.user ? `${r.user.firstName} ${r.user.lastName}` : `#${r.userId}`}</td>}
                  <td className="px-6 py-4 text-sm text-dark-600">{formatDateTime(r.startTimeDate)}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{formatDateTime(r.endTimeDate)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-dark-800">{formatCurrency(r.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[r.status] || 'bg-dark-100 text-dark-600'}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(r)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors cursor-pointer">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reservations.length === 0 && <div className="p-8 text-center text-dark-400">No reservations found</div>}
      </div>
    </div>
  );
}
