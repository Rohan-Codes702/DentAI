import React, { createContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { initSocket, disconnectSocket } from '../services/socket';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [socket, setSocketInstance] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketIo = initSocket(token);
      setSocketInstance(socketIo);

      socketIo.on('userOnline', ({ userId }) => {
        setOnlineUsers((prev) => [...new Set([...prev, userId])]);
      });

      socketIo.on('userOffline', ({ userId }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      return () => {
        disconnectSocket();
        setSocketInstance(null);
      };
    } else {
      disconnectSocket();
      setSocketInstance(null);
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
