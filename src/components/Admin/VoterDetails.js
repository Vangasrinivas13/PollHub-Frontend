import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Users, Eye, Calendar, Globe } from 'lucide-react';
import axios from 'axios';
import Card from '../UI/Card';
import Button from '../UI/Button';

const VoterDetails = ({ pollId, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState('all');

  const { data: voterData, isLoading, error, refetch } = useQuery(
    ['pollVoters', pollId, currentPage],
    () => axios.get(`/admin/polls/${pollId}/voters?page=${currentPage}&limit=50`),
    {
      enabled: !!pollId,
      refetchInterval: 30000 // Refresh every 30 seconds for real-time updates
    }
  );

  const { data: analyticsData } = useQuery(
    ['pollAnalytics', pollId],
    () => axios.get(`/admin/polls/${pollId}/analytics`),
    {
      enabled: !!pollId,
      refetchInterval: 60000 // Refresh every minute
    }
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading voter details</p>
            <Button onClick={refetch}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const voters = voterData?.data;
  const analytics = analyticsData?.data;

  const filteredVoters = selectedOption === 'all' 
    ? Object.values(voters?.voterDetails?.byOption || {}).flatMap(option => option.votes)
    : voters?.voterDetails?.byOption?.[selectedOption]?.votes || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Voter Details</h2>
              <p className="text-gray-600">{voters?.poll?.title}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-2xl font-bold">{voters?.poll?.totalVotes || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Unique Voters</p>
                  <p className="text-2xl font-bold">{voters?.poll?.uniqueVoters || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Views</p>
                  <p className="text-2xl font-bold">{analytics?.metrics?.views || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Engagement</p>
                  <p className="text-2xl font-bold">{analytics?.metrics?.engagement?.viewToVoteRatio || 0}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Option Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Option
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Options</option>
              {Object.entries(voters?.voterDetails?.byOption || {}).map(([index, option]) => (
                <option key={index} value={index}>
                  {option.optionText} ({option.count} votes)
                </option>
              ))}
            </select>
          </div>

          {/* Voter List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Voter Information ({filteredVoters.length} voters)
            </h3>
            
            {filteredVoters.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No voters found for the selected option</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredVoters.map((vote, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{vote.voter.name}</h4>
                          <p className="text-sm text-gray-600">{vote.voter.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Voted: {new Date(vote.votedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Member since: {new Date(vote.voter.memberSince).toLocaleDateString()}</span>
                        </div>
                        
                        {vote.voter.lastLogin && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            <span>Last login: {new Date(vote.voter.lastLogin).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedOption === 'all' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Voted for: {Object.values(voters?.voterDetails?.byOption || {}).find(option => 
                              option.votes.some(v => v.voter.id === vote.voter.id)
                            )?.optionText}
                          </span>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>IP: {vote.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {voters?.pagination && voters.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {voters.pagination.currentPage} of {voters.pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!voters.pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!voters.pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VoterDetails;
