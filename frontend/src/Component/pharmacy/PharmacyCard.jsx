import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Phone, Mail, Clock, MapPin, Trash2, QrCode, Power, Activity } from 'lucide-react';

const PharmacyCard = ({ pharmacy, onEdit, onDelete, onToggleStatus, onGenerateQR, isSelected, onToggleSelect }) => {
  const navigate = useNavigate();
  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-all relative`}>
      {/* Selection Checkbox */}
      <div className="absolute top-3 right-3 z-10">
        <input 
          type="checkbox" 
          checked={isSelected || false}
          onChange={onToggleSelect}
          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shadow-sm"
        />
      </div>

      {/* Pharmacy Image */}
      <div className="h-40 bg-gray-100 overflow-hidden relative">
        {pharmacy.image ? (
          <img 
            src={pharmacy.image} 
            alt={pharmacy.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <Building2 size={40} strokeWidth={1.5} />
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}
        <div className={`absolute top-0 left-0 w-full h-1 ${pharmacy.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{pharmacy.name}</h3>
              <p className="text-xs text-gray-500">Dr. {pharmacy.pharmacistName}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            pharmacy.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {pharmacy.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} className="text-gray-400" />
            <span>{pharmacy.district}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={14} className="text-gray-400" />
            <span>{pharmacy.contactNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={14} className="text-gray-400" />
            <span className="truncate">{pharmacy.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={14} className="text-gray-400" />
            <span>{pharmacy.operatingHours?.open} - {pharmacy.operatingHours?.close}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onGenerateQR(pharmacy._id, pharmacy.name)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
            title="Generate QR Code"
          >
            <QrCode size={18} />
          </button>
          <button 
            onClick={() => navigate(`/pharmacy/${pharmacy._id}`)}
            className="p-2 border border-blue-100 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            title="View Branch Analytics"
          >
            <Activity size={16} />
          </button>
          <button
            onClick={() => onToggleStatus(pharmacy._id, pharmacy.isActive)}
            className={`p-2 rounded-lg transition ${
              pharmacy.isActive 
                ? 'text-orange-600 hover:bg-orange-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={pharmacy.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power size={18} />
          </button>
          <button
            onClick={() => onDelete(pharmacy._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyCard;