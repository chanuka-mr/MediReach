import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyAPI } from '../../utils/apiEndpoints';
import {
  Building2,
  Clock,
  MapPin,
  RefreshCw,
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
  Wifi,
  WifiOff,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Plus,
  Activity,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, ComposedChart, Line, Area, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const PharmacyDashboard = () => {
  const [stats, setStats] = useState({
    totalPharmacies: 0,
    activePharmacies: 0,
    inactivePharmacies: 0,
    totalDistricts: 0,
    pharmaciesList: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const navigate = useNavigate();

  useEffect(() => {
    fetchPharmacyStats();
  }, []);

  const fetchPharmacyStats = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.getAllPharmacies();
      const pharmacies = response.data.data?.pharmacies || response.data.pharmacies || (Array.isArray(response.data) ? response.data : []);

      const stats = {
        totalPharmacies: pharmacies.length,
        activePharmacies: pharmacies.filter(p => p.isActive).length,
        inactivePharmacies: pharmacies.filter(p => !p.isActive).length,
        totalDistricts: [...new Set(pharmacies.map(p => p.district).filter(Boolean))].length,
        pharmaciesList: pharmacies
      };

      setStats(stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load pharmacy statistics.');
    } finally {
      setLoading(false);
    }
  };

  // Mock function for stock % and orders since it's not in DB yet
  const getMockData = (id) => {
    // Generate deterministic mock data based on ID string
    const sum = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      stock: 40 + (sum % 60), // 40-99%
      orders: sum % 30, // 0-29 orders
      syncMin: (sum % 59) + 1,
      isSlow: sum % 5 === 0 // 20% chance of slow sync
    };
  };

  const filteredPharmacies = stats.pharmaciesList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.district.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Support the specific Slow Sync mockup filter
    if (filter === 'Online') return p.isActive;
    if (filter === 'Offline') return !p.isActive;
    if (filter === 'Slow') {
      const mock = getMockData(p._id);
      return p.isActive && mock.isSlow;
    }
    return true;
  });

  // Analytics Data Preparation
  const districtData = Object.entries(
    stats.pharmaciesList.reduce((acc, p) => {
      acc[p.district] = (acc[p.district] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const statusData = [
    { name: 'Online', value: stats.activePharmacies, color: '#0E7C5B' },
    { name: 'Offline', value: stats.inactivePharmacies, color: '#C0392B' }
  ];

  const trendData = [...Array(7)].map((_, i) => {
    const orders = Math.floor(Math.random() * 50) + 20;
    return {
      name: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
      orders: orders,
      revenue: (orders * (Math.floor(Math.random() * 2000) + 1500)) / 1000 // In thousands (k)
    };
  });

  const radarData = [
    { subject: 'Stock Accuracy', A: 120, B: 110, fullMark: 150 },
    { subject: 'Delivery Speed', A: 98, B: 130, fullMark: 150 },
    { subject: 'Uptime', A: 86, B: 130, fullMark: 150 },
    { subject: 'Response', A: 99, B: 100, fullMark: 150 },
    { subject: 'Customer Score', A: 85, B: 90, fullMark: 150 },
    { subject: 'Resolution', A: 65, B: 85, fullMark: 150 },
  ];

  return (
    <div className="min-h-screen bg-white text-blueSlate font-sans p-8 pb-20 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1px)] [background-size:24px_24px]">

      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-blueSlate mb-3">
            <div className="w-8 h-8 rounded-lg bg-techBlue text-white flex items-center justify-center shadow-md">
              <LayoutDashboard size={14} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lilacAsh">MediReach</span>
            <ChevronRight size={14} className="text-paleSlate" strokeWidth={3} />
            <span className="px-3 py-1 bg-white rounded-full border border-paleSlate shadow-sm font-bold text-techBlue">Pharmacy</span>
          </div>
          <h1 className="text-[2.5rem] leading-tight font-extrabold text-blueSlate tracking-tight">Pharmacy Dashboard</h1>
          <p className="text-lilacAsh mt-1 font-semibold text-base">Real-time monitoring across the pharmacy network</p>
        </div>

        <button
          onClick={() => navigate('/pharmacy/manage')}
          className="bg-techBlue hover:bg-[#012a60] text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-techBlue/30 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} /> Manage Pharmacies <ArrowUpRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger font-medium">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total */}
        <div
          onClick={() => setFilter('All')}
          className={`rounded-[1.25rem] p-6 text-white shadow-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${filter === 'All' ? 'ring-4 ring-techBlue/30 bg-techBlue' : 'bg-techBlue/90'}`}
        >
          {/* Subtle glow / grid overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-white/60 text-xs font-bold tracking-[0.15em] uppercase mb-1 drop-shadow-sm">Total Pharmacies</p>
              <h2 className="text-[3.5rem] leading-none font-extrabold tracking-tight mb-4 drop-shadow-md">{stats.totalPharmacies}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md font-bold text-xs ring-1 ring-white/30 backdrop-blur-sm">
                  <TrendingUp size={12} strokeWidth={3} /> +12%
                </span>
                <span className="text-white/70 font-medium">All-time network growth</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-[0.9rem] border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-inner">
              <Activity size={22} strokeWidth={2} className="text-white/90" />
            </div>
          </div>
        </div>

        {/* Card 2: Active */}
        <div
          onClick={() => setFilter('Online')}
          className={`rounded-[1.25rem] p-6 border shadow-sm flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${filter === 'Online' ? 'border-techBlue ring-4 ring-techBlue/10 bg-blue-50/30' : 'bg-white border-paleSlate hover:shadow-md'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lilacAsh text-xs font-bold tracking-[0.15em] uppercase mb-1">Active Pharmacies</p>
              <h2 className="text-[3.5rem] leading-none font-extrabold text-techBlue tracking-tight mb-3">
                {stats.activePharmacies.toString().padStart(2, '0')}
              </h2>
              <p className="text-lilacAsh/80 text-sm font-semibold">Currently operational</p>
            </div>
            <div className="w-12 h-12 rounded-[0.9rem] bg-white border border-paleSlate flex items-center justify-center shadow-sm">
              <Clock size={22} className="text-techBlue" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Card 3: Districts */}
        <div
          onClick={() => { setFilter('All'); setSearchTerm(''); }}
          className="bg-white rounded-[1.25rem] p-6 border border-paleSlate shadow-sm flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:border-techBlue/30"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lilacAsh text-xs font-bold tracking-[0.15em] uppercase mb-1">Districts Covered</p>
              <h2 className="text-[3.5rem] leading-none font-extrabold text-techBlue tracking-tight mb-3">
                {stats.totalDistricts.toString().padStart(2, '0')}
              </h2>
              <p className="text-lilacAsh/80 text-sm font-semibold">Across Sri Lanka</p>
            </div>
            <div className="w-12 h-12 rounded-[0.9rem] bg-white border border-paleSlate flex items-center justify-center shadow-sm">
              <Building2 size={22} className="text-techBlue" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart 1: District Bar */}
        <div className="bg-white p-7 rounded-[1.5rem] border border-paleSlate/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xl font-extrabold text-blueSlate mb-6">Pharmacies by District</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={districtData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#023E8A" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4C6EF5" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} dy={12} />
                <YAxis tick={{ fontSize: 13, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9', opacity: 0.8, radius: 8 }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', fontWeight: 'bold', padding: '12px 20px' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={48} background={{ fill: '#F8FAFC', radius: [8, 8, 8, 8] }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Donut */}
        <div className="bg-white p-7 rounded-[1.5rem] border border-paleSlate/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h3 className="text-xl font-extrabold text-blueSlate mb-6">Operational Status</h3>
          <div className="h-64 relative -mt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <defs>
                  <linearGradient id="pieOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0E7C5B" stopOpacity={1} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="pieOffline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C0392B" stopOpacity={1} />
                    <stop offset="100%" stopColor="#F87171" stopOpacity={0.9} />
                  </linearGradient>
                  <filter id="dropShadow" height="130%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.12" />
                  </filter>
                </defs>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Online' ? 'url(#pieOnline)' : 'url(#pieOffline)'} filter="url(#dropShadow)" />
                  ))}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="text-[2.5rem] font-black" fill="#1E293B">
                  {stats.totalPharmacies}
                </text>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-extrabold tracking-[0.2em] uppercase" fill="#64748B">
                  Total
                </text>
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-2">
            {statusData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2 text-sm font-extrabold text-blueSlate">
                <div className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ background: entry.name === 'Online' ? 'linear-gradient(to bottom, #0E7C5B, #34D399)' : 'linear-gradient(to bottom, #C0392B, #F87171)' }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Charts Row 2 - Ultra Complex Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Chart 3: Complex Dual-Axis Area & Line Chart */}
        <div className="bg-white p-6 rounded-[1.25rem] border border-paleSlate shadow-sm lg:col-span-2 hover:shadow-md transition-shadow relative overflow-hidden">
          <h3 className="text-lg font-bold text-blueSlate mb-1">Financial Pipeline Performance</h3>
          <p className="text-sm font-semibold text-lilacAsh mb-6">Tracking dual metrics: Sales Volume vs Gross Revenue (LKR '000)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4C6EF5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4C6EF5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4A5568', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#4A5568', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#0E7C5B', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val}k`} />
                <Tooltip
                  cursor={{ stroke: '#4C6EF5', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #DDE3ED', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#4A5568', paddingTop: '10px' }} />
                <Area yAxisId="left" type="monotone" name="Total Orders" dataKey="orders" stroke="#4C6EF5" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                <Line yAxisId="right" type="monotone" name="Gross Revenue" dataKey="revenue" stroke="#0E7C5B" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 2, fill: '#fff' }} />
                <Bar yAxisId="left" dataKey="orders" name="Fulfilled" barSize={12} fill="#023E8A" radius={[4, 4, 0, 0]} opacity={0.2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Radar Performance Metrics */}
        <div className="bg-white p-6 rounded-[1.25rem] border border-paleSlate shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-blueSlate mb-1">Network Health Analytics</h3>
          <p className="text-sm font-semibold text-lilacAsh mb-2">Automated system efficiency scores</p>
          <div className="h-72 w-full flex justify-center -ml-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#DDE3ED" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A5568', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Network Average" dataKey="A" stroke="#0E7C5B" fill="#0E7C5B" fillOpacity={0.6} />
                <Radar name="Target SLA" dataKey="B" stroke="#023E8A" fill="#023E8A" fillOpacity={0.2} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #DDE3ED', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Network Status Row */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-success/10 text-success border border-success/30 rounded-lg font-bold text-sm shadow-sm min-w-[100px] justify-center">
            <Wifi size={14} strokeWidth={3} /> {stats.activePharmacies} Online
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-warn/10 text-warn border border-warn/30 rounded-lg font-bold text-sm shadow-sm min-w-[120px] justify-center">
            <AlertTriangle size={14} strokeWidth={3} /> 0 Slow Sync
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-danger/10 text-danger border border-danger/30 rounded-lg font-bold text-sm shadow-sm min-w-[100px] justify-center">
            <WifiOff size={14} strokeWidth={3} /> {stats.inactivePharmacies} Offline
          </div>
        </div>
        <button onClick={fetchPharmacyStats} className="flex items-center gap-2 px-4 py-2 bg-white border border-paleSlate rounded-full text-blueSlate text-sm font-bold hover:bg-snow transition-colors shadow-sm focus:ring-2 focus:ring-paleSlate">
          <RefreshCw size={14} className={loading ? "animate-spin text-lilacAsh" : "text-lilacAsh"} strokeWidth={2.5} /> Refreshed just now
        </button>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-paleSlate rounded-[1rem] shadow-sm overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="p-5 px-6 border-b border-paleSlate flex flex-col xl:flex-row justify-between xl:items-center gap-5 bg-white z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-blueSlate">Connected Pharmacies</h2>
            <p className="text-lilacAsh text-sm font-semibold">{filteredPharmacies.length} of {stats.totalPharmacies} pharmacies shown</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lilacAsh/70" size={16} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search pharmacies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-paleSlate rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-techBlue/20 focus:border-techBlue w-64 text-blueSlate font-bold placeholder:text-lilacAsh/50 placeholder:font-semibold shadow-sm"
              />
            </div>
            <div className="flex p-1 border border-paleSlate rounded-xl bg-snow shadow-sm">
              {['All', 'Online', 'Slow', 'Offline'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-1.5 text-sm font-extrabold rounded-lg transition-all ${filter === f ? 'bg-techBlue text-white shadow-sm' : 'text-blueSlate/80 hover:text-blueSlate hover:bg-paleSlate/40'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex p-1 border border-paleSlate rounded-xl bg-snow shadow-sm ml-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-techBlue' : 'text-lilacAsh hover:text-blueSlate'}`}
                title="Table View"
              >
                <Activity size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-techBlue' : 'text-lilacAsh hover:text-blueSlate'}`}
                title="Grid View"
              >
                <LayoutDashboard size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Table/Grid Content */}
        <div className="overflow-x-auto">
          {viewMode === 'table' ? (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-paleSlate bg-white text-[10px] uppercase tracking-[0.15em] text-lilacAsh font-extrabold">
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Pharmacy</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Last Sync</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paleSlate/60 bg-white">
                {filteredPharmacies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-lilacAsh font-semibold text-lg">
                      No pharmacies found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPharmacies.map((pharmacy, index) => {
                    const mock = getMockData(pharmacy._id);
                    const isOnline = pharmacy.isActive;
                    const isSlow = mock.isSlow && isOnline;

                    return (
                      <tr key={pharmacy._id} className="hover:bg-snow/60 transition-colors group">
                        <td className="px-6 py-4 text-paleSlate font-bold text-sm">
                          {(index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-[0.6rem] flex items-center justify-center text-white font-extrabold shadow-sm text-sm overflow-hidden ${isOnline ? 'bg-lilacAsh' : 'bg-blueSlate/60'
                              }`}>
                              {pharmacy.image ? (
                                <img src={pharmacy.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                pharmacy.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-extrabold text-blueSlate text-[15px]">{pharmacy.name}</h3>
                              <div className="flex items-center gap-1 text-[11px] text-lilacAsh font-bold mt-0.5">
                                <MapPin size={10} strokeWidth={3} /> {pharmacy.district}, Sri Lanka
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {!isOnline ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger/10 text-danger border border-danger/20 text-[11px] font-extrabold rounded-full">
                                <WifiOff size={10} strokeWidth={3} /> Offline
                              </span>
                            ) : isSlow ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-warn/10 text-warn border border-warn/20 text-[11px] font-extrabold rounded-full">
                                <AlertTriangle size={10} strokeWidth={3} /> Slow Sync
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success border border-success/20 text-[11px] font-extrabold rounded-full">
                                <Wifi size={10} strokeWidth={3} /> Online
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-lilacAsh font-bold">
                            <Clock size={12} strokeWidth={2.5} /> {isOnline ? `${mock.syncMin} min ago` : '2 days ago'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-28">
                            <div className="flex justify-end text-[11px] font-extrabold mb-1.5 leading-none" style={{ color: isOnline ? (mock.stock > 70 ? '#0E7C5B' : mock.stock > 40 ? '#B45309' : '#C0392B') : '#94a3b8' }}>
                              {isOnline ? mock.stock : 0}%
                            </div>
                            <div className="h-1.5 w-full bg-paleSlate rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isOnline ? (mock.stock > 70 ? 'bg-success' : mock.stock > 40 ? 'bg-warn' : 'bg-danger') : 'bg-blueSlate/40'}`}
                                style={{ width: `${isOnline ? mock.stock : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`font-extrabold text-[17px] leading-tight ${isOnline ? 'text-techBlue' : 'text-lilacAsh'}`}>
                              {isOnline ? mock.orders : 0}
                            </span>
                            <span className="text-[9px] font-extrablack text-lilacAsh uppercase tracking-[0.1em]">Orders</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 pr-8">
                          <div className="flex items-center justify-end gap-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/pharmacy/${pharmacy._id}`)}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-techBlue/5 border border-techBlue/20 rounded-lg text-techBlue text-[11px] font-extrabold hover:bg-techBlue hover:text-white transition-all shadow-sm focus:ring-2 focus:ring-techBlue/20"
                              title="View Branch Analytics"
                            >
                              <TrendingUp size={12} strokeWidth={2.5} /> Analytics
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-slate-50/50">
              {filteredPharmacies.map((pharmacy) => {
                const mock = getMockData(pharmacy._id);
                return (
                  <div
                    key={pharmacy._id}
                    onClick={() => navigate(`/pharmacy/${pharmacy._id}`)}
                    className="bg-white rounded-2xl border border-paleSlate shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer hover:border-techBlue/30"
                  >
                    <div className="h-32 bg-slate-100 relative overflow-hidden">
                      {pharmacy.image ? (
                        <img src={pharmacy.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Building2 size={32} />
                        </div>
                      )}
                      <div className={`absolute top-0 left-0 w-full h-1 ${pharmacy.isActive ? 'bg-success' : 'bg-danger'}`} />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur rounded text-[10px] font-bold text-blueSlate shadow-sm">
                        {pharmacy.district}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-extrabold text-blueSlate truncate mb-1">{pharmacy.name}</h3>
                      <div className="flex items-center justify-between text-[11px] font-bold text-lilacAsh mb-3">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {pharmacy.isActive ? `${mock.syncMin}m ago` : 'Offline'}
                        </span>
                        <span className={pharmacy.isActive ? 'text-success' : 'text-danger'}>
                          {pharmacy.isActive ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-paleSlate rounded-full overflow-hidden">
                          <div className={`h-full bg-techBlue`} style={{ width: `${mock.stock}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-blueSlate">{mock.stock}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
