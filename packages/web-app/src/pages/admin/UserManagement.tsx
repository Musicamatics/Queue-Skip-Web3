import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

interface User {
  id: string;
  email?: string;
  governmentId?: string;
  web3Address?: string;
  ssoId?: string;
  role: 'user' | 'admin' | 'staff' | 'super_admin';
  venueRole?: 'user' | 'admin' | 'staff';
  userGroup: string;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  lastLoginAt?: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddUser, setShowAddUser] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Mock data for now - replace with API calls
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUsers: User[] = [
          {
            id: 'user-1',
            email: 'student@hku.hk',
            role: 'user',
            venueRole: 'user',
            userGroup: 'students',
            status: 'active',
            createdAt: '2025-09-25T10:00:00Z',
            lastLoginAt: '2025-09-30T08:30:00Z'
          },
          {
            id: 'user-2',
            email: 'employee@hku.hk',
            role: 'user',
            venueRole: 'staff',
            userGroup: 'employees',
            status: 'active',
            createdAt: '2025-09-20T14:00:00Z',
            lastLoginAt: '2025-09-29T16:45:00Z'
          },
          {
            id: 'user-3',
            web3Address: '0x1234...5678',
            role: 'user',
            venueRole: 'user',
            userGroup: 'visitors',
            status: 'active',
            createdAt: '2025-09-28T09:15:00Z',
            lastLoginAt: '2025-09-30T07:20:00Z'
          },
          {
            id: 'user-4',
            governmentId: 'HK987654321',
            email: 'manager@hku.hk',
            role: 'admin',
            venueRole: 'admin',
            userGroup: 'administrators',
            status: 'active',
            createdAt: '2025-09-15T12:00:00Z',
            lastLoginAt: '2025-09-30T09:00:00Z'
          }
        ];
        
        setUsers(mockUsers);
      } catch (err: any) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handlePromoteUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: 'admin', venueRole: 'admin', userGroup: 'administrators' }
        : user
    ));
  };

  const handleDemoteUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: 'user', venueRole: 'user' }
        : user
    ));
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: 'suspended' }
        : user
    ));
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    const userIds = Array.from(selectedUsers);
    
    switch (bulkAction) {
      case 'promote':
        setUsers(users.map(user => 
          userIds.includes(user.id)
            ? { ...user, role: 'admin', venueRole: 'admin', userGroup: 'administrators' }
            : user
        ));
        break;
      case 'demote':
        setUsers(users.map(user => 
          userIds.includes(user.id)
            ? { ...user, role: 'user', venueRole: 'user' }
            : user
        ));
        break;
      case 'suspend':
        setUsers(users.map(user => 
          userIds.includes(user.id)
            ? { ...user, status: 'suspended' }
            : user
        ));
        break;
      case 'activate':
        setUsers(users.map(user => 
          userIds.includes(user.id)
            ? { ...user, status: 'active' }
            : user
        ));
        break;
    }
    
    setSelectedUsers(new Set());
    setBulkAction('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'super_admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users and their permissions for {user?.venueId}</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="btn btn-primary"
        >
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-800">
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="text-sm border border-blue-300 rounded px-2 py-1"
            >
              <option value="">Choose action...</option>
              <option value="promote">Promote to Admin</option>
              <option value="demote">Demote to User</option>
              <option value="suspend">Suspend</option>
              <option value="activate">Activate</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.email || user.governmentId || user.ssoId || 'Web3 User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.web3Address && `${user.web3Address.slice(0, 6)}...${user.web3Address.slice(-4)}`}
                      {user.governmentId && `ID: ${user.governmentId}`}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    {user.venueRole && user.venueRole !== user.role && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.venueRole)}`}>
                        {user.venueRole} (venue)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.userGroup}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handlePromoteUser(user.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Promote
                    </button>
                  )}
                  {user.role === 'admin' && user.role !== 'super_admin' && (
                    <button
                      onClick={() => handleDemoteUser(user.id)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      Demote
                    </button>
                  )}
                  {user.status === 'active' && (
                    <button
                      onClick={() => handleSuspendUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</div>
          <div className="text-sm text-gray-500">Active Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</div>
          <div className="text-sm text-gray-500">Administrators</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'staff').length}</div>
          <div className="text-sm text-gray-500">Staff Members</div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
