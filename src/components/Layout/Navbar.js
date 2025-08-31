import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import { Menu, X, Vote, User, Settings, LogOut, BarChart3, History, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Button from '../UI/Button';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVotingHistory, setShowVotingHistory] = useState(false);

  // Fetch recent voting history for dropdown
  const { data: votingHistory } = useQuery(
    ['votingHistory', 'recent'],
    () => axios.get('/users/voting-history', {
      params: { limit: 5 }
    }).then(res => res.data),
    {
      enabled: !!user,
      keepPreviousData: true
    }
  );

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PollHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/polls"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/polls')
                  ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              Polls
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/leaderboard')
                  ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              Leaderboard
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  Dashboard
                </Link>
                
                {/* Voting History Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowVotingHistory(!showVotingHistory)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                      isActive('/voting-history')
                        ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </button>
                  
                  {showVotingHistory && (
                    <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-0 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <History className="h-4 w-4 mr-2 text-indigo-600" />
                          Recent Voting Activity
                        </h3>
                      </div>
                      
                      {votingHistory?.votes?.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                          {votingHistory.votes.filter(vote => vote.poll && vote.poll._id).slice(0, 5).map((vote, index) => (
                            <Link
                              key={vote._id}
                              to={`/polls/${vote.poll?._id || '#'}`}
                              className="block px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-b-0"
                              onClick={() => setShowVotingHistory(false)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {vote.poll?.title || 'Poll not available'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Voted: {vote.poll?.options?.[vote.optionIndex]?.text || 'Option not available'}
                                  </p>
                                </div>
                                <div className="ml-2 flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                                    ✓ Voted
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                            <History className="h-6 w-6 text-gray-500" />
                          </div>
                          <p className="text-sm text-gray-500">No voting history yet</p>
                        </div>
                      )}
                      
                      <div className="px-4 py-3 border-t border-gray-100">
                        <Link
                          to="/voting-history"
                          className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          onClick={() => setShowVotingHistory(false)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Full History
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive('/admin')
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 shadow-md'
                          : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      Admin
                    </Link>
                    <Link
                      to="/admin/analytics"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                        isActive('/admin/analytics')
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md'
                          : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Analytics</span>
                    </Link>
                  </>
                )}

                {/* User Menu Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span>{user.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-0 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      Profile Settings
                    </Link>
                    <Link
                      to="/voting-history"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 mr-3 text-gray-400" />
                      Full Voting History
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="hover:bg-indigo-50 hover:text-indigo-600">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/polls"
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Polls
              </Link>
              <Link
                to="/leaderboard"
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Leaderboard
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        className="text-sm font-medium text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                      <Link
                        to="/admin/analytics"
                        className="text-sm font-medium text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Analytics
                      </Link>
                    </>
                  )}

                  <Link
                    to="/profile"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/voting-history"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Voting History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
