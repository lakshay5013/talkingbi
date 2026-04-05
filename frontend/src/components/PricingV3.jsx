import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Shield, Crown, Rocket, Gem } from 'lucide-react';

export default function PricingV3({ onSelectPlan, currentPlan }) {
  const plans = [
    {
      id: 'trial',
      title: 'Trial',
      price: 'INR 0',
      icon: <Shield />,
      desc: 'Start fast with core analytics.',
      features: ['2 dashboards only', 'Core chart generation', 'Basic workspace access'],
      tier: 'basic',
    },
    {
      id: 'plus',
      title: 'Plus',
      price: 'INR 999',
      icon: <Sparkles />,
      desc: 'For regular BI exploration.',
      features: ['3 dashboards per week', 'Limited chat', 'No dashboard storage'],
      tier: 'premium',
    },
    {
      id: 'max',
      title: 'Max',
      price: 'INR 1999',
      icon: <Rocket />,
      desc: 'Growth-ready analytics stack.',
      features: ['10 dashboards per month', 'Store dashboards for 1 month', 'Limited chat'],
      tier: 'premium',
    },
    {
      id: 'max_plus',
      title: 'Max Plus',
      price: 'INR 3999',
      icon: <Gem />,
      desc: 'Advanced insights for scale.',
      features: ['30 dashboards per month', 'Store dashboards for 6 months', 'Unlimited chat'],
      tier: 'premium-strong',
    },
    {
      id: 'pro_max',
      title: 'Pro Max',
      price: 'INR 7999',
      icon: <Crown />,
      desc: 'Everything unlocked for enterprise BI.',
      features: ['Unlimited dashboards', 'Store dashboards for 1 year', 'Unlimited chat', 'All features unlocked'],
      tier: 'best',
      isBest: true,
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      className="pricing-page"
    >
      <div className="pricing-header">
        <h1>Choose your Talking BI subscription</h1>
        <p>
          Switch plans anytime. No payment flow required in this demo, only plan experience and feature access.
        </p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <PricingCard
            key={plan.id}
            id={plan.id}
            title={plan.title}
            price={plan.price}
            icon={plan.icon}
            desc={plan.desc}
            features={plan.features}
            tier={plan.tier}
            isBest={plan.isBest}
            isActive={currentPlan === plan.id}
            onSelect={() => onSelectPlan(plan.id)}
            delay={0.07 * index}
          />
        ))}
      </div>
    </motion.div>
  );
}

const PricingCard = ({ id, title, price, icon, desc, features, onSelect, delay, isBest, tier, isActive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className={`pricing-card ${tier || ''} ${isBest ? 'best-plan' : ''}`}
    >
      {isBest && (
        <div className="popular-pill">
          Best Value
        </div>
      )}
      <div className="pricing-card-head">
        <div className="pricing-icon">{icon}</div>
        <h3>{title}</h3>
      </div>
      <p className="pricing-desc">{desc}</p>
      <div className="pricing-value-row">
        <span className="price-value">{price}</span>
        <span className="price-suffix">/mo</span>
      </div>
      <ul className="pricing-features">
        {features.map((f, i) => (
          <li key={i}>
            <CheckCircle2 className="w-5 h-5" /> {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={onSelect} disabled={isActive}
        className={`pricing-action ${isActive ? 'active' : isBest ? 'primary' : 'secondary'}`}
      >
        {isActive ? 'Current Plan' : 'Select Plan'}
      </button>
      <div className="plan-code">Plan code: {id}</div>
    </motion.div>
  );
};
