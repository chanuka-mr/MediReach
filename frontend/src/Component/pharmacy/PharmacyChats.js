import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare } from 'lucide-react';
import ChatBox from '../../Components/Chat/ChatBox';
import { useChat } from '../../context/ChatContext';

const PharmacyChats = () => {
    const { setSelectedChat, selectedChat, unreadCounts, markAsRead } = useChat();
    const [chats, setChats] = useState([]);
    const [loggedPharmacy, setLoggedPharmacy] = useState(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const user = userInfo?.user || userInfo;
        
        if (user) {
            setLoggedPharmacy(user);
            fetchChats();
        }
    }, []);

    const fetchChats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`http://localhost:5000/api/chat`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });
            setChats(data);
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    return (
        <div className="h-full w-full bg-slate-50 flex p-6 gap-6 rounded-tl-3xl">
            {/* Sidebar List */}
            <div className="w-80 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-white shadow-sm z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Patient Messages</h1>
                        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Inbox</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-50/50">
                    {chats.map((chat) => {
                        const otherUser = chat.users.find(u => u._id !== loggedPharmacy?._id);
                        return (
                            <div
                                key={chat._id}
                                onClick={() => {
                                    setSelectedChat(chat);
                                    markAsRead(chat._id);
                                }}
                                className={`px-5 py-4 cursor-pointer border-b border-slate-100 flex items-center gap-3 transition-colors relative ${
                                    selectedChat?._id === chat._id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-white'
                                }}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {otherUser?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-bold text-slate-800 truncate text-sm">{otherUser?.name}</h3>
                                    {chat.latestMessage && (
                                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                            <span className="font-semibold">{(chat.latestMessage.sender._id || chat.latestMessage.sender) === loggedPharmacy?._id ? "You: " : ""}</span>
                                            {chat.latestMessage.text}
                                        </p>
                                    )}
                                </div>
                                {unreadCounts[chat._id] > 0 && selectedChat?._id !== chat._id && (
                                    <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                                        {unreadCounts[chat._id]}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {chats.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                <MessageSquare size={24} />
                            </div>
                            <p className="text-slate-400 font-medium text-sm">No active patient queries.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 h-full min-h-[500px]">
                <ChatBox 
                    selectedChat={selectedChat} 
                    currentUser={loggedPharmacy} 
                    currentRole="pharmacy" 
                />
            </div>
        </div>
    );
};

export default PharmacyChats;
