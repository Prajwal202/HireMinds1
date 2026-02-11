# Real-time Messaging Feature for HireMinds

This document describes the implementation of the real-time messaging feature that enables communication between recruiters and freelancers **only after a job has been allocated**.

## Features

### ✅ Core Functionality
- **Real-time messaging** using Socket.io
- **Access control** - Messaging only enabled after job allocation
- **Typing indicators** - See when someone is typing
- **Read receipts** - Know when messages are read
- **Unread message counts** - Track unread messages
- **Message history** - Full conversation history per job
- **REST API fallback** - Messages work even if Socket.io fails

### ✅ Security Features
- **Authorization checks** - Only job participants can message
- **Job allocation verification** - Messages only for allocated jobs
- **Input sanitization** - Protection against XSS attacks
- **Rate limiting** - Prevent spam and abuse

## Architecture

### Backend Components

#### 1. Socket.io Server (`server.js`)
```javascript
// Key events:
- 'connection' - New client connects
- 'join' - User joins their personal room
- 'jobAllocated' - Job allocated, messaging enabled
- 'sendMessage' - Send real-time message
- 'typing' / 'stopTyping' - Typing indicators
```

#### 2. Message Model (`models/Message.js`)
```javascript
// Schema includes:
- job: Reference to Job
- sender: Reference to User
- receiver: Reference to User
- content: Message text
- messageType: text/file/image
- isRead: Read status
- timestamp: Creation time
```

#### 3. Message Controller (`controllers/messageController.js`)
```javascript
// Key methods:
- getConversations() - Get user's conversations
- getJobMessages() - Get messages for specific job
- sendMessage() - Send message (REST fallback)
- markAsRead() - Mark messages as read
- getUnreadCount() - Get unread count
```

#### 4. Message Routes (`routes/messageRoutes.js`)
```javascript
// API endpoints:
GET /api/v1/messages/conversations
GET /api/v1/messages/job/:jobId
POST /api/v1/messages/send
PUT /api/v1/messages/mark-read/:jobId
GET /api/v1/messages/unread-count
```

### Frontend Components

#### 1. Socket Service (`services/socketService.js`)
```javascript
// Handles Socket.io connection and events
- connect() - Connect to server
- sendMessage() - Send real-time message
- startTyping() / stopTyping() - Typing indicators
- Event listeners for new messages, typing, etc.
```

#### 2. Message API (`services/messageAPI.js`)
```javascript
// REST API calls for messaging
- getConversations()
- getJobMessages()
- sendMessage()
- markAsRead()
- getUnreadCount()
```

#### 3. Chat Component (`pages/Chat.jsx`)
```javascript
// Main chat interface with:
- Conversation list
- Message display
- Real-time messaging
- Typing indicators
- Read receipts
```

## How It Works

### 1. Job Allocation Flow
1. Recruiter posts a job
2. Freelancers submit bids
3. Recruiter accepts a bid
4. **Job gets allocated** → `jobAllocated` event emitted
5. **Messaging enabled** between recruiter and freelancer

### 2. Messaging Flow
1. User logs in → Socket.io connection established
2. User joins their personal room
3. Select conversation → Load message history
4. Send message → Socket.io + REST API
5. Real-time delivery to recipient
6. Typing indicators show live status

### 3. Access Control
```javascript
// Server-side verification for every message:
const isRecruiter = job.postedBy.toString() === senderId;
const isFreelancer = job.allocatedTo.toString() === senderId;

if (!isRecruiter && !isFreelancer) {
  // Reject message - not authorized
}
```

## Database Schema

### Messages Collection
```javascript
{
  _id: ObjectId,
  job: ObjectId (ref: 'Job'),
  sender: ObjectId (ref: 'User'),
  receiver: ObjectId (ref: 'User'),
  content: String,
  messageType: String (text/file/image),
  isRead: Boolean,
  readAt: Date,
  timestamp: Date,
  isDeleted: Boolean
}
```

### Indexes for Performance
```javascript
{ job: 1, timestamp: -1 }  // Job conversations
{ sender: 1, receiver: 1, timestamp: -1 }  // User conversations
{ receiver: 1, isRead: 1 }  // Unread messages
```

## Testing

### Setup Test Data
Run the test script to create sample data:
```bash
node testMessaging.js
```

This creates:
- Test recruiter and freelancer accounts
- Test job with allocation
- Sample messages
- Verifies all functionality

### Manual Testing
1. **Register** as recruiter and freelancer
2. **Post a job** as recruiter
3. **Submit a bid** as freelancer
4. **Accept the bid** as recruiter
5. **Go to Chat** - messaging should be enabled
6. **Send messages** - test real-time delivery
7. **Test typing indicators** - see live typing status

## Security Considerations

### ✅ Implemented
- **Authentication** - JWT token required for all endpoints
- **Authorization** - Only job participants can message
- **Input validation** - Message content sanitized
- **Rate limiting** - Prevent message spam
- **CORS protection** - Cross-origin requests controlled

### 🔒 Additional Recommendations
- **Message encryption** - Encrypt sensitive message content
- **Message retention** - Auto-delete old messages
- **Content moderation** - Filter inappropriate content
- **Audit logging** - Log all message activities

## Performance Optimizations

### ✅ Implemented
- **Database indexes** - Fast message queries
- **Pagination** - Load messages in chunks
- **Socket.io rooms** - Efficient message delivery
- **Lazy loading** - Load conversations on demand

### 🚀 Future Optimizations
- **Redis caching** - Cache active conversations
- **Message compression** - Reduce bandwidth
- **CDN for files** - Faster file delivery
- **Load balancing** - Scale Socket.io servers

## Environment Variables

### Backend (.env)
```bash
# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:3000

# Existing variables
MONGO_URI=mongodb://localhost:27017/hireminds
JWT_SECRET=your-secret-key
PORT=5000
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SERVER_URL=http://localhost:5000
```

## Troubleshooting

### Common Issues

#### 1. Messages not sending
- Check Socket.io connection in browser console
- Verify JWT token is valid
- Check job allocation status
- Check network connectivity

#### 2. Typing indicators not working
- Verify Socket.io events are firing
- Check event listener registration
- Ensure user is in correct room

#### 3. Messages not loading
- Check API endpoints are accessible
- Verify database connection
- Check user permissions

### Debug Commands
```javascript
// Browser console
console.log('Socket connected:', socketService.isConnected());

// Server logs
console.log('Active rooms:', io.sockets.adapter.rooms);
console.log('Connected clients:', io.sockets.sockets);
```

## Future Enhancements

### 🚀 Planned Features
- **File sharing** - Share documents and images
- **Message reactions** - React to messages
- **Message search** - Search conversation history
- **Message encryption** - End-to-end encryption
- **Push notifications** - Mobile notifications
- **Voice messages** - Audio message support
- **Video calling** - Integrated video calls

### 📱 Mobile Support
- **React Native app** - Native mobile experience
- **PWA support** - Progressive Web App
- **Offline messaging** - Queue messages when offline

## Support

For issues or questions about the messaging feature:
1. Check the troubleshooting section
2. Review browser console logs
3. Check server logs for errors
4. Verify database connectivity
5. Test with the provided test script

---

**Note**: This messaging system is designed to be secure, scalable, and user-friendly while maintaining the core requirement that messaging is only enabled after job allocation.
