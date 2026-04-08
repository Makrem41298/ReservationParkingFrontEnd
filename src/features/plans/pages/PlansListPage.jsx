import { useState, useEffect } from 'react';
import { planAPI } from '../planAPI';
import { formatDate } from '../../../utils/formatDate';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function PlansListPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const emptyForm = {
    name: '', startDate: '', endDate: '', NumberOfBenefitDays: '',
    activeDays: [{ day: 'Monday', hoursInterval: '08:00-18:00' }],
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try { const { data } = await planAPI.getAll(); setPlans(data); }
    catch { setError('Failed to load plans'); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleEdit = (plan) => {
    setForm({
      name: plan.name,
      startDate: plan.startDate?.slice(0, 10) || '',
      endDate: plan.endDate?.slice(0, 10) || '',
      NumberOfBenefitDays: String(plan.NumberOfBenefitDays || ''),
      activeDays: plan.activeDays?.map((d) => ({ day: d.day, hoursInterval: d.hoursInterval })) || [],
    });
    setEditing(plan.id);
    setShowForm(true);
  };

  const addDay = () => setForm({ ...form, activeDays: [...form.activeDays, { day: 'Monday', hoursInterval: '08:00-18:00' }] });
  const removeDay = (i) => setForm({ ...form, activeDays: form.activeDays.filter((_, idx) => idx !== i) });
  const updateDay = (i, field, val) => {
    const newDays = [...form.activeDays];
    newDays[i] = { ...newDays[i], [field]: val };
    setForm({ ...form, activeDays: newDays });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      NumberOfBenefitDays: Number(form.NumberOfBenefitDays),
      activeDays: form.activeDays,
    };
    try {
      if (editing) { await planAPI.update(editing, payload); }
      else { await planAPI.create(payload); }
      resetForm();
      fetchPlans();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try { await planAPI.delete(id); setPlans((prev) => prev.filter((p) => p.id !== id)); }
    catch { setError('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Plans</h1>
          <p className="text-dark-500 mt-1">{plans.length} plans configured</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 cursor-pointer">
          + New Plan
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-dark-800 mb-4">{editing ? 'Edit' : 'Create'} Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Benefit Days</label>
                <input type="number" required value={form.NumberOfBenefitDays} onChange={(e) => setForm({ ...form, NumberOfBenefitDays: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Start Date</label>
                <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">End Date</label>
                <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-dark-700">Active Days</label>
                <button type="button" onClick={addDay} className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer">+ Add day</button>
              </div>
              {form.activeDays.map((ad, i) => (
                <div key={i} className="flex gap-3 mb-2">
                  <select value={ad.day} onChange={(e) => updateDay(i, 'day', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-dark-200 bg-dark-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="text" placeholder="08:00-18:00" value={ad.hoursInterval} onChange={(e) => updateDay(i, 'hoursInterval', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-dark-200 bg-dark-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  {form.activeDays.length > 1 && (
                    <button type="button" onClick={() => removeDay(i)} className="px-2 text-danger-500 hover:text-danger-600 cursor-pointer">✕</button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all cursor-pointer">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl bg-dark-100 hover:bg-dark-200 text-dark-700 text-sm font-semibold transition-all cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Plans list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-dark-800">{plan.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(plan)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 hover:text-primary-600 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-dark-400 hover:text-danger-600 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <div><span className="text-dark-400">From:</span> <span className="font-medium text-dark-700">{formatDate(plan.startDate)}</span></div>
                <div><span className="text-dark-400">To:</span> <span className="font-medium text-dark-700">{formatDate(plan.endDate)}</span></div>
              </div>
              <div className="text-sm"><span className="text-dark-400">Benefit Days:</span> <span className="font-semibold text-dark-800">{plan.NumberOfBenefitDays}</span></div>
              <div className="flex flex-wrap gap-2">
                {plan.activeDays?.map((ad, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 font-medium">
                    {ad.day} ({ad.hoursInterval})
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {plans.length === 0 && <div className="text-center py-8 text-dark-400">No plans found</div>}
    </div>
  );
}
