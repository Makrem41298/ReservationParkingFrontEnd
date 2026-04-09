import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ROLES } from './constants/roles';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Auth pages
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProfilePage from './features/auth/pages/ProfilePage';

// General pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';

// Feature pages
import UsersListPage from './features/users/pages/UsersListPage';
import TarifGridListPage from './features/tarifGrid/pages/TarifGridListPage';
import ParkingLotListPage from './features/parkingLot/pages/ParkingLotListPage';
import ReservationsListPage from './features/reservations/pages/ReservationsListPage';
import PlansListPage from './features/plans/pages/PlansListPage';
import PlanParkingLotListPage from './features/planParkingLot/pages/PlanParkingLotListPage';
import SubscriptionsListPage from './features/subscriptions/pages/SubscriptionsListPage';
import ReclamationsListPage from './features/reclamations/pages/ReclamationsListPage';
import ReclamationDetailsPage from './features/reclamations/pages/ReclamationDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/parking-lots" element={<ParkingLotListPage />} />
            <Route path="/tarif-grids" element={<TarifGridListPage />} />
            <Route path="/reservations" element={<ReservationsListPage />} />
            <Route path="/subscriptions" element={<SubscriptionsListPage />} />
            <Route path="/plan-parking-lots" element={<PlanParkingLotListPage />} />
            <Route path="/reclamations" element={<ReclamationsListPage />} />
            <Route path="/reclamations/:id" element={<ReclamationDetailsPage />} />

            {/* Admin-only */}
            <Route
              path="/users"
              element={
                <RoleRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <UsersListPage />
                </RoleRoute>
              }
            />
            <Route
              path="/plans"
              element={
                <RoleRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <PlansListPage />
                </RoleRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
