import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { reclamationsAPI } from '../reclamationsAPI';

export default function ReclamationsListPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Reclamation Modal (For Clients)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');

  const fetchReclamations = async () => {
    try {
      setLoading(true);
      const res = await reclamationsAPI.getAll();
      setReclamations(res.data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reclamations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamations();
  }, []);

  const handleCreateReclamation = async (e) => {
    e.preventDefault();
    try {
      await reclamationsAPI.create({ subject: newSubject, content: newContent });
      setIsNewModalOpen(false);
      setNewSubject('');
      setNewContent('');
      fetchReclamations();
    } catch (err) {
      alert('Error creating reclamation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-900 tracking-tight">Reclamations</h2>
          <p className="text-sm text-dark-500 mt-1">Manage user issues and complaints.</p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition"
          >
            + New Reclamation
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-dark-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-dark-500">Loading reclamations...</div>
        ) : error ? (
          <div className="p-8 text-center text-danger-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-50 border-b border-dark-200 text-sm font-medium text-dark-600">
                  <th className="p-4">ID</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200">
                {reclamations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-dark-50/50 transition-colors">
                    <td className="p-4 text-sm text-dark-900">#{rec.id}</td>
                    <td className="p-4 text-sm text-dark-600">
                      {rec.client?.firstName} {rec.client?.lastName}
                    </td>
                    <td className="p-4 text-sm font-medium text-dark-900">{rec.subject}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border ${
                          rec.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rec.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : rec.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          rec.status === 'RESOLVED' ? 'bg-emerald-500' :
                          rec.status === 'IN_PROGRESS' ? 'bg-amber-500 animate-pulse' :
                          rec.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-500'
                        }`}></span>
                        {rec.status === 'IN_PROGRESS' ? 'In Progress' : 
                         rec.status === 'RESOLVED' ? 'Resolved' : 
                         rec.status === 'REJECTED' ? 'Rejected' : rec.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {isAdmin ? (
                        <button
                          onClick={() => navigate(`/reclamations/${rec.id}`)}
                          className="text-primary-600 hover:text-primary-900 font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-lg transition"
                        >
                          Reply / Manage
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/reclamations/${rec.id}`)}
                          className="text-dark-600 hover:text-dark-900 font-medium bg-dark-50 hover:bg-dark-100 px-3 py-1 rounded-lg transition"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reclamations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-dark-500">
                      No reclamations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Reclamation Modal for Client */}
      {isNewModalOpen && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-dark-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-dark-900">New Reclamation</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-dark-400 hover:text-dark-600">✕</button>
            </div>
            <form onSubmit={handleCreateReclamation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="E.g. Parking Issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Content</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-dark-600 hover:bg-dark-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl shadow-lg hover:bg-primary-700"
                >
                  Submit 
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
