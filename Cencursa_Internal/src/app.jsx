import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/Login';
import PlayerDashboard from './pages/PlayerDashboard';
import CharacterSheet from './pages/CharacterSheet';
import Inventory from './pages/Inventory';
import Documents from './pages/Documents';
import Requests from './pages/Requests';
import EventLogs from './pages/EventLogs';

// GM pages
import GMDashboard from './pages/gm/GMDashboard';
import GMPlayers from './pages/gm/GMPlayers';
import GMDocuments from './pages/gm/GMDocuments';
import GMRequests from './pages/gm/GMRequests';
import GMLogs from './pages/gm/GMLogs';
import GMCreateCharacter from './pages/gm/GMCreateCharacter';
import GMWorld from './pages/gm/GMWorld';
import ProtectedGMRoute from './components/ProtectedGMRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, isAuthenticated, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--void)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--gold-dark)', borderTopColor: 'transparent' }} />
          <div className="text-xs font-terminal tracking-widest opacity-40" style={{ color: 'var(--gold)' }}>
            CENCURSA SYSTEM LOADING...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  const isGM = user?.role === 'admin';

  return (
    <Routes>
      {/* Player routes */}
      <Route element={<AppLayout isGM={isGM} />}>
        <Route path="/" element={<PlayerDashboard />} />
        <Route path="/sheet" element={<CharacterSheet />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/logs" element={<EventLogs />} />

        {/* GM routes — protected, only role=admin */}
        <Route path="/gm" element={<ProtectedGMRoute><GMDashboard /></ProtectedGMRoute>} />
        <Route path="/gm/players" element={<ProtectedGMRoute><GMPlayers /></ProtectedGMRoute>} />
        <Route path="/gm/players/new" element={<ProtectedGMRoute><GMCreateCharacter /></ProtectedGMRoute>} />
        <Route path="/gm/documents" element={<ProtectedGMRoute><GMDocuments /></ProtectedGMRoute>} />
        <Route path="/gm/requests" element={<ProtectedGMRoute><GMRequests /></ProtectedGMRoute>} />
        <Route path="/gm/logs" element={<ProtectedGMRoute><GMLogs /></ProtectedGMRoute>} />
        <Route path="/gm/world" element={<ProtectedGMRoute><GMWorld /></ProtectedGMRoute>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App