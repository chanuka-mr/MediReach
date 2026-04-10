import React, { useState } from 'react';
import { Search, Clock, Heart, SlidersHorizontal, Map as MapIcon, List as ListIcon } from 'lucide-react';
import PharmacyListView from '../pharmacy/PharmacyListView';
import PharmacyNetworkMap from '../pharmacy/PharmacyNetworkMap';
import PharmacyUserDetailModal from './PharmacyUserDetailModal';
import { useNavigate } from 'react-router-dom';
import { messageAPI } from '../../utils/apiEndpoints';

const categories = [
  { id: 'open-now', label: 'Open Now', icon: Clock, color: '#34D399', sub: 'Available right now' },
  { id: '24-7', label: '24/7', icon: Heart, color: '#F472B6', sub: 'Round-the-clock service' },
];

export default function PharmacyUserView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('open-now');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  const handleOrder = (id) => {
    navigate('/user/order');
    setSelectedPharmacy(null);
  };

  const handleChat = async (pharmacyId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const user = userInfo?.user || userInfo;
      if (!user) {
        navigate('/auth');
        return;
      }

      await messageAPI.startChat({
        userId: user._id || user.id,
        pharmacyId: pharmacyId
      });
      navigate('/user/chats');
    } catch (error) {
      console.error('Failed to start chat', error);
    }
  };

  const renderContent = () => {
    if (viewMode === 'map') {
      return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 h-[700px]">
          <PharmacyNetworkMap isUserView={true} onViewInfo={(p) => setSelectedPharmacy(p)} />
        </div>
      );
    }

    const currentCat = categories.find(c => c.id === activeTab);

    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 transition-all duration-500">
        <PharmacyListView
          isUserView={true}
          type={activeTab}
          title={`${currentCat.label} Pharmacies`}
          subTitle={currentCat.sub}
          extraParams={{ search: searchTerm }}
          onViewInfo={(p) => setSelectedPharmacy(p)}
        />
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Detail Modal */}
      {selectedPharmacy && (
        <PharmacyUserDetailModal
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
          onOrder={handleOrder}
          onChat={handleChat}
        />
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Explore <span className="text-blue-600">Pharmacies</span>
          </h1>
          <p className="text-slate-500 font-medium">Find and connect with trusted healthcare providers in your network.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Tabs & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-100/50 p-2 rounded-3xl border border-slate-200/60">
        <div className="flex items-center gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveTab(cat.id); setViewMode('list'); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${activeTab === cat.id && viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
              <cat.icon size={18} color={activeTab === cat.id ? cat.color : undefined} />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <ListIcon size={14} /> List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'map' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <MapIcon size={14} /> Map View
          </button>
        </div>
      </div>

      <div className="min-h-[500px]">
        {renderContent()}
      </div>

      <style>{`
        .ul-pharmacy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
      `}</style>
    </div>
  );
}
