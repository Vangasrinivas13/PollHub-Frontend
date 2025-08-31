import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Clock, Users, Eye, Vote, TrendingUp, Award, BarChart3 } from 'lucide-react';
import axios from 'axios';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const PollList = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [page, setPage] = useState(1);

  const { data: pollsData, isLoading, error } = useQuery(
    ['polls', filters, page],
    async () => {
      console.log('Fetching polls with params:', { ...filters, page, limit: 12 });
      try {
        const response = await axios.get('/polls', {
          params: {
            ...filters,
            page,
            limit: 12
          }
        });
        console.log('Polls API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Polls API error:', error);
        throw error;
      }
    },
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error('React Query error:', error);
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the query dependency
  };

  if (isLoading && !pollsData) {
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
          <h3 className="text-lg font-medium text-red-600 mb-2">Error loading polls</h3>
          <p className="text-gray-600 mb-4">{error.message || 'Failed to fetch polls'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Browse Polls
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover and participate in active polls from the community
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Polls</p>
                  <p className="text-2xl font-bold">{pollsData?.pagination?.totalPolls || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Polls</p>
                  <p className="text-2xl font-bold">{pollsData?.polls?.filter(p => p.status === 'active').length || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Your Votes</p>
                  <p className="text-2xl font-bold">{pollsData?.polls?.filter(p => p.hasUserVoted).length || 0}</p>
                </div>
                <Award className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search polls..."
                      className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </form>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
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
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  className="text-sm border-0 bg-transparent focus:ring-0"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="createdAt">Date Created</option>
                  <option value="totalVotes">Total Votes</option>
                  <option value="title">Title</option>
                  <option value="endDate">End Date</option>
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                {pollsData?.pagination?.totalPolls || 0} polls found
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Polls Grid */}
        {pollsData?.polls?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {pollsData.polls.map((poll) => (
                <Card key={poll._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                  <Card.Header>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Card.Title className="line-clamp-2">{poll.title}</Card.Title>
                        <Card.Description className="line-clamp-3 mt-2">
                          {poll.description}
                        </Card.Description>
                      </div>
                      <div className={`px-3 py-1 text-xs rounded-full ml-2 font-medium ${
                        poll.status === 'active' 
                          ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm'
                          : poll.status === 'completed'
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm'
                      }`}>
                        {poll.status === 'active' && <span className="inline-block w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>}
                        {poll.status}
                      </div>
                    </div>
                  </Card.Header>

                  <Card.Content>
                    <div className="space-y-3">
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {poll.totalVotes} votes
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {poll.metadata?.views || 0} views
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {poll.status === 'active' 
                            ? `Ends ${formatDistanceToNow(new Date(poll.endDate), { addSuffix: true })}`
                            : `Ended ${formatDistanceToNow(new Date(poll.endDate), { addSuffix: true })}`
                          }
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 shadow-sm">
                          {poll.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          by {poll.createdBy?.name || 'Anonymous'}
                        </span>
                      </div>

                      {/* User Status */}
                      {user && (
                        <div className="flex items-center justify-between">
                          {poll.hasUserVoted ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                              ✓ You voted
                            </span>
                          ) : poll.canUserVote?.canVote ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                              Available to vote
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600">
                              {poll.canUserVote?.reason || 'Cannot vote'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card.Content>

                  <Card.Footer>
                    <div className="flex items-center justify-between w-full">
                      <Link to={`/polls/${poll._id}`} className="flex-1">
                        <Button 
                          variant={poll.hasUserVoted ? "outline" : "primary"} 
                          className={`w-full transition-all duration-200 ${
                            poll.hasUserVoted 
                              ? 'border-indigo-300 text-indigo-600 hover:bg-indigo-50' 
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <Vote className="h-4 w-4 mr-2" />
                          {poll.hasUserVoted ? 'View Results' : 'Vote Now'}
                        </Button>
                      </Link>
                    </div>
                  </Card.Footer>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pollsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  disabled={!pollsData.pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: pollsData.pagination.totalPages }, (_, i) => i + 1)
                    .filter(pageNum => 
                      pageNum === 1 || 
                      pageNum === pollsData.pagination.totalPages || 
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
                  disabled={!pollsData.pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Vote className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No polls found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filters.search || filters.status || filters.category 
                ? 'Try adjusting your filters to see more results'
                : 'No polls are available at the moment'
              }
            </p>
            {filters.search || filters.status || filters.category ? (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    search: '',
                    status: '',
                    category: '',
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  });
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollList;
