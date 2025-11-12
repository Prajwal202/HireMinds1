import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, MoreVertical, Paperclip, Smile } from 'lucide-react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(1);

  // Dummy chat data
  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Sure, I can start working on that tomorrow',
      time: '2m ago',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'MC',
      lastMessage: 'Thanks for the update!',
      time: '1h ago',
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: 'Emily Davis',
      avatar: 'ED',
      lastMessage: 'Can we schedule a call?',
      time: '3h ago',
      unread: 1,
      online: false,
    },
    {
      id: 4,
      name: 'David Wilson',
      avatar: 'DW',
      lastMessage: 'Project looks great!',
      time: '1d ago',
      unread: 0,
      online: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'other',
      text: 'Hi! I reviewed your proposal for the web development project.',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'me',
      text: 'Great! Do you have any questions about it?',
      time: '10:32 AM',
    },
    {
      id: 3,
      sender: 'other',
      text: 'Yes, I wanted to discuss the timeline. Can you complete it in 2 months?',
      time: '10:35 AM',
    },
    {
      id: 4,
      sender: 'me',
      text: 'Absolutely! I can deliver the project within 2 months. I\'ll break it down into milestones for better tracking.',
      time: '10:37 AM',
    },
    {
      id: 5,
      sender: 'other',
      text: 'Perfect! That sounds good. When can you start?',
      time: '10:40 AM',
    },
    {
      id: 6,
      sender: 'me',
      text: 'I can start next Monday. I\'ll send you a detailed project plan by end of this week.',
      time: '10:42 AM',
    },
    {
      id: 7,
      sender: 'other',
      text: 'Sure, I can start working on that tomorrow',
      time: '10:45 AM',
    },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
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
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => setSelectedChat(conv.id)}
                    className={`p-4 cursor-pointer border-b border-gray-100 ${
                      selectedChat === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                          {conv.avatar}
                        </div>
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">{conv.name}</h3>
                          <span className="text-xs text-gray-500">{conv.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                          {conv.unread > 0 && (
                            <span className="ml-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                      {selectedConversation?.avatar}
                    </div>
                    {selectedConversation?.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedConversation?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation?.online ? 'Online' : 'Offline'}
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
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        msg.sender === 'me'
                          ? 'bg-primary-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === 'me' ? 'text-primary-100' : 'text-gray-500'
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
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
                    onChange={(e) => setMessage(e.target.value)}
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;
