import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Vote, BarChart3, Users, Eye, Calendar, Filter, Search } from 'lucide-react';
import axios from 'axios';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { format } from 'date-fns';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Results = () => {
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: pollsData, isLoading } = useQuery(
    ['adminPolls', page, searchTerm, statusFilter],
    () => axios.get('/admin/polls', {
      params: {
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    }).then(res => res.data),
    {
      keepPreviousData: true
    }
  );

  const { data: pollResults, isLoading: loadingResults } = useQuery(
    ['pollResults', selectedPoll?.id],
    () => axios.get(`/polls/${selectedPoll.id}/results`).then(res => res.data),
    {
      enabled: !!selectedPoll?.id
    }
  );

  const handleViewResults = (poll) => {
    setSelectedPoll(poll);
  };

  const getChartData = (poll, results) => {
    if (!results?.results) return null;

    const labels = results.results.map(option => option.text);
    const data = results.results.map(option => option.votes);

    return {
      labels,
      datasets: [
        {
          label: 'Votes',
          data,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(163, 163, 163, 0.8)'
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(14, 165, 233, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(163, 163, 163, 1)'
          ],
          borderWidth: 2,
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
      title: {
        display: true,
        text: 'Poll Results',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Vote Distribution',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Vote className="h-8 w-8 mr-3 text-green-600" />
            Poll Results
          </h1>
          <p className="text-gray-600 mt-2">
            View detailed results and analytics for all polls
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Card.Content className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search polls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
              
              <Button
                onClick={() => {
                  setSearchTerm('');
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Polls List */}
          <div>
            <Card>
              <Card.Header>
                <Card.Title>Polls ({pollsData?.pagination?.totalPolls || 0})</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {pollsData?.polls?.map((poll) => (
                    <div
                      key={poll.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedPoll?.id === poll.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleViewResults(poll)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {poll.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {poll.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{poll.totalVotes} votes</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{format(new Date(poll.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              poll.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : poll.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {poll.status}
                            </span>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewResults(poll);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Results
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {pollsData?.pagination && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Page {pollsData.pagination.currentPage} of {pollsData.pagination.totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!pollsData.pagination.hasPrev}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!pollsData.pagination.hasNext}
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

          {/* Results Panel */}
          <div>
            {selectedPoll ? (
              <div className="space-y-6">
                {/* Poll Info Card */}
                <Card>
                  <Card.Header>
                    <Card.Title className="flex items-center justify-between">
                      <span>Poll Results</span>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        selectedPoll.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : selectedPoll.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPoll.status}
                      </span>
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedPoll.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedPoll.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">
                          {selectedPoll.totalVotes}
                        </div>
                        <div className="text-sm text-gray-600">Total Votes</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedPoll.uniqueVoters}
                        </div>
                        <div className="text-sm text-gray-600">Unique Voters</div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                {/* Results Display */}
                {loadingResults ? (
                  <Card>
                    <Card.Content className="p-8 text-center">
                      <LoadingSpinner />
                      <p className="text-gray-500 mt-4">Loading results...</p>
                    </Card.Content>
                  </Card>
                ) : pollResults ? (
                  <>
                    {/* Detailed Results */}
                    <Card>
                      <Card.Header>
                        <Card.Title>Vote Breakdown</Card.Title>
                      </Card.Header>
                      <Card.Content>
                        <div className="space-y-4">
                          {pollResults.results && Array.isArray(pollResults.results) ? pollResults.results.map((option, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-900">
                                  {option.text}
                                </span>
                                <div className="text-right">
                                  <span className="font-bold text-gray-900">
                                    {option.votes} votes
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({option.percentage}%)
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${option.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center text-gray-500 py-4">
                              No results available
                            </div>
                          )}
                        </div>
                      </Card.Content>
                    </Card>

                    {/* Charts */}
                    {pollResults.results && Array.isArray(pollResults.results) && pollResults.results.length > 0 && (
                      <>
                        <Card>
                          <Card.Header>
                            <Card.Title>Bar Chart</Card.Title>
                          </Card.Header>
                          <Card.Content>
                            <Bar 
                              data={getChartData(selectedPoll, pollResults)} 
                              options={chartOptions} 
                            />
                          </Card.Content>
                        </Card>

                        <Card>
                          <Card.Header>
                            <Card.Title>Pie Chart</Card.Title>
                          </Card.Header>
                          <Card.Content>
                            <div className="h-80">
                              <Pie 
                                data={getChartData(selectedPoll, pollResults)} 
                                options={pieOptions} 
                              />
                            </div>
                          </Card.Content>
                        </Card>
                      </>
                    )}
                  </>
                ) : (
                  <Card>
                    <Card.Content className="p-8 text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No results available for this poll</p>
                    </Card.Content>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <Card.Content className="p-8 text-center text-gray-500">
                  <Vote className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a poll to view its results</p>
                </Card.Content>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
