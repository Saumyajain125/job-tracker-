import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;

  const token = getToken();
  if (!token) return null;

  socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
    auth: { token },
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
