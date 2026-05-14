import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingLotAPI } from '../features/parkingLot/parkingLotAPI';
import { planAPI } from '../features/plans/planAPI';
import { formatCurrency } from '../utils/formatDate';

const API_BASE_URL = 'http://localhost:3000';

export default function LandingPage() {
  const [parkings, setParkings] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({ totalSpots: 0, cities: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [parkingsRes, plansRes] = await Promise.all([
        parkingLotAPI.getAll().catch(() => ({ data: [] })),
        planAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const pData = parkingsRes.data || [];
      setParkings(pData);
      
      const pPlans = plansRes.data || [];
      setPlans(pPlans);

      // Calculate stats
      const totalSpots = pData.reduce((acc, p) => acc + (p.numberOfPlaces || 0), 0);
      const uniqueCities = new Set(pData.map(p => p.city).filter(Boolean)).size;
      setStats({ totalSpots, cities: uniqueCities });
      
    } catch (error) {
      console.error('Failed to fetch landing data', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-50 text-dark-800 font-sans selection:bg-primary-200 selection:text-primary-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-dark-900">ParkEase</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#parkings" className="text-sm font-medium text-dark-600 hover:text-primary-600 transition-colors">Locations</a>
              <a href="#plans" className="text-sm font-medium text-dark-600 hover:text-primary-600 transition-colors">Subscriptions</a>
              <a href="#features" className="text-sm font-medium text-dark-600 hover:text-primary-600 transition-colors">Features</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-dark-600 hover:text-primary-600 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-x-0 top-0 h-[800px] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/50 via-dark-50 to-dark-50 -z-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -z-10 pointer-events-none animate-float" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl -z-10 pointer-events-none animate-float animation-delay-500" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse"></span>
            Smart Parking Management System
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-dark-900 tracking-tight leading-tight mb-6 animate-fade-in-up animation-delay-100">
            Seamless Parking,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Every Single Time.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-dark-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            Discover real-time parking availability, manage your reservations securely, and subscribe to premium plans tailored to your needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up animation-delay-300">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold transition-all shadow-xl shadow-primary-600/30 hover:shadow-primary-600/40 hover:-translate-y-1">
              Start Booking Now
            </Link>
            <a href="#parkings" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-dark-50 text-dark-800 border border-dark-200 text-lg font-semibold transition-all hover:border-dark-300">
              Explore Parkings ↓
            </a>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-dark-900 border-y border-dark-800 relative z-10 animate-fade-in animation-delay-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-dark-800">
            <div>
              <p className="text-4xl font-bold text-white mb-2">{parkings.length}</p>
              <p className="text-sm font-medium text-dark-400 uppercase tracking-wider">Parking Lots</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent-400 mb-2">{stats.totalSpots}</p>
              <p className="text-sm font-medium text-dark-400 uppercase tracking-wider">Total Spots</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-400 mb-2">{plans.length}</p>
              <p className="text-sm font-medium text-dark-400 uppercase tracking-wider">Active Plans</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-warning-400 mb-2">{stats.cities}</p>
              <p className="text-sm font-medium text-dark-400 uppercase tracking-wider">Cities Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parking Lots Section */}
      <div id="parkings" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">Our Locations</h2>
              <p className="text-lg text-dark-500 max-w-2xl">Find the perfect spot across our network of secure, modern parking facilities.</p>
            </div>
            {parkings.length > 0 && (
              <Link to="/register" className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                View All Details
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>

          {parkings.length === 0 ? (
            <div className="text-center py-12 bg-dark-50 rounded-3xl border border-dark-100">
              <p className="text-dark-500">Loading locations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {parkings.slice(0, 6).map((lot) => (
                <div key={lot.id} className="group bg-white rounded-3xl border border-dark-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {lot.url_image ? (
                    <div className="relative h-48 overflow-hidden bg-dark-100">
                      <img 
                        src={`${API_BASE_URL}${lot.url_image}`} 
                        alt={lot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className={`absolute top-4 left-4 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${
                        lot.statusParking === 'OPEN' ? 'bg-accent-500 text-white' : 'bg-warning-500 text-white'
                      }`}>
                        {lot.statusParking}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">{lot.name}</h3>
                        <p className="text-sm text-white/80 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {lot.address}, {lot.city}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative p-6 bg-gradient-to-br from-dark-800 to-dark-900 border-b-4 border-primary-500">
                      <div className={`absolute top-4 right-4 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${
                        lot.statusParking === 'OPEN' ? 'bg-accent-500/20 text-accent-400' : 'bg-warning-500/20 text-warning-400'
                      }`}>
                        {lot.statusParking}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 pr-20">{lot.name}</h3>
                      <p className="text-sm text-dark-300 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {lot.address}, {lot.city}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-dark-500 font-medium">Availability</span>
                        <span className="text-dark-900 font-bold">{lot.numberOfPlaceAvailable} / {lot.numberOfPlaces}</span>
                      </div>
                      <div className="w-full bg-dark-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${
                            (lot.numberOfPlaceAvailable / lot.numberOfPlaces) > 0.5 ? 'bg-accent-500' : 
                            (lot.numberOfPlaceAvailable / lot.numberOfPlaces) > 0.2 ? 'bg-warning-500' : 'bg-danger-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, (lot.numberOfPlaceAvailable / lot.numberOfPlaces) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {lot.covered && <span className="text-xs px-2.5 py-1 rounded-md bg-dark-50 text-dark-600 border border-dark-200 font-medium">Covered</span>}
                      {lot.reservationAvailability && <span className="text-xs px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 border border-primary-100 font-medium">Reservations</span>}
                      {lot.subscriptionAvailability && <span className="text-xs px-2.5 py-1 rounded-md bg-accent-50 text-accent-700 border border-accent-100 font-medium">Subscriptions</span>}
                    </div>

                    <Link to="/register" className="block w-full py-3 text-center rounded-xl bg-dark-50 hover:bg-dark-100 text-dark-800 font-semibold transition-colors border border-dark-200">
                      Book a Spot
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div id="plans" className="py-24 bg-dark-50 border-y border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">Premium Subscriptions</h2>
            <p className="text-lg text-dark-500 max-w-2xl mx-auto">Frequent visitor? Choose a subscription plan tailored to your needs and secure guaranteed parking at participating locations.</p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dark-100 shadow-sm">
              <p className="text-dark-500">Loading plans...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {plans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="relative bg-white rounded-3xl border border-dark-100 shadow-xl shadow-dark-200/20 p-8 hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-dark-900 mb-2">{plan.name}</h3>
                    <p className="text-sm font-medium text-primary-600 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Valid across multiple locations
                    </p>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm text-dark-600">Valid for <span className="font-bold text-dark-900">{plan.NumberOfBenefitDays || '-'}</span> benefit days</p>
                    </div>
                    
                    {plan.activeDays && plan.activeDays.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div className="text-sm text-dark-600">
                          <p className="mb-1">Active schedule:</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {plan.activeDays.map((ad, i) => (
                              <span key={i} className="inline-block px-2 py-0.5 rounded bg-dark-50 border border-dark-200 text-xs text-dark-700">
                                {ad.day.substring(0,3)} {ad.hoursInterval}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to="/register" className="w-full py-3.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-center font-bold transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40">
                    View Pricing
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">Why Choose ParkEase?</h2>
            <p className="text-lg text-dark-500 max-w-2xl mx-auto">Experience a frictionless approach to finding and managing your parking spots across the city.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-dark-50 border border-dark-100 hover:shadow-xl hover:shadow-dark-200/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-dark-200 flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">Instant Reservations</h3>
              <p className="text-dark-500 leading-relaxed">Book a spot before you even arrive. View real-time availability and secure your space with guaranteed entry.</p>
            </div>

            <div className="p-8 rounded-3xl bg-dark-50 border border-dark-100 hover:shadow-xl hover:shadow-dark-200/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-dark-200 flex items-center justify-center text-accent-600 mb-6 group-hover:scale-110 group-hover:bg-accent-600 group-hover:text-white transition-all shadow-sm">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">Flexible Subscriptions</h3>
              <p className="text-dark-500 leading-relaxed">Regular commuter? Save money with our customized subscription plans tailored to specific days and hours.</p>
            </div>

            <div className="p-8 rounded-3xl bg-dark-50 border border-dark-100 hover:shadow-xl hover:shadow-dark-200/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-dark-200 flex items-center justify-center text-warning-500 mb-6 group-hover:scale-110 group-hover:bg-warning-500 group-hover:text-white transition-all shadow-sm">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">Secure & Transparent</h3>
              <p className="text-dark-500 leading-relaxed">Dynamic pricing calculation and secure account management means you always know exactly what you are paying for.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 relative overflow-hidden bg-primary-900 text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to park with ease?</h2>
          <p className="text-primary-200 text-lg mb-10">Join hundreds of drivers securing their parking spots every day.</p>
          <Link to="/register" className="inline-block px-10 py-4 rounded-xl bg-white text-primary-900 hover:bg-primary-50 text-lg font-bold transition-all shadow-xl hover:-translate-y-1">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-950 py-12 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600/20 text-primary-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">ParkEase</span>
          </div>
          <div className="text-dark-400 text-sm">
            © {new Date().getFullYear()} ParkEase. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
