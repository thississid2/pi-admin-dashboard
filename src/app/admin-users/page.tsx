"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedAdminRoute';
import { 
  AdminUser, 
  AdminRole, 
  AdminUserStatus, 
  Permission,
  getRoleDisplayName,
  getRoleColor,
  getStatusColor 
} from '@/types/adminUsers';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { lambdaApi } from '@/lib/lambdaApi';
import { 
  UserShield, 
  Users, 
  Shield, 
  Settings, 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye
} from '@/components/icons';

export default function AdminUsersPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { hasPermission } = useAdminAuth();

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const data = await lambdaApi.getAdminUsers() as { users: AdminUser[] };
      setAdminUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete admin user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await lambdaApi.deleteAdminUser(userId);
      alert('Admin user deleted successfully!');
      fetchAdminUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the admin user';
      alert(`Failed to delete admin user: ${errorMessage}`);
      console.error('Error deleting admin user:', error);
    }
  };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatsCount = (role: AdminRole) => {
    return adminUsers.filter(user => user.role === role).length;
  };

  return (
    <ProtectedRoute requiredPermissions={[Permission.VIEW_ADMIN_USERS]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
              <p className="text-gray-600">Manage Pi Admin Console access and permissions</p>
            </div>
            {hasPermission(Permission.CREATE_ADMIN_USERS) && (
              <Link href="/admin-users/add">
                <button className="bg-[#1ABC9C] text-white px-4 py-2 rounded-lg hover:bg-[#16A085] transition flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Admin User</span>
                </button>
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Super Admins</p>
                  <p className="text-2xl font-bold text-red-600">
                    {getStatsCount(AdminRole.SUPERADMIN)}
                  </p>
                </div>
                <UserShield className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Administrators</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {getStatsCount(AdminRole.ADMIN)}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Managers</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {getStatsCount(AdminRole.MANAGER)}
                  </p>
                </div>
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Support Staff</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getStatsCount(AdminRole.SUPPORT)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Admin Users</h2>
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search admin users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent w-64"
                    />
                  </div>
                  
                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    {Object.values(AdminRole).map(role => (
                      <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    {Object.values(AdminUserStatus).map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
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
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ABC9C] mx-auto"></div>
                        <span className="ml-4 text-gray-600">Loading admin users...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#1ABC9C] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin-users/${user.id}`}>
                              <button className="text-[#1ABC9C] hover:text-[#16A085] p-1">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            {hasPermission(Permission.EDIT_ADMIN_USERS) && (
                              <Link href={`/admin-users/edit/${user.id}`}>
                                <button className="text-blue-600 hover:text-blue-800 p-1">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </Link>
                            )}
                            {hasPermission(Permission.DELETE_ADMIN_USERS) && (
                              <button
                                onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No admin users found</h3>
                          <p className="text-gray-500">
                            Try adjusting your search or filter criteria.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
