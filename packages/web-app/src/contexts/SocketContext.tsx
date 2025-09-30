import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinPass: (passId: string) => void;
  leavePass: (passId: string) => void;
  joinVenue: (venueId: string) => void;
  leaveVenue: (venueId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Connect to WebSocket server
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        auth: {
          token,
        },
      });

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket server');
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setConnected(false);
      });

      socketInstance.on('qrRefresh', (data) => {
        console.log('QR code refreshed:', data);
        // Handle QR code refresh
        window.dispatchEvent(new CustomEvent('qrRefresh', { detail: data }));
      });

      socketInstance.on('passTransferred', (data) => {
        console.log('Pass transferred:', data);
        // Handle pass transfer notification
        window.dispatchEvent(new CustomEvent('passTransferred', { detail: data }));
      });

      socketInstance.on('passRedeemed', (data) => {
        console.log('Pass redeemed:', data);
        // Handle pass redemption notification
        window.dispatchEvent(new CustomEvent('passRedeemed', { detail: data }));
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user, token]);

  const joinPass = (passId: string) => {
    if (socket) {
      socket.emit('join-pass', passId);
    }
  };

  const leavePass = (passId: string) => {
    if (socket) {
      socket.emit('leave-pass', passId);
    }
  };

  const joinVenue = (venueId: string) => {
    if (socket) {
      socket.emit('join-venue', venueId);
    }
  };

  const leaveVenue = (venueId: string) => {
    if (socket) {
      socket.emit('leave-venue', venueId);
    }
  };

  const value = {
    socket,
    connected,
    joinPass,
    leavePass,
    joinVenue,
    leaveVenue,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
