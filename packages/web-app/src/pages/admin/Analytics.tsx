import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

interface TransferData {
  id: string;
  passId: string;
  fromUserEmail: string;
  toUserEmail: string;
  passType: string;
  transferDate: string;
  status: 'completed' | 'pending' | 'failed';
}

interface UsageStats {
  totalPasses: number;
  activePasses: number;
  usedPasses: number;
  transferredPasses: number;
  transferRate: number;
  peakHours: string[];
}

interface ChartData {
  date: string;
  passes: number;
  transfers: number;
  usage: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTransfers: TransferData[] = [
          {
            id: 'transfer-1',
            passId: 'pass-123',
            fromUserEmail: 'student1@hku.hk',
            toUserEmail: 'student2@hku.hk',
            passType: 'Standard Pass',
            transferDate: '2025-09-30T08:30:00Z',
            status: 'completed'
          },
          {
            id: 'transfer-2',
            passId: 'pass-124',
            fromUserEmail: 'employee@hku.hk',
            toUserEmail: 'student3@hku.hk',
            passType: 'Fast Pass',
            transferDate: '2025-09-30T10:15:00Z',
            status: 'completed'
          },
          {
            id: 'transfer-3',
            passId: 'pass-125',
            fromUserEmail: 'student4@hku.hk',
            toUserEmail: 'student5@hku.hk',
            passType: 'Standard Pass',
            transferDate: '2025-09-30T14:22:00Z',
            status: 'pending'
          },
          {
            id: 'transfer-4',
            passId: 'pass-126',
            fromUserEmail: 'visitor@example.com',
            toUserEmail: 'student6@hku.hk',
            passType: 'Visitor Pass',
            transferDate: '2025-09-29T16:45:00Z',
            status: 'failed'
          }
        ];

        const mockStats: UsageStats = {
          totalPasses: 245,
          activePasses: 89,
          usedPasses: 134,
          transferredPasses: 22,
          transferRate: 8.98, // percentage
          peakHours: ['08:00-09:00', '12:00-13:00', '17:00-18:00']
        };

        const mockChartData: ChartData[] = [
          { date: '2025-09-24', passes: 32, transfers: 3, usage: 28 },
          { date: '2025-09-25', passes: 45, transfers: 5, usage: 41 },
          { date: '2025-09-26', passes: 38, transfers: 2, usage: 35 },
          { date: '2025-09-27', passes: 52, transfers: 7, usage: 48 },
          { date: '2025-09-28', passes: 41, transfers: 4, usage: 39 },
          { date: '2025-09-29', passes: 37, transfers: 1, usage: 33 },
          { date: '2025-09-30', passes: 49, transfers: 6, usage: 44 }
        ];

        setTransfers(mockTransfers);
        setStats(mockStats);
        setChartData(mockChartData);
      } catch (err: any) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  const getTransferStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">View detailed reports for {user?.venueId}</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn btn-secondary text-sm">Export Report</button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Passes</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalPasses}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Passes</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activePasses}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Transfers</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.transferredPasses}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Transfer Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.transferRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Trends</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t">
                  <div 
                    className="bg-blue-500 rounded-t transition-all duration-500"
                    style={{ height: `${(data.usage / 50) * 200}px` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(data.date).getDate()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                <span>Pass Usage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Usage Hours</h3>
          <div className="space-y-4">
            {stats?.peakHours.map((hour, index) => (
              <div key={hour} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{hour}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${100 - (index * 20)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500">{100 - (index * 20)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pass Transfers Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Pass Transfers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transfer Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {transfer.fromUserEmail}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transfer.toUserEmail}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transfer.passType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(transfer.transferDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransferStatusColor(transfer.status)}`}>
                      {transfer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">View</button>
                    {transfer.status === 'pending' && (
                      <button className="text-red-600 hover:text-red-800">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {transfers.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">Completed Transfers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {transfers.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending Transfers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {transfers.filter(t => t.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-500">Failed Transfers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
