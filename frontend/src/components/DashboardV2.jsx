import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Tooltip as RechartsTooltip, 
  XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
  Lock, TrendingUp, Users, ShoppingCart, DollarSign, Download, Play, Pause, BarChart2, PieChart as PieIcon, Activity, AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { apiGet } from '../api';

const monthMap = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

const formatMonthLabel = (monthValue) => {
  const key = String(monthValue || '').padStart(2, '0');
  return monthMap[key] || String(monthValue || 'NA');
};

const renderPieSliceLabel = ({ name, percent }) => {
  if (!percent || percent < 0.05) return '';
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};

// Auto-counting number component
const AnimatedNumber = ({ value, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const startValue = displayValue;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(easeProgress * (value - startValue) + startValue));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString('en-IN')}</span>;
};

export default function DashboardV2({ plan, filters }) {
  const isPremium = plan === 'Premium';
  const isProMode = plan === 'Pro' || isPremium;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    kpis: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, uniqueProducts: 0 },
    monthlyRevenue: [],
    categorySales: [],
    topStates: []
  });
  const [focusModeId, setFocusModeId] = useState(null);

  // Fetch real data from backend APIs
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [salesOverview, categoryAnalysis, regionalTrends] = await Promise.all([
          apiGet('/api/dashboards/sales-overview', filters),
          apiGet('/api/dashboards/category-analysis', filters),
          apiGet('/api/dashboards/regional-trends', filters),
        ]);

        if (cancelled) return;

        const kpis = salesOverview?.kpis || {};
        const monthlyRevenue = (salesOverview?.monthlyRevenue || []).map(m => ({
          month: formatMonthLabel(m.month),
          revenue: Number(m.revenue || 0),
        }));
        const categorySales = (categoryAnalysis?.categorySales || []).map(c => ({
          name: c.name,
          value: Number(c.value || 0),
        }));
        const topStates = (regionalTrends?.topStates || []).map(s => ({
          state: s.state,
          revenue: Number(s.revenue || 0),
        }));

        setData({
          kpis: {
            totalRevenue: Number(kpis.totalRevenue || 0),
            totalOrders: Number(kpis.totalOrders || 0),
            averageOrderValue: Number(kpis.averageOrderValue || 0),
            uniqueProducts: Number(kpis.uniqueProducts || 0),
          },
          monthlyRevenue,
          categorySales,
          topStates,
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Dashboard fetch error:', err);
          setError('Failed to load dashboard data. Make sure the backend is running.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [filters]);

  const toggleFocus = (id) => {
     if (focusModeId === id) setFocusModeId(null);
     else setFocusModeId(id);
  };

  const getCardClass = (id) => {
    if (!focusModeId) return "opacity-100 scale-100 z-10 glass-card";
    if (focusModeId === id) return "opacity-100 scale-[1.05] z-50 glass-panel shadow-[0_0_50px_rgba(59,130,246,0.3)] ring-1 ring-blue-500";
    return "opacity-20 scale-[0.98] blur-[2px] pointer-events-none";
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="loader-ring" style={{ width: 48, height: 48 }}></div>
        <p className="text-zinc-400 mt-4 text-sm">Loading real-time dashboard data...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-300 text-lg font-medium">{error}</p>
        <p className="text-zinc-500 text-sm mt-2">Check that backend server is running on port 3001</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-8 pb-32 max-w-7xl mx-auto space-y-8 relative"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Sales Cockpit <span className="px-3 py-1 bg-white/10 text-xs rounded-full font-medium tracking-widest uppercase border border-white/20 text-emerald-300 neon-glow">Live Data</span>
          </h1>
          <p className="text-zinc-400 mt-2 font-light">Real-time intelligence from Orders & Details datasets.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Revenue" value={data.kpis.totalRevenue} prefix="₹" icon={<DollarSign/>} delay={0.1} />
        <KpiCard title="Total Orders" value={data.kpis.totalOrders} icon={<ShoppingCart/>} delay={0.2} />
        <KpiCard title="Avg Order Value" value={data.kpis.averageOrderValue} prefix="₹" icon={<TrendingUp/>} delay={0.3} />
        <KpiCard title="Unique Products" value={data.kpis.uniqueProducts} icon={<Activity/>} delay={0.4} />
      </div>

      {/* Insight Section */}
      <InsightSection isPremium={isPremium} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative mt-12">
        {/* Background Overlay for Focus Mode */}
        <AnimatePresence>
          {focusModeId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Revenue Trend Chart */}
        <motion.div layout onClick={() => toggleFocus('revenue')} className={`p-6 rounded-3xl transition-all duration-700 cursor-pointer ${getCardClass('revenue')}`}>
           <ChartHeader title="Revenue Velocity" />
           {data.monthlyRevenue.length > 0 ? (
             <ResponsiveContainer width="100%" height={300}>
               <AreaChart data={data.monthlyRevenue} margin={{top:10, right:30, left:0, bottom:0}}>
                 <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                 <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
                 <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                 <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white' }} formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                 <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
               </AreaChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-[300px] flex items-center justify-center text-zinc-500">No monthly data available</div>
           )}
        </motion.div>

        {/* Categories Bar */}
        <motion.div layout onClick={() => toggleFocus('categories')} className={`p-6 rounded-3xl transition-all duration-700 cursor-pointer ${getCardClass('categories')}`}>
           <ChartHeader title="Category Dominance" />
           {data.categorySales.length > 0 ? (
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categorySales} margin={{top:20, right:30, left:0, bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white' }} formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {data.categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'][index%5]} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-[300px] flex items-center justify-center text-zinc-500">No category data available</div>
           )}
        </motion.div>
        
        {/* Regions Pie */}
        <motion.div layout onClick={() => toggleFocus('regions')} className={`p-6 rounded-3xl transition-all duration-700 cursor-pointer col-span-1 lg:col-span-2 ${getCardClass('regions')}`}>
           <ChartHeader title="Regional Distribution" />
           {data.topStates.length > 0 ? (
             <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data.topStates}
                    dataKey="revenue"
                    nameKey="state"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    labelLine={false}
                    label={renderPieSliceLabel}
                  >
                    {data.topStates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#eab308', '#f97316'][index % 10]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white' }} formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Legend verticalAlign="bottom" height={28} formatter={(value) => <span style={{ color: '#d4d4d8' }}>{value}</span>} />
                </PieChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-[350px] flex items-center justify-center text-zinc-500">No regional data available</div>
           )}
        </motion.div>
      </div>

    </motion.div>
  );
}

const ChartHeader = ({ title }) => (
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-xl font-semibold text-white tracking-wide">{title}</h3>
    <button className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
      Explain Chart
    </button>
  </div>
);

const KpiCard = ({ title, value, prefix, icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: "spring" }}
    className="glass-card p-6 rounded-3xl flex flex-col justify-between group overflow-hidden relative"
  >
    <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[30px] group-hover:bg-purple-500/20 transition-colors duration-500 pointer-events-none" />
    
    <div className="flex items-center justify-between text-zinc-400 mb-6 z-10">
      <span className="text-sm font-medium tracking-wide uppercase">{title}</span>
      <div className="p-2.5 bg-white/5 rounded-xl text-blue-400 group-hover:text-purple-400 transition-colors">{icon}</div>
    </div>
    <div className="text-4xl font-black text-white tracking-tight z-10">
      <AnimatedNumber value={value} prefix={prefix} />
    </div>
  </motion.div>
);

