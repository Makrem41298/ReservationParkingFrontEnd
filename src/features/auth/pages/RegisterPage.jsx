import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../authAPI';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    CIN: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.register(form);
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error?.errors?.[0]?.message || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark-900 mb-1">Create account</h2>
      <p className="text-dark-500 text-sm mb-6">Fill in your details to get started</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-firstName" className="block text-sm font-medium text-dark-700 mb-1.5">First Name</label>
            <input
              id="reg-firstName"
              name="firstName"
              type="text"
              required
              value={form.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="First name"
            />
          </div>
          <div>
            <label htmlFor="reg-lastName" className="block text-sm font-medium text-dark-700 mb-1.5">Last Name</label>
            <input
              id="reg-lastName"
              name="lastName"
              type="text"
              required
              value={form.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-dark-700 mb-1.5">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-dark-700 mb-1.5">Password</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-phone" className="block text-sm font-medium text-dark-700 mb-1.5">Phone</label>
            <input
              id="reg-phone"
              name="phone"
              type="text"
              required
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="+216..."
            />
          </div>
          <div>
            <label htmlFor="reg-cin" className="block text-sm font-medium text-dark-700 mb-1.5">CIN</label>
            <input
              id="reg-cin"
              name="CIN"
              type="text"
              required
              value={form.CIN}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="12345678"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/30 cursor-pointer"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-dark-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
