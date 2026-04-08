import { createBrowserRouter } from 'react-router-dom';
import { ROLES } from '../constants/roles';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Guards
import ProtectedRoute from '../components/ProtectedRoute';
import RoleRoute from '../components/RoleRoute';

// Auth pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ProfilePage from '../features/auth/pages/ProfilePage';

// General pages
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

// Feature pages
import UsersListPage from '../features/users/pages/UsersListPage';
import TarifGridListPage from '../features/tarifGrid/pages/TarifGridListPage';
import ParkingLotListPage from '../features/parkingLot/pages/ParkingLotListPage';
import ReservationsListPage from '../features/reservations/pages/ReservationsListPage';
import PlansListPage from '../features/plans/pages/PlansListPage';
import PlanParkingLotListPage from '../features/planParkingLot/pages/PlanParkingLotListPage';
import SubscriptionsListPage from '../features/subscriptions/pages/SubscriptionsListPage';

const router = createBrowserRouter([
  // Public auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Protected routes
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/parking-lots', element: <ParkingLotListPage /> },
      { path: '/tarif-grids', element: <TarifGridListPage /> },
      { path: '/reservations', element: <ReservationsListPage /> },
      { path: '/subscriptions', element: <SubscriptionsListPage /> },
      { path: '/plan-parking-lots', element: <PlanParkingLotListPage /> },

      // Admin-only routes
      {
        path: '/users',
        element: (
          <RoleRoute roles={[ROLES.ADMIN]}>
            <UsersListPage />
          </RoleRoute>
        ),
      },
      {
        path: '/plans',
        element: (
          <RoleRoute roles={[ROLES.ADMIN]}>
            <PlansListPage />
          </RoleRoute>
        ),
      },
    ],
  },

  // 404
  { path: '*', element: <NotFound /> },
]);

export default router;
