import { useState, useEffect } from 'react';
import { ROLES, ACCOUNT_STATUS } from '../../../constants/roles';

export default function UserModal({ isOpen, onClose, onSubmit, user, isSuperAdmin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    CIN: '',
    role: ROLES.ADMIN, // default when creating
    accountStatus: ACCOUNT_STATUS.ACTIVE,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '', // Password usually left blank when updating
        phone: user.phone || '',
        CIN: user.CIN || '',
        role: user.role || ROLES.CLIENT,
        accountStatus: user.accountStatus || ACCOUNT_STATUS.ACTIVE,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        CIN: '',
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const dataToSubmit = { ...formData };
    // Remove password if empty during update
    if (user && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    // Remove fields that the backend POST route might reject
    if (!user) {
      delete dataToSubmit.role;
      delete dataToSubmit.accountStatus;
    }
    
    try {
      await onSubmit(dataToSubmit, user ? user.id : null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dark-900">
            {user ? 'Update User' : 'Create Admin'}
          </h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-600 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                placeholder="John"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-dark-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-dark-700">
              Password {user && <span className="text-dark-400 text-xs">(Leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-700">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                placeholder="+216 12 345 678"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-700">CIN</label>
              <input
                type="text"
                name="CIN"
                value={formData.CIN}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                placeholder="12345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Role select logic: Super Admin can change Roles. Admins cannot change roles. Create mode always sets ADMIN or requires SuperAdmin to pick. Let's say only super admin sees role dropdown, otherwise it's just read-only or hidden */}
            {isSuperAdmin && user && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                >
                  <option value={ROLES.CLIENT}>Client</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>
            )}
            
            {user && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark-700">Account Status</label>
                <select
                  name="accountStatus"
                  value={formData.accountStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                >
                  <option value={ACCOUNT_STATUS.ACTIVE}>Active</option>
                  <option value={ACCOUNT_STATUS.BLOCKED}>Blocked</option>
                  <option value={ACCOUNT_STATUS.PENDING}>Pending</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-dark-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {user ? 'Save Changes' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
