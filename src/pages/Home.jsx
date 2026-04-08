import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { parkingLotAPI } from '../features/parkingLot/parkingLotAPI';
import { reservationAPI } from '../features/reservations/reservationAPI';
import { userAPI } from '../features/users/userAPI';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ parkingLots: 0, reservations: 0, users: 0 });
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [parkingRes, reservationRes] = await Promise.all([
        parkingLotAPI.getAll(),
        reservationAPI.getAll(),
      ]);

      let usersCount = 0;
      if (isAdmin) {
        try {
          const usersRes = await userAPI.getAllUsers();
          usersCount = usersRes.data.length;
        } catch {}
      }

      setStats({
        parkingLots: parkingRes.data.length,
        reservations: reservationRes.data.length,
        users: usersCount,
      });
      setRecentReservations(reservationRes.data.slice(0, 5));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Parking Lots',
      value: stats.parkingLots,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      color: 'bg-primary-600',
      link: '/parking-lots',
    },
    {
      title: isAdmin ? 'All Reservations' : 'My Reservations',
      value: stats.reservations,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-accent-600',
      link: '/reservations',
    },
  ];

  if (isAdmin) {
    cards.push({
      title: 'Total Users',
      value: stats.users,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-warning-500',
      link: '/users',
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
        <p className="text-dark-500 mt-1">Welcome back, {user?.firstName}! Here's your overview.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="group bg-white rounded-2xl border border-dark-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-500">{card.title}</p>
                <p className="text-3xl font-bold text-dark-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-2xl border border-dark-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-dark-100">
          <h2 className="text-lg font-semibold text-dark-800">Recent Reservations</h2>
          <Link to="/reservations" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>
        {recentReservations.length === 0 ? (
          <div className="p-8 text-center text-dark-400">
            <p>No reservations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Parking</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {recentReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-dark-800">{r.parkingLot?.name || `Lot #${r.parkingLotId}`}</td>
                    <td className="px-6 py-4 text-sm text-dark-500">{new Date(r.startTimeDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-dark-800">{parseFloat(r.totalPrice).toFixed(2)} TND</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    REQUESTED: 'bg-warning-500/10 text-warning-500',
    CONFIRMED: 'bg-accent-500/10 text-accent-600',
    CANCELLED: 'bg-danger-500/10 text-danger-500',
    COMPLETED: 'bg-primary-500/10 text-primary-600',
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-dark-100 text-dark-600'}`}>
      {status}
    </span>
  );
}
