import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { User, Eye, Shield, Lock, Unlock, Search, Filter, Users, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading, refetch } = useQuery(
    ['adminUsers', page, searchTerm, roleFilter, statusFilter],
    () => axios.get('/admin/users', {
      params: {
        page,
        limit: 20,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined
      }
    }).then(res => res.data),
    {
      keepPreviousData: true
    }
  );

  const { data: userDetails, isLoading: loadingDetails } = useQuery(
    ['userDetails', selectedUser?.id],
    () => axios.get(`/admin/users/${selectedUser.id}`).then(res => res.data),
    {
      enabled: !!selectedUser?.id
    }
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/admin/users/${userId}/toggle-status`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-indigo-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, view profiles, and monitor user activity
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Card.Content className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="voter">Voters</option>
                <option value="admin">Admins</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setPage(1);
                }}
                variant="outline"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </Card.Content>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <Card.Title>Users ({usersData?.pagination?.totalUsers || 0})</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {usersData?.users?.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={user.isActive ? "outline" : "default"}
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="voter">Voter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {usersData?.pagination && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Page {usersData.pagination.currentPage} of {usersData.pagination.totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!usersData.pagination.hasPrev}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!usersData.pagination.hasNext}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>

          {/* User Details Panel */}
          <div className="lg:col-span-1">
            {showUserDetails && selectedUser ? (
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <Card.Title>User Details</Card.Title>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowUserDetails(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card.Header>
                <Card.Content>
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : userDetails?.user ? (
                    <div className="space-y-6">
                      {/* Profile Picture & Basic Info */}
                      <div className="text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          {userDetails.user.profilePicture ? (
                            <img
                              src={userDetails.user.profilePicture}
                              alt={userDetails.user.name}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-10 w-10 text-indigo-600" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {userDetails.user.name}
                        </h3>
                        <p className="text-gray-600">{userDetails.user.email}</p>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          {userDetails.user.phoneNumber && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{userDetails.user.phoneNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{userDetails.user.email}</span>
                          </div>
                          {userDetails.user.dateOfBirth && (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{format(new Date(userDetails.user.dateOfBirth), 'PP')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      {userDetails.user.address && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
                          <div className="flex items-start text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                            <div>
                              {userDetails.user.address.street && (
                                <div>{userDetails.user.address.street}</div>
                              )}
                              <div>
                                {userDetails.user.address.city && `${userDetails.user.address.city}, `}
                                {userDetails.user.address.state && `${userDetails.user.address.state} `}
                                {userDetails.user.address.zipCode}
                              </div>
                              {userDetails.user.address.country && (
                                <div>{userDetails.user.address.country}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Account Status */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Account Status</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Status</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              userDetails.user.isActive 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {userDetails.user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Role</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              userDetails.user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {userDetails.user.role}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Email Verified</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              userDetails.user.emailVerified 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {userDetails.user.emailVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">
                              {userDetails.user.stats?.totalVotes || 0}
                            </div>
                            <div className="text-xs text-gray-600">Total Votes</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {userDetails.user.stats?.totalPolls || 0}
                            </div>
                            <div className="text-xs text-gray-600">Polls Voted</div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Recent Votes</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {userDetails.user.recentVotes?.length > 0 ? (
                            userDetails.user.recentVotes.map((vote, index) => (
                              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                <div className="font-medium text-gray-900 truncate">
                                  {vote.pollTitle}
                                </div>
                                <div className="text-gray-600 text-xs">
                                  {format(new Date(vote.votedAt), 'PPp')}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No recent votes</p>
                          )}
                        </div>
                      </div>

                      {/* Account Dates */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Account Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Member Since</span>
                            <span>{format(new Date(userDetails.user.createdAt), 'PP')}</span>
                          </div>
                          {userDetails.user.lastLogin && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Login</span>
                              <span>{format(new Date(userDetails.user.lastLogin), 'PPp')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Failed to load user details
                    </div>
                  )}
                </Card.Content>
              </Card>
            ) : (
              <Card>
                <Card.Content className="p-8 text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a user to view details</p>
                </Card.Content>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
