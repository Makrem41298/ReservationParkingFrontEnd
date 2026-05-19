import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { parkingLotAPI } from '../features/parkingLot/parkingLotAPI';
import { planParkingLotAPI } from '../features/planParkingLot/planParkingLotAPI';
import { reservationAPI } from '../features/reservations/reservationAPI';
import { subscriptionAPI } from '../features/subscriptions/subscriptionAPI';
import { formatCurrency } from '../utils/formatDate';

const API_BASE_URL = 'http://localhost:3000';

export default function ParkingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parking, setParking] = useState(null);
  const [planParkingLots, setPlanParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reservation');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reservation form
  const [resForm, setResForm] = useState({ startTimeDate: '', endTimeDate: '' });
  // Subscription form
  const [subForm, setSubForm] = useState({ planParkingLotId: '' });

  // Auth check
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  let user = null;
  try { user = storedUser ? JSON.parse(storedUser) : null; } catch { user = null; }
  const isClient = user?.role === 'CLIENT';
  const isLoggedIn = !!token && !!user;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [parkingRes, pplRes] = await Promise.all([
        parkingLotAPI.getById(id),
        planParkingLotAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setParking(parkingRes.data);
      const filtered = (pplRes.data || []).filter(
        (p) => String(p.parkingLotId) === String(id) && p.status === 'ACTIVE'
      );
      setPlanParkingLots(filtered);
    } catch {
      setError('Failed to load parking details');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    if (new Date(resForm.endTimeDate) <= new Date(resForm.startTimeDate)) {
      setError('End date and time must be after the start date and time.');
      return;
    }
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await reservationAPI.create({
        parkingLotId: Number(id),
        startTimeDate: resForm.startTimeDate,
        endTimeDate: resForm.endTimeDate,
      });
      setSuccess('Reservation created successfully!');
      setResForm({ startTimeDate: '', endTimeDate: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally { setSubmitting(false); }
  };

  const handleSubscription = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await subscriptionAPI.create({ planParkingLotId: Number(subForm.planParkingLotId) });
      setSuccess('Subscription created successfully!');
      setSubForm({ planParkingLotId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subscription');
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!parking) {
    return (
      <div className="min-h-screen bg-dark-50 flex flex-col items-center justify-center gap-4">
        <p className="text-dark-500 text-lg">Parking not found</p>
        <Link to="/" className="text-primary-600 font-semibold hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const calculateEstimatedPrice = () => {
    if (!resForm.startTimeDate || !resForm.endTimeDate || !parking?.tarifGrid?.grid?.length) return null;
    
    const start = new Date(resForm.startTimeDate);
    const end = new Date(resForm.endTimeDate);
    if (end <= start) return null;

    const diffMinutes = Math.ceil((end - start) / (1000 * 60));
    
    const sortedGrid = [...parking.tarifGrid.grid].sort((a, b) => a.minutes - b.minutes);
    let remainingMinutes = diffMinutes;
    let totalPrice = 0;
    
    const maxTier = sortedGrid[sortedGrid.length - 1];
    
    if (remainingMinutes > maxTier.minutes) {
        const numMaxTiers = Math.floor(remainingMinutes / maxTier.minutes);
        totalPrice += numMaxTiers * maxTier.price;
        remainingMinutes = remainingMinutes % maxTier.minutes;
    }
    
    if (remainingMinutes > 0) {
        const fittingTier = sortedGrid.find(t => t.minutes >= remainingMinutes);
        if (fittingTier) {
            totalPrice += fittingTier.price;
        } else {
            totalPrice += maxTier.price;
        }
    }
    
    return { price: totalPrice, minutes: diffMinutes };
  };

  const estimate = calculateEstimatedPrice();

  const availPercent = parking.numberOfPlaces > 0
    ? Math.round((parking.numberOfPlaceAvailable / parking.numberOfPlaces) * 100) : 0;
  const availColor = availPercent > 50 ? 'accent' : availPercent > 20 ? 'warning' : 'danger';

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
                <Link to="/dashboard" className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30">
                  {isClient ? 'Profile' : 'Dashboard'}
                </Link>
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

      {/* Hero */}
      <div className="relative pt-16">
        <div className="relative h-72 sm:h-96 overflow-hidden bg-dark-900">
          {parking.url_image ? (
            <img src={`${API_BASE_URL}${parking.url_image}`} alt={parking.name} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-dark-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto z-10">
            <div className={`inline-flex text-xs px-3 py-1.5 rounded-full font-bold shadow-sm mb-3 ${
              parking.statusParking === 'OPEN' ? 'bg-accent-500 text-white' : 'bg-warning-500 text-white'
            }`}>{parking.statusParking}</div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2">{parking.name}</h1>
            <p className="text-white/70 flex items-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {parking.address}, {parking.city}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/parkings" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-6 group transition-colors">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to All Parkings
        </Link>
        
        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-700 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm font-medium">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column — Info */}
          <div className="lg:col-span-5 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total Spots" value={parking.numberOfPlaces} color="primary" />
              <StatCard label="Available" value={parking.numberOfPlaceAvailable} color={availColor} />
              <StatCard label="Occupancy" value={`${100 - availPercent}%`} color="dark" />
              <StatCard label="City" value={parking.city || '—'} color="dark" isText />
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-dark-900 mb-4">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FeatureBadge active={parking.covered} label="Covered Parking" icon="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                <FeatureBadge active={parking.reservationAvailability} label="Reservations" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                <FeatureBadge active={parking.subscriptionAvailability} label="Subscriptions" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-dark-900 mb-4">Real-Time Availability</h2>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-500">Available spots</span>
                <span className="font-bold text-dark-900">{parking.numberOfPlaceAvailable} / {parking.numberOfPlaces}</span>
              </div>
              <div className="w-full bg-dark-100 rounded-full h-4 overflow-hidden">
                <div className={`h-4 rounded-full bg-${availColor}-500 transition-all duration-700`} style={{ width: `${Math.min(100, availPercent)}%` }} />
              </div>
              <p className="text-xs text-dark-400 mt-2">{availPercent}% available</p>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-dark-900 mb-4">Quick Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <InfoRow label="Address" value={parking.address || '—'} />
                <InfoRow label="City" value={parking.city || '—'} />
                <InfoRow label="Status" value={parking.statusParking} />
                <InfoRow label="Covered" value={parking.covered ? 'Yes' : 'No'} />
                <InfoRow label="Reservations" value={parking.reservationAvailability ? 'Available' : 'Unavailable'} />
                <InfoRow label="Subscriptions" value={parking.subscriptionAvailability ? 'Available' : 'Unavailable'} />
              </div>
            </div>

          </div>

          {/* Right Column — Actions & Pricing */}
          <div className="lg:col-span-7 space-y-8">
            {/* Tarif Grid */}
            {parking.tarifGrid && parking.tarifGrid.grid && parking.tarifGrid.grid.length > 0 && (
              <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-dark-900">Pricing — {parking.tarifGrid.name}</h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 font-medium border border-primary-100">Per session</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {parking.tarifGrid.grid.map((tier, i) => (
                    <div key={i} className="rounded-xl border border-dark-200 p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all bg-dark-50/50">
                      <p className="text-2xl font-extrabold text-primary-600 mb-1">{formatCurrency(tier.price)}</p>
                      <p className="text-xs font-medium text-dark-500">
                        {i === 0 ? 'Up to ' : 'Over '}
                        {i === 0 
                          ? (tier.minutes < 60 ? `${tier.minutes} min` : `${tier.minutes / 60} hr${tier.minutes > 60 ? 's' : ''}`)
                          : (parking.tarifGrid.grid[i - 1].minutes < 60 ? `${parking.tarifGrid.grid[i - 1].minutes} min` : `${parking.tarifGrid.grid[i - 1].minutes / 60} hr${parking.tarifGrid.grid[i - 1].minutes > 60 ? 's' : ''}`)
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plans for this parking */}
            {planParkingLots.length > 0 && (
              <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-dark-900 mb-4">Available Subscription Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {planParkingLots.map((ppl) => (
                    <div key={ppl.id} className="rounded-xl border border-dark-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <h3 className="text-base font-bold text-dark-900 mb-1">{ppl.plan?.name || `Plan #${ppl.planId}`}</h3>
                      {ppl.plan?.NumberOfBenefitDays && (
                        <p className="text-xs text-dark-500 mb-3">{ppl.plan.NumberOfBenefitDays} benefit days</p>
                      )}
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-2xl font-extrabold text-primary-600">{formatCurrency(ppl.subscriptionFee)}</span>
                      </div>
                      <p className="text-xs text-dark-400">Renewal: {formatCurrency(ppl.renewFee)}</p>
                      {ppl.plan?.activeDays?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {ppl.plan.activeDays.map((ad, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-dark-50 border border-dark-200 text-dark-600">{ad.day?.substring(0,3)} {ad.hoursInterval}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Tab Selector */}
            <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-dark-200">
                <button
                  onClick={() => { setActiveTab('reservation'); setError(''); setSuccess(''); }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'reservation' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-dark-500 hover:text-dark-700'}`}
                >Reserve</button>
                <button
                  onClick={() => { setActiveTab('subscription'); setError(''); setSuccess(''); }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'subscription' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-dark-500 hover:text-dark-700'}`}
                >Subscribe</button>
              </div>

              <div className="p-6">
                {activeTab === 'reservation' ? (
                  <>
                    <h3 className="text-base font-bold text-dark-900 mb-1">Make a Reservation</h3>
                    <p className="text-xs text-dark-400 mb-5">Select your preferred date and time range.</p>
                    {isLoggedIn && isClient ? (
                      parking.reservationAvailability ? (
                        <form onSubmit={handleReservation} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1.5">Start Date & Time</label>
                            <input type="datetime-local" required value={resForm.startTimeDate} onChange={(e) => setResForm({ ...resForm, startTimeDate: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1.5">End Date & Time</label>
                            <input type="datetime-local" required min={resForm.startTimeDate || undefined} value={resForm.endTimeDate} onChange={(e) => setResForm({ ...resForm, endTimeDate: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                          </div>

                          {estimate && (
                            <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 flex justify-between items-center">
                              <div>
                                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-0.5">Estimated Cost</p>
                                <p className="text-sm font-medium text-dark-600">
                                  {estimate.minutes < 60 ? `${estimate.minutes} mins` : `${Math.floor(estimate.minutes / 60)}h ${estimate.minutes % 60 > 0 ? `${estimate.minutes % 60}m` : ''}`}
                                </p>
                              </div>
                              <div className="text-2xl font-extrabold text-primary-700">
                                {formatCurrency(estimate.price)}
                              </div>
                            </div>
                          )}
                          <button type="submit" disabled={submitting}
                            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all shadow-lg shadow-primary-600/30 disabled:opacity-50 cursor-pointer">
                            {submitting ? 'Reserving...' : 'Reserve Now'}
                          </button>
                        </form>
                      ) : (
                        <div className="text-center py-6 text-dark-400 text-sm">Reservations are not available for this parking lot.</div>
                      )
                    ) : (
                      <Link to="/login" className="block w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm text-center transition-all shadow-lg shadow-primary-600/30">
                        Sign in to Reserve
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-dark-900 mb-1">Subscribe to a Plan</h3>
                    <p className="text-xs text-dark-400 mb-5">Choose a subscription plan for this parking.</p>
                    {isLoggedIn && isClient ? (
                      planParkingLots.length > 0 ? (
                        <form onSubmit={handleSubscription} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-dark-700 mb-2">Select Plan</label>
                            <div className="grid grid-cols-1 gap-3">
                              {planParkingLots.map((ppl) => (
                                <label 
                                  key={ppl.id}
                                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all block relative ${
                                    subForm.planParkingLotId == ppl.id 
                                      ? 'border-accent-500 bg-accent-50/30 shadow-md shadow-accent-500/10 ring-1 ring-accent-500/50' 
                                      : 'border-dark-200 hover:border-dark-300 bg-white hover:bg-dark-50/50'
                                  }`}
                                >
                                  <input 
                                    type="radio" 
                                    name="planSelection" 
                                    required 
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer m-0 p-0" 
                                    value={ppl.id} 
                                    checked={subForm.planParkingLotId == ppl.id} 
                                    onChange={(e) => setSubForm({ planParkingLotId: e.target.value })} 
                                  />
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-dark-900">{ppl.plan?.name || `Plan #${ppl.planId}`}</span>
                                    <span className="font-extrabold text-accent-600">{formatCurrency(ppl.subscriptionFee)}</span>
                                  </div>
                                  <p className="text-xs text-dark-500">{ppl.plan?.NumberOfBenefitDays ? `${ppl.plan.NumberOfBenefitDays} benefit days` : 'Standard Plan'} • Renewal: {formatCurrency(ppl.renewFee)}</p>
                                </label>
                              ))}
                            </div>
                          </div>
                          <button type="submit" disabled={submitting}
                            className="w-full py-3 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-sm transition-all shadow-lg shadow-accent-600/30 disabled:opacity-50 cursor-pointer">
                            {submitting ? 'Subscribing...' : 'Subscribe Now'}
                          </button>
                        </form>
                      ) : (
                        <div className="text-center py-6 text-dark-400 text-sm">No subscription plans available for this parking.</div>
                      )
                    ) : (
                      <Link to="/login" className="block w-full py-3 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-sm text-center transition-all shadow-lg shadow-accent-600/30">
                        Sign in to Subscribe
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-950 py-10 border-t border-dark-800 mt-12">
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

function StatCard({ label, value, color, isText }) {
  return (
    <div className="bg-white rounded-xl border border-dark-200 shadow-sm p-4 text-center">
      <p className={`text-2xl font-extrabold mb-1 ${isText ? 'text-dark-800 text-base' : `text-${color}-600`}`}>{value}</p>
      <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function FeatureBadge({ active, label, icon }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${active ? 'bg-accent-50 border-accent-200 text-accent-700' : 'bg-dark-50 border-dark-200 text-dark-400'}`}>
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg>
      <span className="text-sm font-medium">{label}</span>
      {active && <svg className="w-4 h-4 ml-auto text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-dark-50">
      <span className="text-dark-500">{label}</span>
      <span className="font-medium text-dark-800">{value}</span>
    </div>
  );
}
