import { useState, useEffect } from 'react';
import { userAPI } from '../userAPI';
import { ACCOUNT_STATUS } from '../../../constants/roles';

export default function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.getAllUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.accountStatus === ACCOUNT_STATUS.ACTIVE
      ? ACCOUNT_STATUS.BLOCKED
      : ACCOUNT_STATUS.ACTIVE;

    setToggling(user.id);
    try {
      await userAPI.updateStatusUser(user.id, { accountStatus: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, accountStatus: newStatus } : u))
      );
    } catch {
      setError('Failed to update user status');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Users Management</h1>
          <p className="text-dark-500 mt-1">{users.length} users total</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">CIN</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-800">{u.firstName} {u.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{u.phone}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{u.CIN}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' : 'bg-dark-100 text-dark-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.accountStatus === 'ACTIVE'
                        ? 'bg-accent-500/10 text-accent-600'
                        : 'bg-danger-500/10 text-danger-500'
                    }`}>
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(u)}
                      disabled={toggling === u.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                        u.accountStatus === 'ACTIVE'
                          ? 'bg-danger-500/10 text-danger-600 hover:bg-danger-500/20'
                          : 'bg-accent-500/10 text-accent-600 hover:bg-accent-500/20'
                      }`}
                    >
                      {toggling === u.id
                        ? '...'
                        : u.accountStatus === 'ACTIVE'
                        ? 'Block'
                        : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-dark-400">No users found</div>
        )}
      </div>
    </div>
  );
}
