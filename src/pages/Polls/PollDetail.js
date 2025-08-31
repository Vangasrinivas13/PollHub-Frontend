import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, Share2, Flag, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDistanceToNow, format } from 'date-fns';

const PollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const { data: pollData, isLoading } = useQuery(
    ['poll', id],
    () => axios.get(`/polls/${id}`).then(res => res.data),
    {
      enabled: !!id
    }
  );

  const { data: resultsData } = useQuery(
    ['pollResults', id],
    () => axios.get(`/polls/${id}/results`).then(res => res.data),
    {
      enabled: !!id && (showResults || pollData?.poll?.hasUserVoted || pollData?.poll?.hasEnded)
    }
  );

  const voteMutation = useMutation(
    (optionIndex) => axios.post(`/votes/${id}`, { optionIndex }),
    {
      onSuccess: () => {
        toast.success('Vote cast successfully!');
        queryClient.invalidateQueries(['poll', id]);
        queryClient.invalidateQueries(['pollResults', id]);
        // Update dashboard data to reflect new vote
        queryClient.invalidateQueries('userDashboard');
        queryClient.invalidateQueries('userStats');
        queryClient.invalidateQueries('activePolls');
        setShowResults(true);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to cast vote');
      }
    }
  );

  const handleVote = () => {
    if (selectedOption === null) {
      toast.error('Please select an option to vote');
      return;
    }
    voteMutation.mutate(selectedOption);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: pollData.poll.title,
        text: pollData.poll.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Poll link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!pollData?.poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Poll not found</h2>
          <p className="text-gray-600 mb-4">The poll you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/polls')}>
            Back to Polls
          </Button>
        </div>
      </div>
    );
  }

  const poll = pollData.poll;
  const results = resultsData?.results;
  const canVote = user && poll.canUserVote?.canVote;
  const hasVoted = user && poll.hasUserVoted;
  const maxVotesPerUser = poll.settings?.maxVotesPerUser || 1;
  const allowsMultipleVotes = maxVotesPerUser > 1;
  
  // Only show results if user can't vote anymore or poll has ended
  const shouldShowResults = showResults || poll.hasEnded || poll.showResultsBeforeEnd || 
    (hasVoted && !allowsMultipleVotes) || (hasVoted && !canVote);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/polls')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Polls
        </Button>

        {/* Poll Header */}
        <Card className="mb-8">
          <Card.Header>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`px-3 py-1 text-sm rounded-full ${
                    poll.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : poll.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {poll.status}
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {poll.category}
                  </span>
                </div>
                <Card.Title className="text-2xl mb-3">{poll.title}</Card.Title>
                <Card.Description className="text-base">
                  {poll.description}
                </Card.Description>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-4"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </Card.Header>

          <Card.Content>
            {/* Poll Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{poll.totalVotes}</div>
                <div className="text-sm text-gray-600">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{poll.uniqueVoters}</div>
                <div className="text-sm text-gray-600">Unique Voters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{poll.metadata?.views || 0}</div>
                <div className="text-sm text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {poll.hasEnded ? 'Ended' : formatDistanceToNow(new Date(poll.endDate))}
                </div>
                <div className="text-sm text-gray-600">
                  {poll.hasEnded ? formatDistanceToNow(new Date(poll.endDate), { addSuffix: true }) : 'Remaining'}
                </div>
              </div>
            </div>

            {/* Poll Dates */}
            <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
              <div>
                <span className="font-medium">Started:</span> {format(new Date(poll.startDate), 'PPp')}
              </div>
              <div>
                <span className="font-medium">Ends:</span> {format(new Date(poll.endDate), 'PPp')}
              </div>
            </div>
          </Card.Content>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voting Section */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <Card.Title>
                  {shouldShowResults ? 'Poll Results' : 'Cast Your Vote'}
                </Card.Title>
                {!shouldShowResults && (
                  <Card.Description>
                    Select an option and click vote to participate
                  </Card.Description>
                )}
              </Card.Header>
              <Card.Content>
                {shouldShowResults && results ? (
                  // Show Results
                  <div className="space-y-4">
                    {results.results.map((option, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{option.text}</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {option.percentage}%
                            </div>
                            <div className="text-sm text-gray-600">
                              {option.votes} votes
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${option.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Total: {results.totalVotes} votes from {results.uniqueVoters} voters
                      </p>
                    </div>
                  </div>
                ) : (
                  // Show Voting Options
                  <div className="space-y-4">
                    {poll.options.map((option, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedOption === index
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!canVote ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => canVote && setSelectedOption(index)}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="poll-option"
                            checked={selectedOption === index}
                            onChange={() => canVote && setSelectedOption(index)}
                            disabled={!canVote}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label className="ml-3 text-gray-900 cursor-pointer">
                            {option.text}
                          </label>
                        </div>
                      </div>
                    ))}

                    {/* Vote Actions */}
                    <div className="pt-4 border-t">
                      {user ? (
                        canVote ? (
                          <div>
                            {allowsMultipleVotes && hasVoted && (
                              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Multiple votes allowed:</strong> You can vote up to {maxVotesPerUser} times.
                                  {poll.canUserVote?.reason && ` ${poll.canUserVote.reason}`}
                                </p>
                              </div>
                            )}
                            <Button
                              onClick={handleVote}
                              loading={voteMutation.isLoading}
                              disabled={selectedOption === null}
                              className="w-full"
                            >
                              {hasVoted && allowsMultipleVotes ? 'Cast Another Vote' : 'Cast Vote'}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">
                              {poll.canUserVote?.reason || 'You cannot vote on this poll'}
                            </p>
                            {hasVoted && (
                              <Button
                                variant="outline"
                                onClick={() => setShowResults(true)}
                                className="w-full"
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Results
                              </Button>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-4">
                            You need to be logged in to vote
                          </p>
                          <Button
                            onClick={() => navigate('/login')}
                            className="w-full"
                          >
                            Login to Vote
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>

          {/* Poll Info Sidebar */}
          <div className="space-y-6">
            {/* Poll Creator */}
            <Card>
              <Card.Header>
                <Card.Title>Poll Creator</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {poll.createdBy?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {poll.createdBy?.name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Created {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Poll Settings */}
            <Card>
              <Card.Header>
                <Card.Title>Poll Settings</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Multiple votes:</span>
                    <span className="font-medium">
                      {poll.allowMultipleVotes ? 'Allowed' : 'Not allowed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Anonymous:</span>
                    <span className="font-medium">
                      {poll.settings?.anonymousVoting ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Public:</span>
                    <span className="font-medium">
                      {poll.isPublic ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {poll.allowMultipleVotes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max votes per user:</span>
                      <span className="font-medium">
                        {poll.settings?.maxVotesPerUser || 1}
                      </span>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Actions */}
            <Card>
              <Card.Header>
                <Card.Title>Actions</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Poll
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report Poll
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetail;
