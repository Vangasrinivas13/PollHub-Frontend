import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Vote, Clock, BarChart3, Trophy, Plus, ArrowRight, RefreshCw,
  Bell, CheckCircle, Activity, TrendingUp, Award,
  Users, Calendar, Target, Zap
} from 'lucide-react';
import axios from 'axios';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { formatDistanceToNow, format } from 'date-fns';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [notifications] = useState([
    { id: 1, message: `Welcome back, ${user?.name || 'Voter'}!`, read: false, time: 'Just now' }
  ]);

  const { data: dashboardData, isLoading, refetch } = useQuery(
    'userDashboard',
    () => axios.get('/users/dashboard').then(res => res.data),
    {
      enabled: !!user,
      refetchInterval: 30000,
      refetchOnWindowFocus: true
    }
  );

  const { data: userStats } = useQuery(
    'userStats',
    () => axios.get('/users/stats').then(res => res.data),
    {
      enabled: !!user,
      refetchInterval: 60000
    }
  );

  const { data: activePolls } = useQuery(
    'activePolls',
    () => axios.get('/polls?status=active').then(res => res.data),
    {
      enabled: !!user,
      refetchInterval: 15000
    }
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-8 bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Welcome back, {user?.name || 'Voter'}!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Ready to make your voice heard? Let's explore what's happening.
                  </p>
                </div>
              </div>
              
              {activePolls && (
                <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200 w-fit">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <Zap className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-700 font-medium text-sm">
                    {activePolls.length} live polls • Real-time updates
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="relative p-3 rounded-full border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
              
              <Button 
                onClick={refetch}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Data
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Total Votes Cast</p>
                <p className="text-3xl font-bold mb-1">
                  {dashboardData?.stats?.totalVotes || 0}
                </p>
                <div className="flex items-center text-blue-200 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Your impact
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Vote className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-2">Polls Participated</p>
                <p className="text-3xl font-bold mb-1">
                  {userStats?.overview?.totalPolls || 0}
                </p>
                <div className="flex items-center text-emerald-200 text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Engagement level
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-2">Available Now</p>
                <p className="text-3xl font-bold mb-1">
                  {dashboardData?.availablePolls?.length || 0}
                </p>
                <div className="flex items-center text-amber-200 text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Ready to vote
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-2">Member Since</p>
                <p className="text-2xl font-bold mb-1">
                  {dashboardData?.user?.joinDate ? 
                    format(new Date(dashboardData.user.joinDate), 'MMM yyyy') 
                    : 'New'}
                </p>
                <div className="flex items-center text-purple-200 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {dashboardData?.user?.joinDate ? 
                    formatDistanceToNow(new Date(dashboardData.user.joinDate)) + ' with us'
                    : 'Welcome!'}
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Polls - Enhanced */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Available Polls
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Fresh polls waiting for your vote
                  </p>
                </div>
                <Link to="/polls">
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.availablePolls?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.availablePolls.slice(0, 4).map((poll, index) => (
                    <div key={poll.id} className="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">LIVE</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {poll.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {poll.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Ends {formatDistanceToNow(new Date(poll.endDate), { addSuffix: true })}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Users className="h-3 w-3 mr-1" />
                              {poll.totalVotes || 0} votes
                            </div>
                          </div>
                        </div>
                        <Link to={`/polls/${poll.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md">
                            Vote Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Vote className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Polls</h4>
                  <p className="text-gray-500 mb-4">Check back later for new voting opportunities</p>
                  <Link to="/polls">
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      Browse All Polls
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity - Enhanced */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-emerald-600" />
                    Recent Activity
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Your latest voting history
                  </p>
                </div>
                <Link to="/voting-history">
                  <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.recentVotes?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentVotes.slice(0, 4).map((vote, index) => (
                    <div key={index} className="group border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                            <span className="text-xs text-emerald-600 font-medium">VOTED</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                            {vote.poll.title}
                          </h4>
                          <p className="text-sm text-emerald-600 mb-2 font-medium">
                            Your choice: {vote.optionText}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(vote.votedAt), { addSuffix: true })}
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-xs text-gray-500">
                                {vote.poll.totalVotes} total votes
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                vote.poll.status === 'active' 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {vote.poll.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Voting History</h4>
                  <p className="text-gray-500 mb-4">Start participating in polls to see your activity</p>
                  <Link to="/polls">
                    <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                      Start Voting
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Action Center */}
        <div className="mt-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-8 text-center border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-gray-600">Everything you need at your fingertips</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/polls" className="group">
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <Vote className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">Discover Polls</h4>
                      <p className="text-blue-100 text-sm">Explore trending polls and make your voice heard</p>
                      <div className="mt-4 flex items-center text-blue-200 text-sm">
                        <ArrowRight className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
                        Browse now
                      </div>
                    </div>
                  </div>
                </Link>
                
                <Link to="/voting-history" className="group">
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <BarChart3 className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">My History</h4>
                      <p className="text-emerald-100 text-sm">Review your voting patterns and participation</p>
                      <div className="mt-4 flex items-center text-emerald-200 text-sm">
                        <ArrowRight className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
                        View details
                      </div>
                    </div>
                  </div>
                </Link>

                {isAdmin ? (
                  <Link to="/admin/create-poll" className="group">
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                          <Plus className="h-7 w-7 text-white" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Create Poll</h4>
                        <p className="text-purple-100 text-sm">Design and launch new polls for the community</p>
                        <div className="mt-4 flex items-center text-purple-200 text-sm">
                          <ArrowRight className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
                          Get started
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <Trophy className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">Leaderboard</h4>
                      <p className="text-amber-100 text-sm">See top voters and community rankings</p>
                      <div className="mt-4 flex items-center text-amber-200 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Coming soon
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{activePolls?.length || 0}</p>
                <p className="text-sm text-gray-600">Active Polls</p>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.totalVotes || 0}</p>
                <p className="text-sm text-gray-600">Your Votes</p>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{userStats?.overview?.totalPolls || 0}</p>
                <p className="text-sm text-gray-600">Participated</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">{format(new Date(), 'MMM dd, HH:mm')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
