import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, MoreVertical, Paperclip, Smile } from 'lucide-react';
import socketService from '../services/socketService';
import messageAPI from '../services/messageAPI';
import { useAuth } from '../contexts/AuthContext';
import { usePresence } from '../contexts/PresenceContext';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuth();
  const { isUserOnline } = usePresence();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      socketService.connect(token, user.id);

      // Listen for new messages
      socketService.on('newMessage', (newMessage) => {
        if (selectedConversation && selectedConversation.jobId === newMessage.job.toString()) {
          setMessages(prev => {
            // Check if message already exists (to prevent duplicates)
            const exists = prev.some(msg => 
              msg._id === newMessage._id || 
              (msg.isOptimistic && msg.content === newMessage.content && msg.sender._id === newMessage.sender._id)
            );
            if (exists) {
              // Replace optimistic message with real message
              return prev.map(msg => 
                (msg.isOptimistic && msg.content === newMessage.content && msg.sender._id === newMessage.sender._id)
                  ? { ...newMessage, isOptimistic: false }
                  : msg
              );
            } else {
              // Add new message
              return [...prev, newMessage];
            }
          });
          scrollToBottom();
        }
        
        // Update conversation list and unread count
        if (newMessage.sender._id !== user.id) {
          // This is a received message, update unread count
          setConversations(prev => 
            prev.map(conv => 
              conv.jobId === newMessage.job.toString() 
                ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1, latestMessage: newMessage }
                : conv
            )
          );
          
          // Update total unread count
          setUnreadCount(prev => prev + 1);
        } else {
          // This is a sent message, just update latest message
          setConversations(prev => 
            prev.map(conv => 
              conv.jobId === newMessage.job.toString() 
                ? { ...conv, latestMessage: newMessage }
                : conv
            )
          );
        }
        
        // Only show toast for received messages, not sent ones
        if (newMessage.sender._id !== user.id) {
          toast.success('New message received');
        }
      });

      // Listen for message sent confirmation
      socketService.on('messageSent', (sentMessage) => {
        if (selectedConversation && selectedConversation.jobId === sentMessage.job.toString()) {
          setMessages(prev => {
            // Replace optimistic message with real message
            return prev.map(msg => 
              (msg.isOptimistic && msg.content === sentMessage.content)
                ? { ...sentMessage, isOptimistic: false }
                : msg
            );
          });
          scrollToBottom();
        }
        // Update conversation list to show new message (no unread count change for sent messages)
        setConversations(prev => 
          prev.map(conv => 
            conv.jobId === sentMessage.job.toString() 
              ? { ...conv, latestMessage: sentMessage }
              : conv
          )
        );
      });

      // Listen for typing indicators
      socketService.on('userTyping', ({ jobId }) => {
        if (selectedConversation && selectedConversation.jobId === jobId) {
          setOtherUserTyping(true);
        }
      });

      socketService.on('userStoppedTyping', ({ jobId }) => {
        if (selectedConversation && selectedConversation.jobId === jobId) {
          setOtherUserTyping(false);
        }
      });

      // Listen for messaging enabled event
      socketService.on('messagingEnabled', ({ jobId }) => {
        toast.success('Messaging is now enabled for this job');
        loadConversations();
      });

      // Listen for errors
      socketService.on('error', ({ message }) => {
        toast.error(message);
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.jobId);
      // Mark messages as read
      messageAPI.markAsRead(selectedConversation.jobId);
      
      // Update conversation list to remove unread count for this conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.jobId === selectedConversation.jobId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
      // Update total unread count
      setUnreadCount(prev => Math.max(0, prev - selectedConversation.unreadCount));
    }
  }, [selectedConversation]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations();
      setConversations(response.data);
      
      // Calculate total unread count from conversations
      const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
      
      console.log('=== UNREAD COUNT DEBUG ===');
      console.log('Conversations:', response.data);
      console.log('Total unread calculated:', totalUnread);
      console.log('Individual unread counts:', response.data.map(c => ({ jobId: c.jobId, unread: c.unreadCount || 0 })));
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (jobId) => {
    try {
      const response = await messageAPI.getJobMessages(jobId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await messageAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedConversation) {
      const messageContent = message.trim();
      
      // Clear input immediately
      setMessage('');
      setTyping(false);
      
      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        _id: `temp_${Date.now()}`, // Temporary ID with prefix
        job: selectedConversation.jobId,
        sender: { _id: user.id, name: user.name, email: user.email },
        receiver: { _id: selectedConversation.otherUser.id, name: selectedConversation.otherUser.name },
        content: messageContent,
        messageType: 'text',
        isRead: false,
        timestamp: new Date(),
        isOptimistic: true
      };

      // Add message to UI immediately for better UX
      setMessages(prev => [...prev, optimisticMessage]);
      scrollToBottom();
      
      // Send via socket for real-time delivery
      socketService.sendMessage(
        selectedConversation.jobId,
        user.id,
        selectedConversation.otherUser.id,
        messageContent
      );
      
      // Set a timeout to mark as sent even if no confirmation received
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id 
              ? { ...msg, isOptimistic: false, status: 'sent' }
              : msg
          )
        );
      }, 2000); // 2 seconds timeout
      
      // Also send via REST API as fallback
      messageAPI.sendMessage(
        selectedConversation.jobId,
        selectedConversation.otherUser.id,
        messageContent
      ).catch(error => {
        console.error('Error sending message via API:', error);
        // Remove optimistic message if API fails
        setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
        toast.error('Failed to send message');
      });
    }
  };

  const handleTyping = () => {
    if (!typing && selectedConversation) {
      setTyping(true);
      socketService.startTyping(selectedConversation.jobId, selectedConversation.otherUser.id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
        if (selectedConversation) {
          socketService.stopTyping(selectedConversation.jobId, selectedConversation.otherUser.id);
        }
      }, 1000);
    }
  };

  const handleConversationClick = (conv) => {
    // Immediately update UI to clear unread count for better UX
    setConversations(prev => 
      prev.map(c => 
        c.jobId === conv.jobId 
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
    
    // Update total unread count
    setUnreadCount(prev => Math.max(0, prev - conv.unreadCount));
    
    // Set selected conversation
    setSelectedConversation(conv);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          <div className="flex h-full">
            {/* Sidebar - Conversations List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded-full animate-pulse font-bold">
                        ({unreadCount})
                      </span>
                    )}
                  </h2>
                  {unreadCount === 0 && (
                    <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded-full">
                      0 unread
                    </span>
                  )}
                  {/* Debug: Show current unread count */}
                  <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    DEBUG: {unreadCount}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Messages will appear here after job allocation</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <motion.div
                      key={conv.jobId}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => handleConversationClick(conv)}
                      className={`p-4 cursor-pointer border-b border-gray-100 ${
                        selectedConversation?.jobId === conv.jobId 
                          ? 'bg-primary-50 border-l-4 border-l-primary-600' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                            {conv.otherUser.name.charAt(0).toUpperCase()}
                          </div>
                          {isUserOnline(conv.otherUser.id) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {conv.otherUser.name}
                              {isUserOnline(conv.otherUser.id) && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  ● Online
                                </span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conv.latestMessage ? formatDate(conv.latestMessage.timestamp) : formatDate(conv.allocatedAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1">
                            {conv.jobTitle} • {conv.company}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conv.latestMessage ? conv.latestMessage.content : 'No messages yet'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse font-bold">
                                {conv.unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                          {selectedConversation.otherUser.name.charAt(0).toUpperCase()}
                        </div>
                        {isUserOnline(selectedConversation.otherUser.id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedConversation.otherUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {isUserOnline(selectedConversation.otherUser.id) ? 'Online' : 'Offline'} • {selectedConversation.jobTitle} • {selectedConversation.company}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            msg.sender._id === user.id
                              ? 'bg-primary-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                          } ${msg.isOptimistic ? 'opacity-75' : ''}`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender._id === user.id ? 'text-primary-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                            {msg.sender._id === user.id && (
                              msg.isOptimistic ? ' • Sending...' : ' • Sent'
                            )}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {otherUserTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-900 rounded-bl-none shadow-sm px-4 py-3 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          handleTyping();
                        }}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;
