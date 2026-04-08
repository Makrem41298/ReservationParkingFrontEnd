import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../authAPI';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.getProfile();
      setProfile(data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.changePassword(passwordForm);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-dark-900">Profile</h1>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm ${
          message.type === 'error'
            ? 'bg-danger-500/10 border border-danger-500/20 text-danger-600'
            : 'bg-accent-500/10 border border-accent-500/20 text-accent-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-dark-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-dark-800 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'First Name', value: profile?.firstName },
            { label: 'Last Name', value: profile?.lastName },
            { label: 'Email', value: profile?.email },
            { label: 'Phone', value: profile?.phone },
            { label: 'CIN', value: profile?.CIN },
            { label: 'Role', value: profile?.role },
            { label: 'Status', value: profile?.accountStatus },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-sm font-medium text-dark-800">{item.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-dark-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-dark-800 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-dark-700 mb-1.5">
              Current Password
            </label>
            <input
              id="oldPassword"
              type="password"
              required
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-dark-700 mb-1.5">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
