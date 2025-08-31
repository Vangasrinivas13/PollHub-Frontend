import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Scatter
} from 'react-chartjs-2';
import { BarChart3, TrendingUp, Users, Vote, PieChart, Activity, Calendar, Target } from 'lucide-react';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [pollPerformance, setPollPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required');
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Fetching analytics data with token:', token ? 'Token exists' : 'No token');

      const [dashboardRes, userRes, performanceRes] = await Promise.all([
        axios.get('analytics/dashboard', config),
        axios.get('analytics/user-analytics', config),
        axios.get('analytics/poll-performance', config)
      ]);

      console.log('Analytics data fetched successfully:', {
        dashboard: dashboardRes.data,
        users: userRes.data,
        performance: performanceRes.data
      });

      setAnalyticsData(dashboardRes.data);
      setUserAnalytics(userRes.data);
      setPollPerformance(performanceRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Token exists:', !!localStorage.getItem('token'));
      // Set default empty data on error
      setAnalyticsData({
        overview: { totalPolls: 0, totalVotes: 0, totalUsers: 0, activePolls: 0, completionRate: 0 },
        recentPolls: [],
        topPolls: [],
        votesByDay: [],
        pollsByCategory: [],
        userEngagement: [],
        votingPatterns: []
      });
      setUserAnalytics({
        usersByRole: [],
        usersByRegistrationDate: [],
        engagementMetrics: { avgVotesPerUser: 0, activeUsers: 0, totalUsers: 0 },
        topVoters: []
      });
      setPollPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  // Data 
  const generateDateRange = (days = 30) => {
    const dates = [];
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(date.toLocaleDateString());
      
      // Find matching data or default to 0
      const dayData = analyticsData?.votesByDay?.find(item => item._id === dateStr);
      data.push(dayData ? dayData.count : 0);
    }
    return { dates, data };
  };

  const { dates: dailyLabels, data: dailyData } = generateDateRange(30);

  // Chart data configurations
  const dailyVotesData = {
    labels: dailyLabels,
    datasets: [{
      label: 'Daily Votes',
      data: dailyData,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const pollCategoryData = {
    labels: analyticsData?.pollsByCategory?.length > 0 
      ? analyticsData.pollsByCategory.map(item => item._id || 'General')
      : ['No categories'],
    datasets: [
      {
        data: analyticsData?.pollsByCategory?.length > 0 
          ? analyticsData.pollsByCategory.map(item => item.count)
          : [1],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const userEngagementData = {
    labels: userAnalytics?.usersByRole?.length > 0 
      ? userAnalytics.usersByRole.map(item => item._id || 'Unknown')
      : ['No users'],
    datasets: [
      {
        label: 'Users by Role',
        data: userAnalytics?.usersByRole?.length > 0 
          ? userAnalytics.usersByRole.map(item => item.count)
          : [1],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for admin
          'rgba(59, 130, 246, 0.8)',  // Blue for voter
          'rgba(168, 85, 247, 0.8)',  // Purple for moderator
          'rgba(245, 158, 11, 0.8)',  // Orange for guest
          'rgba(239, 68, 68, 0.8)',   // Red for banned
          'rgba(156, 163, 175, 0.8)'  // Gray for inactive
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const votingPatternsData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Votes by Hour',
      data: Array.from({ length: 24 }, (_, hour) => {
        const hourData = analyticsData?.votingPatterns?.find(item => item._id === hour);
        return hourData ? hourData.count : 0;
      }),
      backgroundColor: 'rgba(168, 85, 247, 0.8)',
      borderColor: 'rgba(168, 85, 247, 1)',
      borderWidth: 2,
      borderRadius: 4,
    }],
  };

  const topPollsData = {
    labels: analyticsData?.topPolls?.map(poll => 
      poll.title.length > 20 ? poll.title.substring(0, 20) + '...' : poll.title
    ) || ['No data available'],
    datasets: [{
      label: 'Total Votes',
      data: analyticsData?.topPolls?.map(poll => poll.voteCount) || [0],
      backgroundColor: analyticsData?.topPolls?.length > 0 ? analyticsData.topPolls.map((_, index) => 
        `hsl(${(index * 137.5) % 360}, 70%, 60%)`
      ) : ['rgba(156, 163, 175, 0.8)'],
      borderColor: analyticsData?.topPolls?.length > 0 ? analyticsData.topPolls.map((_, index) => 
        `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      ) : ['rgba(156, 163, 175, 1)'],
      borderWidth: 2,
    }],
  };

  const performanceScatterData = {
    datasets: [
      {
        label: 'Poll Performance',
        data: pollPerformance?.map((poll, index) => ({
          x: poll.daysActive || 1,
          y: poll.voteCount || 0,
          pollTitle: poll.title,
          status: poll.status
        })) || [{x: 0, y: 0, pollTitle: 'No data', status: 'N/A'}],
        backgroundColor: pollPerformance?.length > 0 ? pollPerformance.map((_, index) => 
          `hsl(${(index * 137.5) % 360}, 70%, 60%)`
        ) : ['rgba(156, 163, 175, 0.8)'],
        borderColor: pollPerformance?.length > 0 ? pollPerformance.map((_, index) => 
          `hsl(${(index * 137.5) % 360}, 70%, 50%)`
        ) : ['rgba(156, 163, 175, 1)'],
        pointRadius: 8,
        pointHoverRadius: 12,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.raw.pollTitle}: ${context.raw.y} votes in ${context.raw.x} days`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days Active'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Votes'
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📊 Analytics & Statistics
              </h1>
              <p className="text-gray-600">Comprehensive insights into your polling platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Polls</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview?.totalPolls || 0}</p>
              </div>
              <Vote className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview?.totalVotes || 0}</p>
              </div>
              <BarChart3 className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview?.totalUsers || 0}</p>
              </div>
              <Users className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Polls</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview?.activePolls || 0}</p>
              </div>
              <Activity className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Voting Trends Line Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Daily Voting Trends</h3>
            </div>
            <div className="h-80">
              <Line data={dailyVotesData} options={chartOptions} />
            </div>
          </div>

          {/* Poll Categories Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <PieChart className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Polls by Category</h3>
            </div>
            <div className="h-80">
              <Pie data={pollCategoryData} options={pieOptions} />
            </div>
          </div>

          {/* User Roles Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">User Distribution</h3>
            </div>
            <div className="h-80">
              <Doughnut data={userEngagementData} options={pieOptions} />
            </div>
          </div>

          {/* Voting Patterns by Hour */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Voting Patterns by Hour</h3>
            </div>
            <div className="h-80">
              <Bar data={votingPatternsData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Full Width Charts */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Top Performing Polls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Target className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Top Performing Polls</h3>
            </div>
            <div className="h-96">
              <Bar 
                data={topPollsData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }} 
              />
            </div>
          </div>

          {/* Poll Performance Scatter Plot */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Activity className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Poll Performance Analysis</h3>
              <span className="ml-2 text-sm text-gray-500">(Days Active vs Total Votes)</span>
            </div>
            <div className="h-96">
              <Scatter data={performanceScatterData} options={scatterOptions} />
            </div>
          </div>
        </div>

        {/* Detailed Statistics Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Voters Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏆 Top Voters</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userAnalytics?.topVoters?.length > 0 ? userAnalytics.topVoters.slice(0, 10).map((voter, index) => {
                    const rankColors = [
                      'bg-yellow-100 text-yellow-800',   // Gold
                      'bg-gray-100 text-gray-800',       // Silver
                      'bg-orange-100 text-orange-800',   // Bronze
                      'bg-green-100 text-green-800',     // Rest
                      'bg-blue-100 text-blue-800',
                      'bg-purple-100 text-purple-800',
                      'bg-pink-100 text-pink-800',
                      'bg-indigo-100 text-indigo-800',
                      'bg-teal-100 text-teal-800',
                      'bg-red-100 text-red-800'
                    ];
                    return (
                      <tr key={voter._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rankColors[index]}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3`}
                                 style={{backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`}}>
                              {voter.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{voter.username}</div>
                              <div className="text-sm text-gray-500">{voter.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {voter.voteCount} votes
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(voter.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No voting data available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Poll Performance Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Poll Performance Metrics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poll
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pollPerformance?.length > 0 ? pollPerformance.slice(0, 10).map((poll, index) => (
                    <tr key={poll._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3`}
                               style={{backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`}}>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {poll.title.length > 30 ? poll.title.substring(0, 30) + '...' : poll.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {poll.daysActive} days active
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="text-lg font-semibold">{poll.voteCount}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          {poll.votesPerDay}/day
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{width: `${Math.min(poll.participationRate || 0, 100)}%`}}
                            ></div>
                          </div>
                          <span className="text-xs">{(poll.participationRate || 0).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          poll.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {poll.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No poll data available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enhanced Engagement Overview */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">📊 Engagement Overview</h3>
            </div>
            <div className="text-sm text-gray-500">
              Platform activity metrics
            </div>
          </div>
          
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="relative overflow-hidden text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-30"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {userAnalytics?.engagementMetrics?.avgVotesPerUser?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-gray-700 font-medium">Average Votes per User</div>
                <div className="text-xs text-gray-600 mt-1 flex items-center justify-center">
                  <Users className="h-3 w-3 mr-1" />
                  {userAnalytics?.engagementMetrics?.totalUsers || 0} total users
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-30"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {userAnalytics?.engagementMetrics?.activeUsers || 0}
                </div>
                <div className="text-sm text-gray-700 font-medium">Active Users</div>
                <div className="text-xs text-gray-600 mt-1 flex items-center justify-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last 7 days
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden text-center p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -mr-10 -mt-10 opacity-30"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {analyticsData?.overview?.completionRate || 0}%
                </div>
                <div className="text-sm text-gray-700 font-medium">Completion Rate</div>
                <div className="text-xs text-gray-600 mt-1 flex items-center justify-center">
                  <Target className="h-3 w-3 mr-1" />
                  {analyticsData?.overview?.totalPolls - analyticsData?.overview?.activePolls || 0} completed
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden text-center p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-30"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {((userAnalytics?.engagementMetrics?.activeUsers / userAnalytics?.engagementMetrics?.totalUsers) * 100 || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-700 font-medium">User Activity Rate</div>
                <div className="text-xs text-gray-600 mt-1 flex items-center justify-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Weekly engagement
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed Engagement Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Distribution */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">📈 Engagement Distribution</h4>
              <div className="space-y-3">
                {analyticsData?.userEngagement?.map((level, index) => (
                  <div key={level._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3`}
                           style={{backgroundColor: `hsl(${(index * 90) % 360}, 65%, 55%)`}}>
                      </div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {level._id} Engagement
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: `hsl(${(index * 90) % 360}, 65%, 55%)`,
                            width: `${Math.min((level.count / (userAnalytics?.engagementMetrics?.totalUsers || 1)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">
                        {level.count}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm">No engagement data available</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Platform Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🎯 Platform Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData?.overview?.totalPolls || 0}
                  </div>
                  <div className="text-xs text-gray-600">Total Polls</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData?.overview?.totalVotes || 0}
                  </div>
                  <div className="text-xs text-gray-600">Total Votes</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData?.overview?.activePolls || 0}
                  </div>
                  <div className="text-xs text-gray-600">Active Polls</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">
                    {userAnalytics?.engagementMetrics?.totalUsers || 0}
                  </div>
                  <div className="text-xs text-gray-600">Total Users</div>
                </div>
              </div>
              
              {/* Engagement Trend Indicator */}
              <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-lg mr-2">
                      {((userAnalytics?.engagementMetrics?.activeUsers / userAnalytics?.engagementMetrics?.totalUsers) * 100 || 0) > 50 ? '📈' : '📊'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-indigo-800">
                        Engagement Trend
                      </div>
                      <div className="text-xs text-indigo-600">
                        {((userAnalytics?.engagementMetrics?.activeUsers / userAnalytics?.engagementMetrics?.totalUsers) * 100 || 0) > 50 ? 'High Activity' : 'Moderate Activity'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-700">
                      {((userAnalytics?.engagementMetrics?.activeUsers / userAnalytics?.engagementMetrics?.totalUsers) * 100 || 0).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Voters Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">🏆 Top Voters</h3>
            </div>
            <div className="text-sm text-gray-500">
              Most active participants
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Votes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Since
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userAnalytics?.topVoters?.length > 0 ? userAnalytics.topVoters.slice(0, 10).map((voter, index) => {
                  const rankColors = {
                    0: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', // Gold
                    1: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',     // Silver
                    2: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'  // Bronze
                  };
                  const defaultRankColor = 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
                  
                  return (
                    <tr key={voter._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            rankColors[index] || defaultRankColor
                          }`}>
                            {index + 1}
                          </div>
                          {index < 3 && (
                            <div className="ml-2 text-lg">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3`}
                               style={{backgroundColor: `hsl(${(index * 137.5) % 360}, 65%, 55%)`}}>
                            {voter.username ? voter.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {voter.username || 'Anonymous User'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {voter.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-2xl font-bold text-indigo-600 mr-2">
                            {voter.voteCount}
                          </div>
                          <div className="text-xs text-gray-500">
                            votes
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                              style={{
                                width: `${Math.min((voter.voteCount / (userAnalytics.topVoters[0]?.voteCount || 1)) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {((voter.voteCount / (userAnalytics.topVoters[0]?.voteCount || 1)) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(voter.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-3">👥</div>
                        <div className="text-lg font-medium mb-1">No voter data available</div>
                        <div className="text-sm">Start creating polls to see top voters</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Top Voters Summary Cards */}
          {userAnalytics?.topVoters?.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🥇</div>
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Most Active Voter</div>
                    <div className="text-lg font-bold text-yellow-900">
                      {userAnalytics.topVoters[0]?.username || 'N/A'}
                    </div>
                    <div className="text-xs text-yellow-700">
                      {userAnalytics.topVoters[0]?.voteCount || 0} total votes
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📊</div>
                  <div>
                    <div className="text-sm font-medium text-blue-800">Average Votes</div>
                    <div className="text-lg font-bold text-blue-900">
                      {userAnalytics?.engagementMetrics?.avgVotesPerUser?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-xs text-blue-700">per user</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🎯</div>
                  <div>
                    <div className="text-sm font-medium text-green-800">Engagement Rate</div>
                    <div className="text-lg font-bold text-green-900">
                      {((userAnalytics?.engagementMetrics?.activeUsers / userAnalytics?.engagementMetrics?.totalUsers) * 100 || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-700">active users</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🕒 Recent Poll Activity</h3>
          <div className="space-y-4">
            {analyticsData?.recentPolls?.length > 0 ? analyticsData.recentPolls.slice(0, 5).map((poll, index) => (
              <div key={poll._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-4`}
                       style={{backgroundColor: `hsl(${(index * 72) % 360}, 65%, 55%)`}}>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {poll.title.length > 40 ? poll.title.substring(0, 40) + '...' : poll.title}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-4">
                      <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{poll.category || 'General'}</span>
                      {poll.endDate && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(poll.endDate) > new Date() 
                              ? `Ends ${new Date(poll.endDate).toLocaleDateString()}`
                              : 'Ended'
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{poll.voteCount} votes</div>
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      poll.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {poll.status}
                    </span>
                    {poll.options && (
                      <span className="text-xs text-gray-500">
                        {poll.options.length} options
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <div>No recent poll activity</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
