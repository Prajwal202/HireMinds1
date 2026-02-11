import { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

const PresenceContext = createContext();

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};

export const PresenceProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      
      // Connect to socket for presence tracking
      socketService.connect(token, user.id);
      setIsConnected(true);

      // Listen for online/offline events
      socketService.on('userOnline', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      socketService.on('userOffline', (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      socketService.on('connect', () => {
        setIsConnected(true);
        // Join presence room
        socketService.join(user.id);
      });

      socketService.on('disconnect', () => {
        setIsConnected(false);
      });

      // Cleanup on unmount
      return () => {
        socketService.off('userOnline');
        socketService.off('userOffline');
        socketService.off('connect');
        socketService.off('disconnect');
      };
    }
  }, [user]);

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const getOnlineUsersCount = () => {
    return onlineUsers.size;
  };

  const value = {
    onlineUsers,
    isConnected,
    isUserOnline,
    getOnlineUsersCount
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

export default PresenceContext;
