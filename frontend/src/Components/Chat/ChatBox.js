import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Building2, MessageSquare, X } from 'lucide-react';
import axios from 'axios';
import { useChat } from '../../context/ChatContext';

const ENDPOINT = "http://localhost:5000";

const ChatBox = ({ currentUser, currentRole }) => {
  const { socket, selectedChat, setSelectedChat, markAsRead } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      if (selectedChat && String(selectedChat._id) === String(newMessageReceived.chat._id)) {
        setMessages((prev) => [...prev, newMessageReceived]);
        markAsRead(selectedChat._id);
      }
    };

    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [socket, selectedChat, markAsRead]);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${ENDPOINT}/api/messages/${selectedChat._id}`, {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem("userInfo")).token}`,
            },
        });
        setMessages(data);
        if (socket) socket.emit("join chat", selectedChat._id);
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };
    fetchMessages();
  }, [selectedChat, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (!newMessage.trim()) return;

      const messageText = newMessage;
      setNewMessage("");

      try {
        const { data } = await axios.post(`${ENDPOINT}/api/messages`, {
          chatId: selectedChat._id,
          content: messageText,
        }, {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem("userInfo")).token}`,
            },
        });

        if (socket) socket.emit("new message", data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error("Failed to send the message", error);
      }
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
        <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                <MessageSquare size={32} />
            </div>
            <p className="text-gray-400 font-medium text-lg">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const otherParticipant = selectedChat?.users?.find(
    (u) => (u._id || u.id) !== (currentUser?._id || currentUser?.id)
  );

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full max-h-[800px]">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md font-bold text-lg">
            {otherParticipant?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <h2 className="text-white font-bold text-lg tracking-wide">{otherParticipant?.name || 'Unknown'}</h2>
            <p className="text-blue-100 text-xs font-medium">
              {currentRole === 'pharmacy' ? 'Patient' : 'Pharmacy'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setSelectedChat(null)}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          title="Close Chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
        {messages.map((m, i) => {
          const isMe = (m.sender._id || m.sender) === (currentUser._id || currentUser.id);
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mr-2 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {otherParticipant?.name?.charAt(0).toUpperCase()}
                  </div>
              )}
              <div
                className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                <span className={`text-[10px] mt-1 block font-semibold ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-gray-700 placeholder-gray-400"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={sendMessage}
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors ml-2 shadow-md shadow-blue-200"
          >
            <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
