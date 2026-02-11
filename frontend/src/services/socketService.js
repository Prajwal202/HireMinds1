import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  connect(token, userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.userId = userId;
    
    this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join user room
  join(userId) {
    if (this.socket) {
      this.socket.emit('join', userId);
    }
  }

  // Send message
  sendMessage(jobId, senderId, receiverId, message) {
    if (this.socket) {
      this.socket.emit('sendMessage', {
        jobId,
        senderId,
        receiverId,
        message
      });
    }
  }

  // Send typing indicator
  startTyping(jobId, receiverId) {
    if (this.socket) {
      this.socket.emit('typing', { jobId, receiverId });
    }
  }

  // Stop typing indicator
  stopTyping(jobId, receiverId) {
    if (this.socket) {
      this.socket.emit('stopTyping', { jobId, receiverId });
    }
  }

  // Listen for events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
