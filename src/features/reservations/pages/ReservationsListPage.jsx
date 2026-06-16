import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationAPI } from '../reservationAPI';
import { parkingLotAPI } from '../../parkingLot/parkingLotAPI';
import { useAuth } from '../../../context/AuthContext';
import { formatDateTime, formatCurrency } from '../../../utils/formatDate';
import ReservationDetailModal from '../components/ReservationDetailModal';

export default function ReservationsListPage() {
  const [reservations, setReservations] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { isAdmin, isClient } = useAuth();

  const emptyForm = { parkingLotId: '', startTimeDate: '', endTimeDate: '', status: 'PENDING' };
  const [form, setForm] = useState(emptyForm);
  const [selectedReservation, setSelectedReservation] = useState(null);

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

  const handlePay = async (reservationId, amount) => {
    setError('');
    try {
      const response = await reservationAPI.createCheckoutSession(reservationId, Number(amount));
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError('Stripe checkout session URL was not returned by the backend.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize Stripe checkout session.');
    }
  };

  const statusStyles = {
    PENDING: 'bg-warning-500/10 text-warning-500',
    CONFIRMED: 'bg-accent-500/10 text-accent-600',
    CHECKED_IN: 'bg-info-500/10 text-info-600',
    COMPLETED: 'bg-primary-500/10 text-primary-600',
    CANCELED: 'bg-danger-500/10 text-danger-500',
    EXPIRED: 'bg-dark-500/10 text-dark-500',
    NO_SHOW: 'bg-neutral-500/10 text-neutral-500',
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
          <Link to="/parkings" className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 cursor-pointer text-center flex items-center justify-center">
            + New Reservation
          </Link>
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
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CHECKED_IN">CHECKED_IN</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELED">CANCELED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="NO_SHOW">NO_SHOW</option>
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
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Price (€)</label>
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Details</th>
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
                  {/* Detail / QR icon */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedReservation(r)}
                      title="View details & QR code"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 text-dark-400 hover:text-primary-600 transition-colors cursor-pointer"
                    >
                      {r.qrCode ? (
                        /* QR icon when QR is available */
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      ) : (
                        /* Eye icon when no QR yet */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {isClient && r.status === 'PENDING' && (
                      <button
                        onClick={() => handlePay(r.id, r.totalPrice)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white transition-colors cursor-pointer shadow-sm shadow-accent-500/20"
                      >
                        Pay Now
                      </button>
                    )}
                    <button onClick={() => handleEdit(r)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors cursor-pointer">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reservations.length === 0 && <div className="p-8 text-center text-dark-400">No reservations found</div>}
      </div>

      {/* Detail Modal */}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
}
