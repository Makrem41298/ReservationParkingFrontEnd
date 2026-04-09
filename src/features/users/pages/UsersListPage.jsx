import { useState, useEffect } from 'react';
import { userAPI } from '../userAPI';
import { ACCOUNT_STATUS } from '../../../constants/roles';
import { useAuth } from '../../../context/AuthContext';
import UserModal from '../components/UserModal';

export default function UsersListPage() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSubmitModal = async (data, id) => {
    try {
      if (id) {
        // Update user
        const response = await userAPI.updateUser(id, data);
        if (response.data && response.data.id) {
           setUsers(users.map(u => u.id === id ? response.data : u));
        } else {
           fetchUsers(); // Refresh to get updated data if backend doesn't return full user
        }
      } else {
        // Create Admin
        const response = await userAPI.createAdmin(data);
        if (response.data) {
           setUsers([response.data, ...users]);
        } else {
           fetchUsers();
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error('Validation Error response:', err.response?.data);
      const errorData = err.response?.data;
      let errorMsg = 'Failed to save user';
      if (errorData?.message) {
        errorMsg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      } else if (errorData?.error) {
        errorMsg = errorData.error;
      }
      setError(errorMsg);
      throw err;
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
        {isSuperAdmin && (
          <button
            onClick={() => handleOpenModal(null)}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Admin
          </button>
        )}
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
                    <div className="flex items-center gap-2">
			<button
                        onClick={() => handleOpenModal(u)}
                        className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit User"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
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
                    </div>
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

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        user={selectedUser}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
