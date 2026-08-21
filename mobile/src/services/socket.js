import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// Expo only exposes variables prefixed with EXPO_PUBLIC_ to the mobile bundle.
let SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.SOCKET_URL;
if (!SOCKET_URL) {
  if (Platform.OS === 'web') {
    SOCKET_URL = 'http://localhost:5000';
  } else {
    SOCKET_URL = 'http://192.168.1.14:5000';
  }
}

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