const InsightSection = ({ isPremium }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.5, duration: 0.8 }}
    className={`relative p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 overflow-hidden ${!isPremium ? 'premium-blur select-none' : ''}`}
  >
    <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
      <SparkleIcon /> Priority AI Insights
    </h3>
    <div className="space-y-3">
      <p className="text-purple-200 text-lg">→ Use the <span className="text-white font-bold bg-purple-500/20 px-2 py-0.5 rounded">Chat Assistant</span> to ask about trends, predictions, and data analysis.</p>
      <p className="text-purple-200 text-lg">→ Try: <span className="text-white font-bold bg-blue-500/20 px-2 py-0.5 rounded">"What trends do you see?"</span> or <span className="text-white font-bold bg-blue-500/20 px-2 py-0.5 rounded">"Which category should I invest in?"</span></p>
    </div>
    
    {!isPremium && (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="bg-black/80 border border-white/10 shadow-2xl rounded-2xl p-6 text-center transform scale-110">
          <Lock className="w-10 h-10 text-white/50 animate-pulse mx-auto mb-3" />
          <h4 className="text-white font-bold text-xl mb-1">Premium Insight Hidden</h4>
          <p className="text-zinc-400 text-sm">Upgrade to unlock predictive forecasting.</p>
        </div>
      </div>
    )}
  </motion.div>
);

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 3v18"/><path d="m5 8 14 8"/><path d="m19 8-14 8"/></svg>
);


