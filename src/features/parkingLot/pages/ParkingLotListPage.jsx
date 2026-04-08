import { useState, useEffect } from 'react';
import { parkingLotAPI } from '../parkingLotAPI';
import { tarifGridAPI } from '../../tarifGrid/tarifGridAPI';
import { useAuth } from '../../../context/AuthContext';

export default function ParkingLotListPage() {
  const [lots, setLots] = useState([]);
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { isAdmin } = useAuth();

  const emptyForm = {
    name: '', address: '', city: '', country: '', covered: false,
    numberOfPlaces: '', description: '', tarifGridId: '',
    reservationAvailability: true, subscriptionAvailability: true,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [lotsRes, gridsRes] = await Promise.all([parkingLotAPI.getAll(), tarifGridAPI.getAll()]);
      setLots(lotsRes.data);
      setGrids(gridsRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleEdit = (lot) => {
    setForm({
      name: lot.name, address: lot.address, city: lot.city, country: lot.country,
      covered: lot.covered, numberOfPlaces: String(lot.numberOfPlaces),
      description: lot.description || '', tarifGridId: lot.tarifGridId || '',
      reservationAvailability: lot.reservationAvailability,
      subscriptionAvailability: lot.subscriptionAvailability,
      statusParking: lot.statusParking,
      numberOfPlaceAvailable: String(lot.numberOfPlaceAvailable || 0),
    });
    setEditing(lot.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      numberOfPlaces: Number(form.numberOfPlaces),
      tarifGridId: form.tarifGridId ? Number(form.tarifGridId) : null,
      numberOfPlaceAvailable: form.numberOfPlaceAvailable ? Number(form.numberOfPlaceAvailable) : 0,
    };
    try {
      if (editing) { await parkingLotAPI.update(editing, payload); }
      else { await parkingLotAPI.create(payload); }
      resetForm();
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this parking lot?')) return;
    try { await parkingLotAPI.delete(id); setLots((prev) => prev.filter((l) => l.id !== id)); }
    catch { setError('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Parking Lots</h1>
          <p className="text-dark-500 mt-1">{lots.length} parking lots</p>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 cursor-pointer">
            + New Parking Lot
          </button>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">{error}</div>}

      {showForm && isAdmin && (
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-dark-800 mb-4">{editing ? 'Edit' : 'Create'} Parking Lot</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Address</label>
                <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">City</label>
                <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Country</label>
                <input type="text" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Total Places</label>
                <input type="number" required value={form.numberOfPlaces} onChange={(e) => setForm({ ...form, numberOfPlaces: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Tariff Grid</label>
                <select value={form.tarifGridId} onChange={(e) => setForm({ ...form, tarifGridId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">— None —</option>
                  {grids.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Status</label>
                  <select value={form.statusParking || 'OPEN'} onChange={(e) => setForm({ ...form, statusParking: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="OPEN">OPEN</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.covered} onChange={(e) => setForm({ ...form, covered: e.target.checked })}
                  className="rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-dark-700">Covered</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.reservationAvailability} onChange={(e) => setForm({ ...form, reservationAvailability: e.target.checked })}
                  className="rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-dark-700">Reservations</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.subscriptionAvailability} onChange={(e) => setForm({ ...form, subscriptionAvailability: e.target.checked })}
                  className="rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-dark-700">Subscriptions</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all cursor-pointer">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl bg-dark-100 hover:bg-dark-200 text-dark-700 text-sm font-semibold transition-all cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Parking lots grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lots.map((lot) => (
          <div key={lot.id} className="bg-white rounded-2xl border border-dark-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className={`h-2 ${lot.statusParking === 'OPEN' ? 'bg-accent-500' : 'bg-warning-500'}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-dark-800">{lot.name}</h3>
                  <p className="text-sm text-dark-500">{lot.address}, {lot.city}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(lot)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 hover:text-primary-600 transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(lot.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-dark-400 hover:text-danger-600 transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-dark-500 mb-4 line-clamp-2">{lot.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-dark-50 rounded-lg px-3 py-2">
                  <p className="text-dark-400 text-xs">Places</p>
                  <p className="font-semibold text-dark-800">{lot.numberOfPlaces}</p>
                </div>
                <div className="bg-dark-50 rounded-lg px-3 py-2">
                  <p className="text-dark-400 text-xs">Available</p>
                  <p className="font-semibold text-dark-800">{lot.numberOfPlaceAvailable}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${lot.statusParking === 'OPEN' ? 'bg-accent-500/10 text-accent-600' : 'bg-warning-500/10 text-warning-500'}`}>
                  {lot.statusParking}
                </span>
                {lot.covered && <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">Covered</span>}
                {lot.tarifGrid && <span className="text-xs px-2 py-1 rounded-full bg-dark-100 text-dark-600 font-medium">{lot.tarifGrid.name}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {lots.length === 0 && <div className="text-center py-8 text-dark-400">No parking lots found</div>}
    </div>
  );
}
