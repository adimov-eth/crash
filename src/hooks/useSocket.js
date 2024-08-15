// src/hooks/useSocket.js
import { useState, useEffect } from 'react';
import socketService from '@/services/socketService';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
  
    useEffect(() => {
      socketService.connect();
      setIsConnected(true);
  
      return () => {
        socketService.disconnect();
        setIsConnected(false);
      };
    }, []);
  
    const emit = (eventName, data) => {
      socketService.emit(eventName, data);
    };
  
    const on = (eventName, callback) => {
      socketService.on(eventName, callback);
    };
  
    const off = (eventName, callback) => {
      socketService.off(eventName, callback);
    };
  
    return {
      isConnected,
      emit,
      on,
      off,
    };
  };