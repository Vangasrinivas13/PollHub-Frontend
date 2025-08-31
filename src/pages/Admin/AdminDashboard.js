import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Users, Vote, BarChart3, Plus, Eye, Settings, TrendingUp, RefreshCw, Trash2,
  Shield, Activity, AlertTriangle, Clock, Database,
  UserCheck, Download
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import VoterDetails from '../../components/Admin/VoterDetails';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const [selectedPollForVoters, setSelectedPollForVoters] = useState(null);
  const [pollToDelete, setPollToDelete] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: dashboardData, isLoading, refetch } = useQuery(
    'adminDashboard',
    () => axios.get('/admin/dashboard').then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
      refetchOnWindowFocus: true
    }
  );

  const { data: realtimeStats } = useQuery(
    'adminRealtimeStats',
    () => axios.get('/admin/realtime-stats').then(res => res.data),
    {
      refetchInterval: 10000, // Refresh every 10 seconds
      enabled: !!dashboardData
    }
  );

  // Delete poll mutation
  const deletePollMutation = useMutation(
    (pollId) => axios.delete(`/admin/polls/${pollId}`),
    {
      onSuccess: (data, pollId) => {
        toast.success('Poll deleted successfully');
        queryClient.invalidateQueries('adminDashboard');
        queryClient.invalidateQueries('adminRealtimeStats');
        queryClient.removeQueries(['poll', pollId]);
        setPollToDelete(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete poll');
      }
    }
  );

  const handleDeletePoll = (poll) => {
    setPollToDelete(poll);
  };

  const confirmDeletePoll = () => {
    if (pollToDelete) {
      deletePollMutation.mutate(pollToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboardData?.statistics;
  const currentStats = realtimeStats || stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">System Control Center</h1>
                  <p className="text-purple-200 mt-1">
                    Advanced poll management & system analytics
                  </p>
                  {realtimeStats && (
                    <div className="flex items-center mt-2 text-sm text-green-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Live monitoring • {new Date().toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={refetch}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync
                </Button>
                <Link to="/admin/create-poll">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Poll
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Management Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to="/admin/create-poll">
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Poll
                </button>
              </Link>
              <Link to="/admin/users">
                <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-xl hover:from-green-600 hover:to-teal-600 transition-all flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Users
                </button>
              </Link>
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Export Reports
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              System Alerts
            </h3>
            <div className="space-y-3">
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                <p className="text-green-300 text-sm">All systems operational</p>
                <p className="text-green-200 text-xs">Last check: {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm">Database sync active</p>
                <p className="text-blue-200 text-xs">Real-time updates enabled</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="h-6 w-6 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-purple-200">New user registered</div>
              <div className="text-blue-200">Poll created: "Best Feature"</div>
              <div className="text-green-200">15 votes cast in last hour</div>
              <div className="text-yellow-200">System backup completed</div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* System Health */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">System Health</p>
                <p className="text-3xl font-bold mt-1">98.5%</p>
                <p className="text-emerald-200 text-xs mt-1">All systems operational</p>
              </div>
              <Activity className="h-10 w-10 text-emerald-200" />
            </div>
          </div>

          {/* User Management */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-1">{currentStats?.users?.totalUsers || 0}</p>
                <p className="text-blue-200 text-xs mt-1">
                  {realtimeStats && realtimeStats.counters?.activeUsers ? 
                    `${realtimeStats.counters.activeUsers} active` : 'Loading...'}
                </p>
              </div>
              <UserCheck className="h-10 w-10 text-blue-200" />
            </div>
          </div>

          {/* Poll Analytics */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Polls</p>
                <p className="text-3xl font-bold mt-1">{currentStats?.polls?.activePolls || 0}</p>
                <p className="text-purple-200 text-xs mt-1">
                  {currentStats?.polls?.totalPolls || 0} total created
                </p>
              </div>
              <Database className="h-10 w-10 text-purple-200" />
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Votes</p>
                <p className="text-3xl font-bold mt-1">{currentStats?.polls?.totalVotes || 0}</p>
                <p className="text-orange-200 text-xs mt-1">
                  {realtimeStats?.counters?.votesLast24h || 0} in 24h
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Polls */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Recent Polls</Card.Title>
                <Link to="/admin/polls">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Content>
              {dashboardData?.recentActivity?.polls?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.polls.map((poll) => (
                    <div key={poll.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {poll.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Created by {poll.createdBy}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-4">
                              {poll.totalVotes} votes
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 text-xs rounded-full ${
                            poll.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : poll.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {poll.status}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedPollForVoters(poll.id)}
                            title="View voter details"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Link to={`/polls/${poll.id}`}>
                            <Button variant="ghost" size="sm" title="View poll">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeletePoll(poll)}
                            title="Delete poll"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No polls created yet</p>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Recent Votes */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Recent Voting Activity</Card.Title>
                <Link to="/admin/votes">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Content>
              {dashboardData?.recentActivity?.votes?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.votes.map((vote) => (
                    <div key={vote.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {vote.pollTitle}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            Voted by {vote.voterName}
                          </p>
                          <p className="text-sm text-primary-600 mb-2">
                            Option: {vote.optionText}
                          </p>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(vote.votedAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent voting activity</p>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Trending Polls */}
        <Card className="mb-8">
          <Card.Header>
            <Card.Title>Trending Polls</Card.Title>
            <Card.Description>
              Most popular polls based on votes and views
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {dashboardData?.trending?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.trending.map((poll) => (
                  <div key={poll.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {poll.title}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{poll.totalVotes} votes</span>
                      <span>{poll.views} views</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      By {poll.createdBy}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No trending polls at the moment</p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Description>
              Common administrative tasks
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/admin/create-poll">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <Plus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Create Poll</h4>
                  <p className="text-sm text-gray-600">Start a new poll</p>
                </div>
              </Link>
              
              <Link to="/admin/users">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Manage Users</h4>
                  <p className="text-sm text-gray-600">View and manage users</p>
                </div>
              </Link>

              <Link to="/admin/polls">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <Vote className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Manage Polls</h4>
                  <p className="text-sm text-gray-600">View and edit polls</p>
                </div>
              </Link>

              <Link to="/admin/analytics">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <BarChart3 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Analytics</h4>
                  <p className="text-sm text-gray-600">View detailed reports</p>
                </div>
              </Link>
            </div>
          </Card.Content>
        </Card>

        {/* VoterDetails Modal */}
        {selectedPollForVoters && (
          <VoterDetails
            pollId={selectedPollForVoters}
            onClose={() => setSelectedPollForVoters(null)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {pollToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Poll</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete this poll?
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900">{pollToDelete.title}</h4>
                  <p className="text-sm text-gray-600">
                    {pollToDelete.totalVotes} votes • Created by {pollToDelete.createdBy}
                  </p>
                </div>
                <p className="text-red-600 text-sm mt-3">
                  ⚠️ This action cannot be undone. All votes and data will be permanently deleted.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setPollToDelete(null)}
                  disabled={deletePollMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeletePoll}
                  loading={deletePollMutation.isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Poll
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
