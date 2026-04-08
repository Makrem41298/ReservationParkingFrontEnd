import { useState, useEffect } from 'react';
import { tarifGridAPI } from '../tarifGridAPI';
import { useAuth } from '../../../context/AuthContext';

export default function TarifGridListPage() {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { isAdmin } = useAuth();

  const [form, setForm] = useState({ name: '', grid: [{ minutes: '', price: '' }] });

  useEffect(() => { fetchGrids(); }, []);

  const fetchGrids = async () => {
    try {
      const { data } = await tarifGridAPI.getAll();
      setGrids(data);
    } catch { setError('Failed to load tariff grids'); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '', grid: [{ minutes: '', price: '' }] });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (grid) => {
    setForm({ name: grid.name, grid: grid.grid.map((g) => ({ minutes: String(g.minutes), price: String(g.price) })) });
    setEditing(grid.id);
    setShowForm(true);
  };

  const addRow = () => setForm({ ...form, grid: [...form.grid, { minutes: '', price: '' }] });
  const removeRow = (i) => setForm({ ...form, grid: form.grid.filter((_, idx) => idx !== i) });
  const updateRow = (i, field, val) => {
    const newGrid = [...form.grid];
    newGrid[i] = { ...newGrid[i], [field]: val };
    setForm({ ...form, grid: newGrid });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      grid: form.grid.map((g) => ({ minutes: Number(g.minutes), price: Number(g.price) })),
    };
    try {
      if (editing) {
        await tarifGridAPI.update(editing, payload);
      } else {
        await tarifGridAPI.create(payload);
      }
      resetForm();
      fetchGrids();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tariff grid?')) return;
    try {
      await tarifGridAPI.delete(id);
      setGrids((prev) => prev.filter((g) => g.id !== id));
    } catch { setError('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Tariff Grids</h1>
          <p className="text-dark-500 mt-1">{grids.length} grids configured</p>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 cursor-pointer">
            + New Tariff Grid
          </button>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">{error}</div>}

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-dark-800 mb-4">{editing ? 'Edit' : 'Create'} Tariff Grid</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-dark-700">Price Tiers</label>
                <button type="button" onClick={addRow} className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer">+ Add tier</button>
              </div>
              {form.grid.map((row, i) => (
                <div key={i} className="flex gap-3 mb-2">
                  <input type="number" placeholder="Minutes" required value={row.minutes} onChange={(e) => updateRow(i, 'minutes', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-dark-200 bg-dark-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <input type="number" step="0.01" placeholder="Price" required value={row.price} onChange={(e) => updateRow(i, 'price', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-dark-200 bg-dark-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  {form.grid.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)} className="px-2 text-danger-500 hover:text-danger-600 cursor-pointer">✕</button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all cursor-pointer">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl bg-dark-100 hover:bg-dark-200 text-dark-700 text-sm font-semibold transition-all cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grids.map((grid) => (
          <div key={grid.id} className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-800">{grid.name}</h3>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(grid)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 hover:text-primary-600 transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(grid.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-dark-400 hover:text-danger-600 transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-dark-400"><th className="text-left py-1">Minutes</th><th className="text-right py-1">Price</th></tr></thead>
              <tbody>
                {grid.grid.map((tier, i) => (
                  <tr key={i} className="border-t border-dark-100">
                    <td className="py-2 text-dark-600">{tier.minutes} min</td>
                    <td className="py-2 text-right font-medium text-dark-800">{parseFloat(tier.price).toFixed(2)} TND</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      {grids.length === 0 && <div className="text-center py-8 text-dark-400">No tariff grids found</div>}
    </div>
  );
}
