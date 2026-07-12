import { useAuth } from '../context/AuthContext';
import ClientChatbot from './ClientChatbot';

export default function GlobalChatbot() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (isAdmin) return null;

  return <ClientChatbot isAnonymous={!isAuthenticated} />;
}
