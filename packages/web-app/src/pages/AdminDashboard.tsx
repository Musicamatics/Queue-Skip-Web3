import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import UserManagement from './admin/UserManagement';
import PassManagement from './admin/PassManagement';
import Analytics from './admin/Analytics';
import VenueSettings from './admin/VenueSettings';
import SystemHealth from './admin/SystemHealth';
import FeatureToggles from './admin/FeatureToggles';

interface VenueStats {
  totalUsers: number;
  activeUsers: number;
  passesIssued: number;
  passesRedeemed: number;
}

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [venueStats, setVenueStats] = useState<VenueStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  useEffect(() => {
    // Check if user is admin
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'super_admin'))) {
      navigate('/login');
      return;
    }

    // Load venue statistics
    const loadStats = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setVenueStats({
          totalUsers: 150,
          activeUsers: 89,
          passesIssued: 245,
          passesRedeemed: 198,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null; // Will redirect in useEffect
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'users': return <UserManagement />;
      case 'passes': return <PassManagement />;
      case 'analytics': return <Analytics />;
      case 'settings': return <VenueSettings />;
      case 'health': return <SystemHealth />;
      case 'features': return <FeatureToggles />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900">{venueStats?.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-3xl font-bold text-green-600">{venueStats?.activeUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Passes Issued</h3>
              <p className="text-3xl font-bold text-blue-600">{venueStats?.passesIssued}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Passes Redeemed</h3>
              <p className="text-3xl font-bold text-purple-600">{venueStats?.passesRedeemed}</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveSection('users')}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-900">User Management</h4>
                <p className="text-sm text-gray-500">Manage users and permissions</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveSection('passes')}
              className="p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Pass Management</h4>
                <p className="text-sm text-gray-500">Configure passes and allocations</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveSection('analytics')}
              className="p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-500">View detailed reports</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveSection('settings')}
              className="p-4 border border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Venue Settings</h4>
                <p className="text-sm text-gray-500">Configure venue preferences</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveSection('health')}
              className="p-4 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-900">System Health</h4>
                <p className="text-sm text-gray-500">Monitor system status</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveSection('features')}
              className="p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Feature Toggles</h4>
                <p className="text-sm text-gray-500">Enable/disable features</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  New user registered: student@hku.hk
                </p>
                <p className="text-sm text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Pass redeemed at {user.venueId}
                </p>
                <p className="text-sm text-gray-500">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  System maintenance scheduled
                </p>
                <p className="text-sm text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex items-center px-6 py-4 border-b">
          <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">QS</span>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          </div>
        </div>
        
        <nav className="mt-6">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: '📊' },
            { id: 'users', name: 'User Management', icon: '👥' },
            { id: 'passes', name: 'Pass Management', icon: '🎫' },
            { id: 'analytics', name: 'Analytics', icon: '📈' },
            { id: 'settings', name: 'Venue Settings', icon: '⚙️' },
            { id: 'health', name: 'System Health', icon: '🏥' },
            { id: 'features', name: 'Feature Toggles', icon: '🔧' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-6 py-3 flex items-center hover:bg-gray-50 transition-colors ${
                activeSection === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' : 'text-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="text-sm text-gray-600 mb-2">
            {user.role === 'super_admin' ? 'Super Administrator' : `${user.venueId} Administrator`}
          </div>
          <div className="text-xs text-gray-500 mb-3">Welcome, {user.email}</div>
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Switch to User View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
