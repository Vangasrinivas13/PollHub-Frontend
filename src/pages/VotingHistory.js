import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Vote, BarChart3, Filter, Calendar, TrendingUp, Target } from 'lucide-react';
import axios from 'axios';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const VotingHistory = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });

  const { data: historyData, isLoading } = useQuery(
    ['votingHistory', page, filters],
    () => axios.get('/users/voting-history', {
      params: {
        page,
        limit: 20,
        ...filters
      }
    }).then(res => res.data),
    {
      enabled: !!user,
      keepPreviousData: true
    }
  );

  const { data: statsData } = useQuery(
    'userStats',
    () => axios.get('/users/stats').then(res => res.data),
    {
      enabled: !!user
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (isLoading && !historyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-xl">
            <BarChart3 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Voting History
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track your voting activity and participation across all polls
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-xl border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Votes</p>
                <p className="text-3xl font-bold">
                  {statsData?.overview?.totalVotes || 0}
                </p>
              </div>
              <Vote className="h-10 w-10 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 shadow-xl border-0 bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Polls Participated</p>
                <p className="text-3xl font-bold">
                  {statsData?.overview?.totalPolls || 0}
                </p>
              </div>
              <Target className="h-10 w-10 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 shadow-xl border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">First Vote</p>
                <p className="text-lg font-bold">
                  {statsData?.achievements?.firstVote ? 
                    formatDistanceToNow(new Date(statsData.achievements.firstVote), { addSuffix: true }) 
                    : 'N/A'}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 shadow-xl border-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold">
                  {statsData?.monthlyActivity?.find(m => {
                    const now = new Date();
                    return m._id.year === now.getFullYear() && m._id.month === now.getMonth() + 1;
                  })?.count || 0}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-yellow-200" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <Card.Header>
                <Card.Title className="flex items-center font-bold text-gray-900">
                  <Filter className="h-5 w-5 mr-2 text-indigo-600" />
                  🎯 Filters
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="general">General</option>
                    <option value="political">Political</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="sports">Sports</option>
                    <option value="technology">Technology</option>
                    <option value="education">Education</option>
                    <option value="business">Business</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Poll Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {(filters.category || filters.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ category: '', status: '' });
                      setPage(1);
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                )}
              </Card.Content>
            </Card>

            {/* Category Breakdown */}
            {statsData?.categoryBreakdown?.length > 0 && (
              <Card className="mt-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <Card.Header>
                  <Card.Title className="font-bold text-gray-900">📊 Category Breakdown</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {statsData.categoryBreakdown.map((category) => (
                      <div key={category._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {category._id}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {category.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Voting History List */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <Card.Header>
                <Card.Title className="text-xl font-bold text-gray-900">📋 Your Voting History</Card.Title>
                <Card.Description className="text-gray-600">
                  {historyData?.pagination?.totalVotes || 0} votes found
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {historyData?.votes?.length > 0 ? (
                  <div className="space-y-4">
                    {historyData.votes.map((vote) => (
                      <div key={vote.id} className="border-0 rounded-xl p-6 bg-white/80 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shadow-md">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <Link 
                                to={`/polls/${vote.poll.id}`}
                                className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-lg"
                              >
                                {vote.poll.title}
                              </Link>
                              <div className={`px-3 py-1 text-xs rounded-full font-medium ${
                                vote.poll.status === 'active' 
                                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm'
                                  : vote.poll.status === 'completed'
                                  ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm'
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm'
                              }`}>
                                {vote.poll.status === 'active' && <span className="inline-block w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>}
                                {vote.poll.status}
                              </div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 shadow-sm">
                                {vote.poll.category}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {vote.poll.description}
                            </p>
                            
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-3">
                              <div className="flex items-center text-indigo-700">
                                <Vote className="h-4 w-4 mr-2" />
                                <span className="font-semibold">Your vote: </span>
                                <span className="font-bold">{vote.optionText}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatDistanceToNow(new Date(vote.votedAt), { addSuffix: true })}
                              </div>
                              {vote.poll.endDate && (
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Poll ended {formatDistanceToNow(new Date(vote.poll.endDate), { addSuffix: true })}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="ml-4 text-right">
                            <Link to={`/polls/${vote.poll.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                View Poll
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Vote className="h-12 w-12 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No voting history</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {filters.category || filters.status 
                        ? 'No votes found matching your filters'
                        : "You haven't voted on any polls yet"
                      }
                    </p>
                    <Link to="/polls">
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                        Browse Polls
                      </Button>
                    </Link>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Pagination */}
            {historyData?.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  disabled={!historyData.pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: historyData.pagination.totalPages }, (_, i) => i + 1)
                    .filter(pageNum => 
                      pageNum === 1 || 
                      pageNum === historyData.pagination.totalPages || 
                      Math.abs(pageNum - page) <= 2
                    )
                    .map((pageNum, index, array) => (
                      <React.Fragment key={pageNum}>
                        {index > 0 && array[index - 1] !== pageNum - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <Button
                          variant={pageNum === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      </React.Fragment>
                    ))
                  }
                </div>

                <Button
                  variant="outline"
                  disabled={!historyData.pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingHistory;
