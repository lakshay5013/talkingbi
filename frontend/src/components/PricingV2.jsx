import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Shield, Crown } from 'lucide-react';

export default function PricingV2({ onSelectPlan }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-8 py-20 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-screen relative"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="text-center mb-16 relative z-10 w-full">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Access <span className="text-neon">Hyper-Intelligence</span></h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">Scale your analytics beyond human speed. Choose the architecture that fits your data gravity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full relative z-10">
          <PricingCard 
            title="Free" price="₹0" icon={<Shield />}
           desc="Core analytics processing."
           features={["5 AI Queries Daily", "Basic Visualizations", "Community Support", "Standard Latency"]}
           onSelect={() => onSelectPlan('Free')} delay={0.1}
        />
          <PricingCard 
            title="Pro" price="₹49" icon={<Zap className="text-blue-400" />}
           desc="Unlimited predictive bandwidth."
           features={["Unlimited AI Queries", "Advanced Playback Timeline", "Focus Mode Unlocked", "Sub-second Latency"]}
           onSelect={() => onSelectPlan('Pro')} delay={0.2}
           isPopular
        />
          <PricingCard 
            title="Premium" price="₹199" icon={<Crown className="text-purple-400" />}
           desc="Dedicated neural clusters."
           features={["Custom Fine-tuning", "Predictive Forecasting Models", "Dedicated Node Servers", "1ms Latency Guarantee"]}
           onSelect={() => onSelectPlan('Premium')} delay={0.3}
        />
      </div>
    </motion.div>
  );
}

const PricingCard = ({ title, price, desc, features, onSelect, delay, isPopular }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6, type: "spring" }}
      whileHover={{ y: -10 }}
      className={`glass-card p-8 rounded-3xl relative flex flex-col ${isPopular ? 'ring-2 ring-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)] bg-gradient-to-b from-blue-900/10 to-black' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
          Master Architecture
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">{icon}</div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-zinc-400 text-sm mb-6">{desc}</p>
      <div className="mb-8 border-b border-white/10 pb-8">
        <span className="text-5xl font-black text-white tracking-tighter">{price}</span>
        <span className="text-zinc-500">/mo</span>
      </div>
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={onSelect}
        className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${isPopular ? 'bg-white text-black hover:bg-zinc-200' : 'glass-button text-white'}`}
      >
        Deploy {title}
      </button>
    </motion.div>
  );
};
