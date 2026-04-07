import React, { useState, useEffect } from 'react';
import { Plus, Search, X, MessageCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import ChatBox from '../Components/Chat/ChatBox';
import { chatAPI, userAPI } from '../utils/apiEndpoints';

const UserChats = () => {
    const { setSelectedChat, selectedChat, unreadCounts, markAsRead } = useChat();
    const [chats, setChats] = useState([]);
    const [loggedUser, setLoggedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pharmacies, setPharmacies] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const user = userInfo?.user || userInfo;
        if (user) {
            setLoggedUser(user);
            fetchChats();
        }
    }, []);

    const fetchChats = async () => {
        try {
            const { data } = await chatAPI.getUserChats();
            setChats(data);
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    const fetchPharmacies = async () => {
        setLoading(true);
        try {
            const { data } = await userAPI.getPharmacyUsers();
            setPharmacies(data);
        } catch (error) {
            console.error("Failed to fetch pharmacies", error);
        } finally {
            setLoading(false);
        }
    };

    const startChat = async (pharmacyId) => {
        try {
            const { data } = await chatAPI.startChat({
                userId: pharmacyId
            });
            
            if (!chats.find((c) => c._id === data._id)) {
                setChats([data, ...chats]);
            }
            setSelectedChat(data);
            setShowModal(false);
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    useEffect(() => {
        if (showModal) {
            fetchPharmacies();
        }
    }, [showModal]);

    const filteredPharmacies = pharmacies.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pharmacyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full w-full bg-gray-100 flex p-6 gap-6 relative">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Messages</h1>
                        <p className="text-sm font-medium text-gray-400 mt-1">Your conversations</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95"
                        title="New Chat"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => {
                        const otherUser = chat.users.find(u => u._id !== loggedUser?._id);
                        return (
                            <div
                                key={chat._id}
                                onClick={() => {
                                    setSelectedChat(chat);
                                    markAsRead(chat._id);
                                }}
                                className={`px-6 py-4 cursor-pointer border-b border-gray-50 flex items-center gap-4 transition-all relative ${
                                    selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm border border-blue-100">
                                    {otherUser?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-bold text-gray-800 truncate">
                                        {otherUser?.pharmacyName || otherUser?.name}
                                    </h3>
                                    {chat.latestMessage && (
                                        <p className="text-xs text-gray-500 truncate mt-1 font-medium pb-0.5">
                                            <span className="font-semibold">{chat.latestMessage.sender._id === loggedUser?._id ? "You: " : ""}</span>
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
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <MessageCircle size={32} />
                            </div>
                            <p className="text-gray-400 font-medium text-sm">No conversations yet.</p>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="mt-4 text-blue-600 text-sm font-bold hover:underline"
                            >
                                Start a chat with a pharmacy
                            </button>
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

            {/* Selection Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">New Chat</h2>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">Select a Pharmacy</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by pharmacy name..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading pharmacies...</div>
                            ) : filteredPharmacies.length > 0 ? (
                                filteredPharmacies.map(pharmacy => (
                                    <button
                                        key={pharmacy._id}
                                        onClick={() => startChat(pharmacy._id)}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-all group text-left"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                            {pharmacy.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 group-hover:text-blue-900">{pharmacy.pharmacyName || pharmacy.name}</h4>
                                            <p className="text-xs text-gray-400 group-hover:text-blue-600/70">{pharmacy.email}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400">No pharmacies found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserChats;