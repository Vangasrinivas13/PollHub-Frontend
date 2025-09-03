import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { BarChart3, Users, Vote, TrendingUp, Calendar } from 'lucide-react';
import axios from 'axios';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { format } from 'date-fns';
import { Line, Bar, Pie, Doughnut, Scatter, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('30');

  const { data: analyticsData, isLoading, error } = useQuery(
    ['analytics', timeframe],
    () => axios.get('/analytics/dashboard', {
      params: { timeframe }
    }).then(res => {
      console.log('Analytics data received:', res.data);
      return res.data;
    }).catch(err => {
      console.error('Analytics API error:', err);
      throw err;
    }),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 1,
      onError: (error) => {
        console.error('Query error:', error);
      }
    }
  );

  const { data: votingTrends } = useQuery(
    ['votingTrends', timeframe],
    () => axios.get('/analytics/voting-trends', {
      params: { period: timeframe }
    }).then(res => res.data)
  );

  const { data: userAnalytics } = useQuery(
    ['userAnalytics', timeframe],
    () => axios.get('/analytics/user-analytics', {
      params: { timeframe }
    }).then(res => res.data)
  );

  const getVotingTrendsChart = () => {
    if (!votingTrends || !Array.isArray(votingTrends)) return null;

    return {
      labels: votingTrends.map(item => format(new Date(item._id), 'MMM dd')),
      datasets: [
        {
          label: 'Daily Votes',
          data: votingTrends.map(item => item.dailyTotal),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getPollStatusChart = () => {
    if (!analyticsData?.overview) return null;

    // Calculate completed polls
    const completed = analyticsData.overview.totalPolls - analyticsData.overview.activePolls;
    
    return {
      labels: ['Active', 'Completed'],
      datasets: [
        {
          data: [
            analyticsData.overview.activePolls || 0,
            completed || 0
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(99, 102, 241, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(99, 102, 241, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getUserEngagementChart = () => {
    if (!userAnalytics?.engagementMetrics) return null;

    const { activeUsers, totalUsers } = userAnalytics.engagementMetrics;
    const inactiveUsers = totalUsers - activeUsers;

    return {
      labels: ['Active Users', 'Inactive Users'],
      datasets: [
        {
          data: [activeUsers || 0, inactiveUsers || 0],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(156, 163, 175, 0.8)',
          ],
        },
      ],
    };
  };

  // Advanced Chart Data Functions
  const getVotingPatternScatter = () => {
    if (!analyticsData?.recentPolls) return null;

    return {
      datasets: [
        {
          label: 'Poll Performance',
          data: analyticsData.recentPolls.map(poll => ({
            x: poll.voteCount || 0,
            y: poll.options || 2,
            r: Math.max(5, (poll.voteCount || 0) / 2)
          })),
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
        },
      ],
    };
  };

  const getUserActivityRadar = () => {
    if (!userAnalytics?.topVoters) return null;

    const topUsers = userAnalytics.topVoters.slice(0, 5);
    return {
      labels: ['Voting Frequency', 'Engagement Score', 'Activity Level', 'Participation Rate', 'Consistency'],
      datasets: [
        {
          label: 'User Activity Pattern',
          data: [
            Math.min(100, (topUsers.reduce((acc, user) => acc + user.voteCount, 0) / topUsers.length) * 10),
            85, // Engagement score
            75, // Activity level
            90, // Participation rate
            80  // Consistency
          ],
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const getPollCategoryPolar = () => {
    if (!analyticsData?.pollsByCategory) return null;

    return {
      labels: analyticsData.pollsByCategory.map(cat => cat._id || 'General'),
      datasets: [
        {
          data: analyticsData.pollsByCategory.map(cat => cat.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ],
        },
      ],
    };
  };

  const getVotingHeatmapData = () => {
    if (!votingTrends) return [];
    
    // Simulate heatmap data for voting patterns by hour and day
    const heatmapData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({length: 24}, (_, i) => i);
    
    days.forEach((day, dayIndex) => {
      hours.forEach(hour => {
        const intensity = Math.random() * 100; // Simulate data
        heatmapData.push({
          day: dayIndex,
          hour,
          value: intensity,
          dayName: day
        });
      });
    });
    
    return heatmapData;
  };

  const getEngagementHistogram = () => {
    if (!userAnalytics?.topVoters) return null;

    const voteCounts = userAnalytics.topVoters.map(user => user.voteCount);
    const bins = [0, 5, 10, 15, 20, 25, 30];
    const histogram = bins.slice(0, -1).map((bin, index) => {
      const nextBin = bins[index + 1];
      return voteCounts.filter(count => count >= bin && count < nextBin).length;
    });

    return {
      labels: bins.slice(0, -1).map((bin, index) => `${bin}-${bins[index + 1]}`),
      datasets: [
        {
          label: 'User Vote Distribution',
          data: histogram,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
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
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600">{error.message || 'Failed to load analytics data'}</p>
          <p className="text-sm text-gray-500 mt-2">Check browser console for details</p>
        </div>
      </div>
    );
  }

  console.log('Rendering with data:', { analyticsData, votingTrends, userAnalytics });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-indigo-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights into voting patterns and user engagement
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fallback Content */}
        {!analyticsData && !isLoading && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">No Analytics Data Available</h3>
            <p className="text-blue-600">
              This could be because there are no polls or votes in the system yet, or the backend server is not running.
            </p>
            <p className="text-sm text-blue-500 mt-2">
              Try creating some polls and votes first, or check if the backend server is running on port 5000.
            </p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Polls</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData?.overview?.totalPolls || 0}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Vote className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Votes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData?.overview?.totalVotes || 0}
                  </p>
                </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.overview?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Polls</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.overview?.activePolls || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

      {/* Fallback Content */}
      {!analyticsData && !isLoading && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">No Analytics Data Available</h3>
          <p className="text-blue-600">
            This could be because there are no polls or votes in the system yet, or the backend server is not running.
          </p>
          <p className="text-sm text-blue-500 mt-2">
            Try creating some polls and votes first, or check if the backend server is running on port 5000.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Polls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.overview?.totalPolls || 0}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Vote className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.overview?.totalVotes || 0}
                </p>
              </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.overview?.totalUsers || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Polls</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData?.overview?.activePolls || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card.Content>
          </Card>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Voting Trends Line Chart */}
        {votingTrends && (
          <Card className="lg:col-span-2">
            <Card.Header>
              <Card.Title className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Voting Trends Over Time
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-80">
                <Line data={getVotingTrendsChart()} options={chartOptions} />
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Poll Status Pie Chart */}
        {analyticsData?.overview && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Vote className="h-5 w-5 mr-2 text-green-600" />
                Poll Status Distribution
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-80">
                <Pie data={getPollStatusChart()} options={pieOptions} />
              </div>
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* User Engagement Doughnut */}
        {userAnalytics?.engagementMetrics && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                User Engagement
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-80">
                <Doughnut data={getUserEngagementChart()} options={pieOptions} />
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Poll Performance Scatter Plot */}
        {analyticsData?.recentPolls && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Poll Performance Analysis
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-80">
                <Scatter 
                  data={getVotingPatternScatter()} 
                  options={{
                    ...chartOptions,
                    scales: {
                      x: { title: { display: true, text: 'Vote Count' } },
                      y: { title: { display: true, text: 'Number of Options' } }
                    }
                  }} 
                />
              </div>
            </Card.Content>
          </Card>
        )}

        {/* User Activity Radar Chart */}
        {userAnalytics?.topVoters && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-pink-600" />
                User Activity Pattern
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-80">
                <Radar 
                  data={getUserActivityRadar()} 
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' } },
                    scales: { r: { beginAtZero: true, max: 100 } }
                  }} 
                />
              </div>
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Secondary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Poll Categories Polar Area */}
        {analyticsData?.pollsByCategory && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                Poll Categories
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-80">
                <PolarArea data={getPollCategoryPolar()} options={pieOptions} />
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Vote Distribution Histogram */}
        {userAnalytics?.topVoters && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                Vote Distribution Histogram
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-80">
                <Bar 
                  data={getEngagementHistogram()} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      legend: { display: false },
                      title: { display: true, text: 'User Vote Count Distribution' }
                    }
                  }} 
                />
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Voting Heatmap Visualization */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-600" />
              Voting Activity Heatmap
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-80 p-4">
              <div className="grid grid-cols-24 gap-1 h-full">
                {getVotingHeatmapData().slice(0, 168).map((cell, index) => (
                  <div
                    key={index}
                    className="rounded-sm transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor: `rgba(99, 102, 241, ${cell.value / 100})`,
                      minHeight: '8px'
                    }}
                    title={`${cell.dayName} ${cell.hour}:00 - Activity: ${Math.round(cell.value)}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Detailed Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity Timeline */}
        {analyticsData?.recentPolls && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Recent Poll Activity
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analyticsData.recentPolls.slice(0, 8).map((poll, index) => (
                  <div key={poll._id || index} className="flex items-start space-x-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{poll.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{poll.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Vote className="h-3 w-3 mr-1" />
                          {poll.voteCount || 0} votes
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(poll.createdAt), 'MMM dd, yyyy')}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          poll.status === 'Active' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {poll.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Top Voters Leaderboard */}
        {userAnalytics?.topVoters && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Top Voters Leaderboard
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userAnalytics.topVoters.slice(0, 10).map((voter, index) => (
                  <div key={voter._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{voter.username || voter.email}</p>
                        <p className="text-sm text-gray-600">{voter.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{voter.voteCount}</p>
                      <p className="text-xs text-gray-500">votes</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Top Performers Table */}
      {analyticsData?.topPolls && (
          <Card>
            <Card.Header>
              <Card.Title>Top Performing Polls</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Poll Title</th>
                      <th className="px-6 py-3">Total Votes</th>
                      <th className="px-6 py-3">Completion Rate</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topPolls?.map((poll) => (
                      <tr key={poll._id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {poll.title}
                        </td>
                        <td className="px-6 py-4">{poll.voteCount}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${Math.min(100, (poll.voteCount / 10) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.min(100, Math.round((poll.voteCount / 10) * 100))}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            poll.status === 'Active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {poll.status}
                          </span>
                        </td>
                      </tr>
                    )) || []}
                  </tbody>
                </table>
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
