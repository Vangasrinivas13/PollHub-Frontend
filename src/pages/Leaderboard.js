import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, Crown, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const Leaderboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('all');
  const [limit, setLimit] = useState(10);

  const { data: leaderboardData, isLoading } = useQuery(
    ['leaderboard', period, limit],
    () => axios.get('/users/leaderboard', {
      params: { period, limit }
    }).then(res => res.data),
    {
      keepPreviousData: true
    }
  );

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
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
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-xl">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Leaderboard
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            See who's leading the voting activity and climb the rankings
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-xl border-0">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'year', label: 'This Year' },
              { value: 'month', label: 'This Month' },
              { value: 'week', label: 'This Week' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  period === option.value
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top 3 Podium */}
          <div className="lg:col-span-2">
            {leaderboardData?.leaderboard?.length >= 3 && (
              <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <Card.Header>
                  <Card.Title className="text-center text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                    🏆 Top 3 Champions
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="flex items-end justify-center space-x-4">
                    {/* 2nd Place */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Medal className="h-10 w-10 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-600">#2</div>
                          <div className="font-medium text-gray-900">
                            {leaderboardData.leaderboard[1]?.name}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-primary-600">
                          {leaderboardData.leaderboard[1]?.voteCount} votes
                        </div>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xl animate-pulse">
                        <Crown className="h-12 w-12 text-white" />
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border-2 border-yellow-300 rounded-xl p-4 min-h-[140px] flex flex-col justify-between shadow-lg">
                        <div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">#1</div>
                          <div className="font-bold text-gray-900">
                            {leaderboardData.leaderboard[0]?.name}
                          </div>
                        </div>
                        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {leaderboardData.leaderboard[0]?.voteCount} votes
                        </div>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="h-10 w-10 text-white" />
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
                        <div>
                          <div className="text-2xl font-bold text-amber-600">#3</div>
                          <div className="font-medium text-gray-900">
                            {leaderboardData.leaderboard[2]?.name}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-primary-600">
                          {leaderboardData.leaderboard[2]?.voteCount} votes
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* Full Leaderboard */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title className="text-xl font-bold text-gray-900">📊 Full Rankings</Card.Title>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="text-sm border-gray-200 rounded-lg px-3 py-1 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    >
                      <option value={10}>Top 10</option>
                      <option value={25}>Top 25</option>
                      <option value={50}>Top 50</option>
                      <option value={100}>Top 100</option>
                    </select>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                {leaderboardData?.leaderboard?.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboardData.leaderboard.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                          user && entry.name === user.name
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg'
                            : 'bg-white/80 hover:bg-white hover:shadow-lg hover:-translate-y-1 border border-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadge(entry.rank)}`}>
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center">
                              {entry.name}
                              {user && entry.name === user.name && (
                                <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Member since {formatDistanceToNow(new Date(entry.joinDate), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            {entry.voteCount}
                          </div>
                          <div className="text-sm text-gray-600">votes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Users className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No rankings available</h3>
                    <p className="text-gray-600 max-w-md mx-auto">No voting activity found for this period</p>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current User Rank */}
            {user && leaderboardData?.currentUser && (
              <Card className="shadow-xl border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
                <Card.Header>
                  <Card.Title className="text-center font-bold text-gray-900">🎯 Your Ranking</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        #{leaderboardData.currentUser.rank || '?'}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 mb-1">
                      {leaderboardData.currentUser.name}
                    </div>
                    <div className="text-2xl font-bold text-primary-600 mb-2">
                      {leaderboardData.currentUser.votes} votes
                    </div>
                    <div className="text-sm text-gray-600">
                      {period === 'all' ? 'All time ranking' : `${period} ranking`}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <Card.Header>
                <Card.Title className="font-bold text-gray-900">📈 Quick Stats</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Period</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {period === 'all' ? 'All Time' : `This ${period}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Participants</span>
                    <span className="font-medium text-gray-900">
                      {leaderboardData?.leaderboard?.length || 0}
                    </span>
                  </div>
                  {leaderboardData?.leaderboard?.[0] && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Top Score</span>
                      <span className="font-medium text-gray-900">
                        {leaderboardData.leaderboard[0].voteCount} votes
                      </span>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Achievement Badges */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <Card.Header>
                <Card.Title className="font-bold text-gray-900">🏅 Achievement Levels</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">1+</span>
                    </div>
                    <span className="text-sm text-gray-600">Voter</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">10+</span>
                    </div>
                    <span className="text-sm text-gray-600">Active Participant</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">50+</span>
                    </div>
                    <span className="text-sm text-gray-600">Super Voter</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm text-gray-600">Champion (100+)</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Call to Action */}
            {user && (
              <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50">
                <Card.Header>
                  <Card.Title className="text-center font-bold text-gray-900">🚀 Climb the Rankings!</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    Participate in more polls to improve your ranking and earn achievements.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Browse Polls
                  </Button>
                </Card.Content>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
