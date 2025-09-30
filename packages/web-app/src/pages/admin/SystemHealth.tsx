import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface SystemStatus {
  api: 'healthy' | 'warning' | 'error';
  database: 'healthy' | 'warning' | 'error';
  blockchain: 'healthy' | 'warning' | 'error';
  redis: 'healthy' | 'warning' | 'error';
  websocket: 'healthy' | 'warning' | 'error';
}

interface SystemMetrics {
  uptime: string;
  responseTime: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
}

const SystemHealth: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const loadSystemHealth = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus({
          api: 'healthy',
          database: 'healthy',
          blockchain: 'warning',
          redis: 'healthy',
          websocket: 'healthy'
        });

        setMetrics({
          uptime: '2d 14h 32m',
          responseTime: 127,
          activeUsers: 89,
          memoryUsage: 68,
          cpuUsage: 23
        });

        setLogs([
          '2025-09-30T09:00:00Z - System startup completed',
          '2025-09-30T09:01:15Z - Database connection established',
          '2025-09-30T09:01:20Z - Redis cache initialized',
          '2025-09-30T09:01:25Z - WebSocket server started',
          '2025-09-30T09:02:00Z - Warning: Blockchain service slow response time',
          '2025-09-30T09:05:30Z - User authentication service healthy',
          '2025-09-30T09:10:00Z - Pass allocation service running',
        ]);
      } catch (error) {
        console.error('Failed to load system health:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">Monitor system status and performance</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* System Status */}
      {status && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Service Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(status).map(([service, serviceStatus]) => (
              <div key={service} className="text-center">
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(serviceStatus)}`}>
                  <span className="mr-2">{getStatusIcon(serviceStatus)}</span>
                  {serviceStatus}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-900 capitalize">
                  {service === 'api' ? 'API Server' : service}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{metrics.uptime}</div>
            <div className="text-sm text-gray-500">System Uptime</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{metrics.responseTime}ms</div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{metrics.memoryUsage}%</div>
            <div className="text-sm text-gray-500">Memory Usage</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{metrics.cpuUsage}%</div>
            <div className="text-sm text-gray-500">CPU Usage</div>
          </div>
        </div>
      )}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Response Time (24h)</h3>
          <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Chart visualization would go here</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Resource Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Memory</span>
                <span>{metrics?.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics?.memoryUsage || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>CPU</span>
                <span>{metrics?.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics?.cpuUsage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Recent System Logs</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All Logs</button>
        </div>
        <div className="p-6">
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Restart Services</h4>
              <p className="text-sm text-gray-500">Restart all backend services</p>
            </div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Clear Cache</h4>
              <p className="text-sm text-gray-500">Clear Redis cache</p>
            </div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Database Backup</h4>
              <p className="text-sm text-gray-500">Create database backup</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
