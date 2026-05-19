import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingLotAPI } from '../features/parkingLot/parkingLotAPI';

const API_BASE_URL = 'http://localhost:3000';

export default function AllParkingsPage() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  let user = null;
  try { user = storedUser ? JSON.parse(storedUser) : null; } catch { user = null; }
  const isLoggedIn = !!token && !!user;

  useEffect(() => { fetchParkings(); }, []);

  const fetchParkings = async () => {
    try {
      const res = await parkingLotAPI.getAll();
      setParkings(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const cities = [...new Set(parkings.map(p => p.city).filter(Boolean))];

  const filtered = parkings.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.address?.toLowerCase().includes(search.toLowerCase());
    const matchCity = !filterCity || p.city === filterCity;
    const matchStatus = !filterStatus || p.statusParking === filterStatus;
    return matchSearch && matchCity && matchStatus;
  });

  return (
    <div className="min-h-screen bg-dark-50 font-sans">
      {/* Nav */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-dark-900">ParkEase</span>
            </Link>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link to="/dashboard" className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-semibold text-dark-600 hover:text-primary-600 transition-colors">Sign in</Link>
                  <Link to="/register" className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-16">
        <div className="bg-dark-900 py-16 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -left-20 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-white transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">All Parking Locations</h1>
            <p className="text-dark-400 text-base max-w-xl">Browse our complete network of {parkings.length} parking facilities. Click any location to view details, make reservations, or subscribe.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl border border-dark-200 shadow-lg p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-dark-500 mb-6">{filtered.length} parking{filtered.length !== 1 ? 's' : ''} found</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dark-200">
            <p className="text-dark-400 text-lg">No parkings match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lot) => (
              <Link to={`/parking/${lot.id}`} key={lot.id} className="group bg-white rounded-2xl border border-dark-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden block">
                {lot.url_image ? (
                  <div className="relative h-44 overflow-hidden bg-dark-100">
                    <img src={`${API_BASE_URL}${lot.url_image}`} alt={lot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-bold ${lot.statusParking === 'OPEN' ? 'bg-accent-500 text-white' : 'bg-warning-500 text-white'}`}>{lot.statusParking}</div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white mb-0.5">{lot.name}</h3>
                      <p className="text-xs text-white/80 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {lot.address}, {lot.city}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative p-5 bg-gradient-to-br from-dark-800 to-dark-900 border-b-4 border-primary-500">
                    <div className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold ${lot.statusParking === 'OPEN' ? 'bg-accent-500/20 text-accent-400' : 'bg-warning-500/20 text-warning-400'}`}>{lot.statusParking}</div>
                    <h3 className="text-lg font-bold text-white mb-1 pr-20">{lot.name}</h3>
                    <p className="text-xs text-dark-300 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {lot.address}, {lot.city}
                    </p>
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-500 text-xs">Availability</span>
                      <span className="text-dark-900 font-bold text-xs">{lot.numberOfPlaceAvailable} / {lot.numberOfPlaces}</span>
                    </div>
                    <div className="w-full bg-dark-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${
                        (lot.numberOfPlaceAvailable / lot.numberOfPlaces) > 0.5 ? 'bg-accent-500' :
                        (lot.numberOfPlaceAvailable / lot.numberOfPlaces) > 0.2 ? 'bg-warning-500' : 'bg-danger-500'
                      }`} style={{ width: `${Math.min(100, Math.max(0, (lot.numberOfPlaceAvailable / lot.numberOfPlaces) * 100))}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {lot.covered && <span className="text-[10px] px-2 py-0.5 rounded bg-dark-50 text-dark-600 border border-dark-200 font-medium">Covered</span>}
                    {lot.reservationAvailability && <span className="text-[10px] px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100 font-medium">Reservations</span>}
                    {lot.subscriptionAvailability && <span className="text-[10px] px-2 py-0.5 rounded bg-accent-50 text-accent-700 border border-accent-100 font-medium">Subscriptions</span>}
                  </div>
                  <span className="block w-full py-2.5 text-center rounded-xl bg-dark-50 group-hover:bg-primary-600 group-hover:text-white text-dark-800 font-semibold text-sm transition-colors border border-dark-200 group-hover:border-primary-600">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-dark-950 py-10 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-600/20 text-primary-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            </div>
            <span className="text-base font-bold text-white">ParkEase</span>
          </div>
          <div className="text-dark-400 text-sm">© {new Date().getFullYear()} ParkEase. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
