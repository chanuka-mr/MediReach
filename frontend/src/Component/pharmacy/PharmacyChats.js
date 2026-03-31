import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatBox from '../../Components/Chat/ChatBox';

const PharmacyChats = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loggedPharmacy, setLoggedPharmacy] = useState(null);

    useEffect(() => {
        const pharmacyInfo = JSON.parse(localStorage.getItem('pharmacyInfo'));
        const pharmacy = pharmacyInfo?.pharmacy || pharmacyInfo;
        // In MediReach, if it's the pharmacy user logged in, their info is likely under userInfo or pharmacyInfo.
        // Let's check userInfo if pharmacyInfo is not present.
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const user = userInfo?.user || userInfo;
        
        const finalAccount = pharmacy || user;

        if (finalAccount) {
            setLoggedPharmacy(finalAccount);
            fetchChats(finalAccount._id || finalAccount.id);
        }
    }, []);

    const fetchChats = async (pharmacyId) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/chat/pharmacy/${pharmacyId}`);
            setChats(data);
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    return (
        <div className="h-full w-full bg-slate-50 flex p-6 gap-6 rounded-tl-3xl">
            {/* Sidebar List */}
            <div className="w-80 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-white shadow-sm z-10">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Patient Messages</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Inbox</p>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-50/50">
                    {chats.map((chat) => (
                        <div
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            className={`px-5 py-4 cursor-pointer border-b border-slate-100 flex items-center gap-3 transition-colors ${
                                selectedChat?._id === chat._id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-white'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {chat.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="font-bold text-slate-800 truncate text-sm">{chat.user?.name}</h3>
                                {chat.latestMessage && (
                                    <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                        <span className="font-semibold">{chat.latestMessage.sender === (loggedPharmacy?._id || loggedPharmacy?.id) ? "You: " : ""}</span>
                                        {chat.latestMessage.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <div className="p-8 text-center text-slate-400 font-medium text-sm">
                            No active patient queries.
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
