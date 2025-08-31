import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';

export const useWebSocket = () => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    // Initialize WebSocket connection
    socketRef.current = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Subscribe to dashboard updates
      socket.emit('subscribe_dashboard');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Real-time poll updates
    socket.on('poll_updated', (data) => {
      queryClient.invalidateQueries(['polls']);
      queryClient.invalidateQueries(['poll', data.pollId]);
      queryClient.invalidateQueries(['activePolls']);
    });

    // New vote notifications
    socket.on('new_vote', (data) => {
      queryClient.invalidateQueries(['polls']);
      queryClient.invalidateQueries(['poll', data.pollId]);
      queryClient.invalidateQueries(['pollVoters', data.pollId]);
      queryClient.invalidateQueries(['pollAnalytics', data.pollId]);
      
      if (user.role === 'admin') {
        toast.success(`New vote on "${data.pollTitle || 'poll'}"`, {
          duration: 3000,
          position: 'top-right'
        });
      }
    });

    // New poll notifications
    socket.on('new_poll', (data) => {
      queryClient.invalidateQueries(['polls']);
      queryClient.invalidateQueries(['activePolls']);
      queryClient.invalidateQueries(['userDashboard']);
      
      if (user.role !== 'admin') {
        toast.success(`New poll available: "${data.title}"`, {
          duration: 4000,
          position: 'top-right'
        });
      }
    });

    // Poll status changes
    socket.on('poll_status_changed', (data) => {
      queryClient.invalidateQueries(['polls']);
      queryClient.invalidateQueries(['poll', data.pollId]);
      queryClient.invalidateQueries(['activePolls']);
    });

    socket.on('poll_activated', (data) => {
      queryClient.invalidateQueries(['polls']);
      queryClient.invalidateQueries(['activePolls']);
      
      if (user.role !== 'admin') {
        toast.success(`Poll "${data.title}" is now active!`, {
          duration: 4000,
          position: 'top-right'
        });
      }
    });

    // Poll deletion notifications
    socket.on('poll_deleted', (data) => {
      queryClient.invalidateQueries(['polls']);
      queryClient.invalidateQueries(['activePolls']);
      queryClient.invalidateQueries(['userDashboard']);
      queryClient.invalidateQueries(['adminDashboard']);
      
      // Remove specific poll from cache
      queryClient.removeQueries(['poll', data.pollId]);
      queryClient.removeQueries(['pollResults', data.pollId]);
      queryClient.removeQueries(['pollVoters', data.pollId]);
      queryClient.removeQueries(['pollAnalytics', data.pollId]);
      
      toast.info(`Poll "${data.title}" has been deleted`, {
        duration: 4000,
        position: 'top-right'
      });
    });

    // Admin-specific events
    if (user.role === 'admin') {
      socket.on('dashboard_stats_updated', (data) => {
        queryClient.setQueryData('adminRealtimeStats', data);
        queryClient.invalidateQueries(['adminDashboard']);
      });

      socket.on('vote_activity', (data) => {
        queryClient.invalidateQueries(['adminDashboard']);
        queryClient.invalidateQueries(['pollVoters', data.pollId]);
      });

      socket.on('user_activity', (data) => {
        queryClient.invalidateQueries(['adminDashboard']);
      });

      socket.on('poll_created', (data) => {
        queryClient.invalidateQueries(['adminDashboard']);
        queryClient.invalidateQueries(['polls']);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, user, queryClient]);

  const subscribeToPoll = (pollId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('subscribe_poll', pollId);
    }
  };

  const unsubscribeFromPoll = (pollId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('unsubscribe_poll', pollId);
    }
  };

  return {
    isConnected,
    subscribeToPoll,
    unsubscribeFromPoll,
    socket: socketRef.current
  };
};
