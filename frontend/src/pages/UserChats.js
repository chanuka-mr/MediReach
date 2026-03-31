import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatBox from '../Components/Chat/ChatBox';

const UserChats = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loggedUser, setLoggedUser] = useState(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const user = userInfo?.user || userInfo;
        if (user) {
            setLoggedUser(user);
            fetchChats(user._id || user.id);
        }
    }, []);

    const fetchChats = async (userId) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/chat/user/${userId}`);
            setChats(data);
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    return (
        <div className="h-full w-full bg-gray-100 flex p-6 gap-6">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Messages</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">Your conversations with pharmacies</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            className={`px-6 py-4 cursor-pointer border-b border-gray-50 flex items-center gap-4 transition-all ${
                                selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm border border-blue-50">
                                {chat.pharmacy?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="font-bold text-gray-800 truncate">{chat.pharmacy?.name}</h3>
                                {chat.latestMessage && (
                                    <p className="text-xs text-gray-500 truncate mt-1 font-medium pb-0.5">
                                        <span className="font-semibold">{chat.latestMessage.sender === (loggedUser?._id || loggedUser?.id) ? "You: " : ""}</span>
                                        {chat.latestMessage.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <div className="p-8 text-center text-gray-400 font-medium text-sm">
                            No conversations yet. Go to the Pharmacies page to start a chat.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 h-full">
                <ChatBox 
                    selectedChat={selectedChat} 
                    currentUser={loggedUser} 
                    currentRole="user" 
                />
            </div>
        </div>
    );
};

export default UserChats;
