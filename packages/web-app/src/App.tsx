import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PassesPage from './pages/PassesPage';
import CommunityPage from './pages/CommunityPage';
import QRDisplayPage from './pages/QRDisplayPage';
import AdminDashboard from './pages/AdminDashboard';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<><Navbar /><main className="container mx-auto px-4 py-8"><HomePage /></main></>} />
        <Route path="/login" element={<><Navbar /><main className="container mx-auto px-4 py-8"><LoginPage /></main></>} />
        
        {/* Admin Routes - No navbar for full-screen admin experience */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* User Routes */}
        {user && (
          <>
            <Route path="/passes" element={<><Navbar /><main className="container mx-auto px-4 py-8"><PassesPage /></main></>} />
            <Route path="/community" element={<><Navbar /><main className="container mx-auto px-4 py-8"><CommunityPage /></main></>} />
            <Route path="/qr/:passId" element={<><Navbar /><main className="container mx-auto px-4 py-8"><QRDisplayPage /></main></>} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
