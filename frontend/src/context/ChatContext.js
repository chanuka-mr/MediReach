import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const ChatContext = createContext();

const ENDPOINT = "http://localhost:5000";

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null);

  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const fetchInitialUnread = useCallback(async (userInfo) => {
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/chat`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const counts = {};
      data.forEach(chat => {
        counts[chat._id] = chat.unreadCount || 0;
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error fetching initial unread counts", error);
    }
  }, []);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      setUser(userInfo.user || userInfo);
      const newSocket = io(ENDPOINT);
      setSocket(newSocket);

      newSocket.emit("setup", userInfo.user || userInfo);
      fetchInitialUnread(userInfo);

      newSocket.on("message received", (newMessage) => {
        if (!selectedChatRef.current || selectedChatRef.current._id !== newMessage.chat._id) {
          setUnreadCounts(prev => ({
            ...prev,
            [newMessage.chat._id]: (prev[newMessage.chat._id] || 0) + 1
          }));
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [fetchInitialUnread]);

  const markAsRead = async (chatId) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) return;

    try {
      await axios.put(`${ENDPOINT}/api/messages/mark-as-read/${chatId}`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setUnreadCounts(prev => ({
        ...prev,
        [chatId]: 0
      }));
    } catch (error) {
      console.error("Error marking messages as read", error);
    }
  };

  const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <ChatContext.Provider value={{ 
        socket, 
        unreadCounts, 
        totalUnreadCount, 
        selectedChat, 
        setSelectedChat, 
        markAsRead,
        user
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
