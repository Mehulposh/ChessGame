import React, {  useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SocketContext from './SocketInstance.js';

// Create the socket OUTSIDE the component — module-level singleton.
// This means it is created exactly once for the lifetime of the app,
// survives StrictMode double-invoke, and is never read from a ref during render.
const socket = io('http://localhost:5000', {
  transports: ['polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

// Connect once manually — safe from StrictMode and re-renders
socket.connect();

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(socket.connected);
 
  useEffect(() => {
    const onConnect    = () =>{ 
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
    }
    const onDisconnect = (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    } 

    const onError = (err) => {
      console.log('⚠️ Socket error:', err.message);
    };
 
    socket.on('connect',    onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error',   onError);
    
    // Sync if already connected when effect runs
    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect',    onConnect);
      socket.off('disconnect', onDisconnect);
      // Do NOT disconnect — module-level socket must stay alive across remounts
    };
  }, []);
 
  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};