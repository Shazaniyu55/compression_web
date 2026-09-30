import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken = '';

/** Singleton socket to the API's /progress namespace, authed with JWT or API key. */
export function getSocket(token: string): Socket {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1').replace(/\/v1\/?$/, '');
  if (!socket || currentToken !== token) {
    socket?.disconnect();
    socket = io(`${base}/progress`, { auth: { token }, transports: ['websocket'] });
    currentToken = token;
  }
  return socket;
}

export function closeSocket(): void {
  socket?.disconnect();
  socket = null;
  currentToken = '';
}
