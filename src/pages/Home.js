import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { Vote, Users, BarChart3, Shield, Clock, Award, Calendar, Timer } from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';

const Home = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch active polls for the landing page
  const { data: activePolls } = useQuery(
    'activePolls',
    () => axios.get('/polls', {
      params: { status: 'active', limit: 6 }
    }).then(res => res.data.polls),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      keepPreviousData: true
    }
  );

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = currentTime;
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const features = [
    {
      icon: <Vote className="h-8 w-8 text-primary-600" />,
      title: 'Easy Voting',
      description: 'Simple and intuitive voting interface for all users'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Secure & Private',
      description: 'Advanced security measures to protect your votes'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary-600" />,
      title: 'Real-time Results',
      description: 'See live voting results and detailed analytics'
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'Community Driven',
      description: 'Join a community of engaged voters and poll creators'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: 'Scheduled Polls',
      description: 'Create polls with custom start and end times'
    },
    {
      icon: <Award className="h-8 w-8 text-primary-600" />,
      title: 'Leaderboards',
      description: 'Track your voting activity and compete with others'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-primary-200">PollHub</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              The modern online voting system that makes creating and participating in polls simple, secure, and engaging.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/polls">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-600">
                      Browse Polls
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Active Polls Section */}
      {activePolls && activePolls.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                🗳️ Active Polls
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join the conversation! Vote on these active polls before they close
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePolls.slice(0, 6).map((poll) => (
                <div key={poll._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {poll.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 ml-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                        Active
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {poll.description || 'Join this poll and make your voice heard!'}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>Ends: {format(new Date(poll.endDate), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Timer className="h-4 w-4 mr-2 text-orange-500" />
                        <span className={`font-medium ${
                          getTimeRemaining(poll.endDate) === 'Ended' 
                            ? 'text-red-600' 
                            : getTimeRemaining(poll.endDate).includes('h remaining') || getTimeRemaining(poll.endDate).includes('d remaining')
                              ? 'text-green-600'
                              : 'text-orange-600'
                        }`}>
                          {getTimeRemaining(poll.endDate)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{poll.options?.length || 0} options</span>
                        <span>{poll.totalVotes || 0} votes</span>
                      </div>
                    </div>

                    <Link to={`/polls/${poll._id}`}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200">
                        Vote Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/polls">
                <Button variant="outline" size="lg" className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-purple-100">
                  View All Polls
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PollHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make PollHub the best choice for online voting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <Card.Title className="mb-2">{feature.title}</Card.Title>
                <Card.Description>{feature.description}</Card.Description>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
              <div className="text-gray-600">Polls Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1M+</div>
              <div className="text-gray-600">Votes Cast</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust PollHub for their voting needs
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-600">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
