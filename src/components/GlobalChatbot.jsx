import { useAuth } from '../context/AuthContext';
import ClientChatbot from './ClientChatbot';

/**
 * Global chatbot wrapper that renders the chatbot on all pages.
 * - Anonymous users (not logged in) → uses /chat-anonyme API
 * - CLIENT users → uses /agent-client API
 * - ADMIN / SUPER_ADMIN → chatbot is hidden (they have their own agent in reclamations)
 */
export default function GlobalChatbot() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Don't render while auth is loading
  if (loading) return null;

  // Hide chatbot for admin and super admin users
  if (isAdmin) return null;

  // Render chatbot — anonymous if not logged in, client API if logged in
  return <ClientChatbot isAnonymous={!isAuthenticated} />;
}
