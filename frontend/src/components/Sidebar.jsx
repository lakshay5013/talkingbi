import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, LayoutDashboard, Lightbulb, MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
];

export default function Sidebar({ activeTab, setActiveTab, onToggleChat, isChatOpen, plan }) {
  const isTrialPlan = plan === 'Free' || plan === 'Trial';
  
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">BI</div>
        <div>
          <h2>Talking BI</h2>
          <p>Enterprise Suite</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`sidebar-nav-item ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {!isTrialPlan && (
        <button type="button" className="chat-toggle" onClick={onToggleChat}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isChatOpen ? 'close' : 'open'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="chat-toggle-content"
            >
              {isChatOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
              {isChatOpen ? 'Hide Chat' : 'Open Chat'}
            </motion.span>
          </AnimatePresence>
        </button>
      )}
    </aside>
  );
}
