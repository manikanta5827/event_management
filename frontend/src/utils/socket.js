import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  auth: {
    token: localStorage.getItem('token')
  }
});

export const setupSocketListeners = (setToast) => {
  socket.on('error', ({ message }) => {
    setToast({ message, type: 'error' });
  });

  socket.on('success', ({ message }) => {
    console.log(message, 'message')
    setToast({ message, type: 'success' });
  });

  return () => {
    socket.off('error');
    socket.off('success');
  };
};

export default socket; 