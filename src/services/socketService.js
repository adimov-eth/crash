import { io } from 'socket.io-client'
import { SOCKET_URL } from '@/utils/constants'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false,
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    this.setupListeners()
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  emit(eventName, data) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    } else {
      console.error('Socket is not connected');
    }
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).delete(callback);
    }

    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  setupListeners() {
    // Set up listeners for Crash game events
    const crashEvents = ['crashGameUpdate', 'betPlaced', 'playerCashout'];
    
    crashEvents.forEach(eventName => {
      this.socket.on(eventName, (data) => {
        if (this.listeners.has(eventName)) {
          this.listeners.get(eventName).forEach(callback => callback(data));
        }
      });
    });
  }
}

const socketService = new SocketService();
export default socketService;