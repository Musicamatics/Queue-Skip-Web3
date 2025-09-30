import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

interface PassAllocation {
  id: string;
  userGroup: string;
  passTypeName: string;
  quantity: number;
  period: 'daily' | 'weekly' | 'monthly' | 'semester';
  autoRenew: boolean;
}

interface PassType {
  id: string;
  name: string;
  description: string;
  validityPeriod: number;
  transferable: boolean;
}

interface UserPass {
  id: string;
  userId: string;
  userEmail?: string;
  passTypeName: string;
  status: 'active' | 'used' | 'expired' | 'transferred';
  validFrom: string;
  validUntil: string;
}

const PassManagement: React.FC = () => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<PassAllocation[]>([]);
  const [passTypes, setPassTypes] = useState<PassType[]>([]);
  const [userPasses, setUserPasses] = useState<UserPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'allocations' | 'passes' | 'types'>('allocations');
  const [showAddAllocation, setShowAddAllocation] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAllocations: PassAllocation[] = [
          {
            id: 'alloc-1',
            userGroup: 'students',
            passTypeName: 'Standard Pass',
            quantity: 2,
            period: 'daily',
            autoRenew: true
          },
          {
            id: 'alloc-2',
            userGroup: 'employees',
            passTypeName: 'Fast Pass',
            quantity: 1,
            period: 'daily',
            autoRenew: true
          },
          {
            id: 'alloc-3',
            userGroup: 'visitors',
            passTypeName: 'Visitor Pass',
            quantity: 1,
            period: 'daily',
            autoRenew: false
          }
        ];

        const mockPassTypes: PassType[] = [
          {
            id: 'pass-standard',
            name: 'Standard Pass',
            description: 'Regular queue skip pass with survey requirement',
            validityPeriod: 24,
            transferable: true
          },
          {
            id: 'pass-fast',
            name: 'Fast Pass',
            description: 'Priority queue skip pass for rush hours',
            validityPeriod: 4,
            transferable: true
          },
          {
            id: 'pass-visitor',
            name: 'Visitor Pass',
            description: 'One-time visitor pass for building access',
            validityPeriod: 2,
            transferable: false
          }
        ];

        const mockUserPasses: UserPass[] = [
          {
            id: 'pass-1',
            userId: 'user-1',
            userEmail: 'student@hku.hk',
            passTypeName: 'Standard Pass',
            status: 'active',
            validFrom: '2025-09-30T00:00:00Z',
            validUntil: '2025-10-01T00:00:00Z'
          },
          {
            id: 'pass-2',
            userId: 'user-2',
            userEmail: 'employee@hku.hk',
            passTypeName: 'Fast Pass',
            status: 'used',
            validFrom: '2025-09-30T07:00:00Z',
            validUntil: '2025-09-30T11:00:00Z'
          },
          {
            id: 'pass-3',
            userId: 'user-3',
            userEmail: 'visitor@example.com',
            passTypeName: 'Visitor Pass',
            status: 'expired',
            validFrom: '2025-09-29T09:00:00Z',
            validUntil: '2025-09-29T11:00:00Z'
          }
        ];

        setAllocations(mockAllocations);
        setPassTypes(mockPassTypes);
        setUserPasses(mockUserPasses);
      } catch (err: any) {
        setError('Failed to load pass data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAllocatePass = (userId: string, passTypeId: string) => {
    // Add pass allocation logic
    console.log(`Allocating pass ${passTypeId} to user ${userId}`);
  };

  const handleDeductPass = (passId: string) => {
    setUserPasses(userPasses.filter(pass => pass.id !== passId));
  };

  const handleUpdateAllocation = (allocationId: string, updates: Partial<PassAllocation>) => {
    setAllocations(allocations.map(alloc => 
      alloc.id === allocationId ? { ...alloc, ...updates } : alloc
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Pass Management</h1>
          <p className="text-gray-600">Configure passes and allocations for {user?.venueId}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'allocations', name: 'Pass Allocations', count: allocations.length },
            { id: 'passes', name: 'Active Passes', count: userPasses.filter(p => p.status === 'active').length },
            { id: 'types', name: 'Pass Types', count: passTypes.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Pass Allocations Tab */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pass Allocations</h2>
            <button
              onClick={() => setShowAddAllocation(true)}
              className="btn btn-primary"
            >
              Add Allocation Rule
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto Renew
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {allocation.userGroup}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {allocation.passTypeName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <input
                        type="number"
                        value={allocation.quantity}
                        onChange={(e) => handleUpdateAllocation(allocation.id, { quantity: parseInt(e.target.value) })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <select
                        value={allocation.period}
                        onChange={(e) => handleUpdateAllocation(allocation.id, { period: e.target.value as any })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="semester">Semester</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={allocation.autoRenew}
                        onChange={(e) => handleUpdateAllocation(allocation.id, { autoRenew: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Passes Tab */}
      {activeTab === 'passes' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active User Passes</h2>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPasses.map((pass) => (
                  <tr key={pass.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {pass.userEmail || `User ${pass.userId.slice(-4)}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {pass.passTypeName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pass.status)}`}>
                        {pass.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(pass.validUntil).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {pass.status === 'active' && (
                        <>
                          <button className="text-blue-600 hover:text-blue-800">Extend</button>
                          <button 
                            onClick={() => handleDeductPass(pass.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pass Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pass Types</h2>
            <button className="btn btn-primary">Add Pass Type</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {passTypes.map((passType) => (
              <div key={passType.id} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{passType.name}</h3>
                  <div className="flex space-x-1">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{passType.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Validity:</span>
                    <span className="font-medium">{passType.validityPeriod}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transferable:</span>
                    <span className={`font-medium ${passType.transferable ? 'text-green-600' : 'text-red-600'}`}>
                      {passType.transferable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{userPasses.filter(p => p.status === 'active').length}</div>
          <div className="text-sm text-gray-500">Active Passes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{userPasses.filter(p => p.status === 'used').length}</div>
          <div className="text-sm text-gray-500">Used Today</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{userPasses.filter(p => p.status === 'expired').length}</div>
          <div className="text-sm text-gray-500">Expired</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{allocations.reduce((sum, alloc) => sum + alloc.quantity, 0)}</div>
          <div className="text-sm text-gray-500">Daily Allocation</div>
        </div>
      </div>
    </div>
  );
};

export default PassManagement;
