import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, LayoutDashboard, Lightbulb, Lock, MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
];

export default function Sidebar({ activeTab, setActiveTab, onToggleChat, isChatOpen, plan, isTrialPlan }) {
  
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
            onClick={() => {
              if (id === 'chat' && isTrialPlan) return;
              setActiveTab(id);
            }}
            className={`sidebar-nav-item ${activeTab === id ? 'active' : ''} ${id === 'chat' && isTrialPlan ? 'locked' : ''}`}
            disabled={id === 'chat' && isTrialPlan}
            title={id === 'chat' && isTrialPlan ? 'Chat is locked on Trial plan' : label}
          >
            <Icon size={18} />
            <span>{label}</span>
            {id === 'chat' && isTrialPlan ? <Lock size={14} /> : null}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className={`chat-toggle ${isTrialPlan ? 'locked' : ''}`}
        onClick={isTrialPlan ? undefined : onToggleChat}
        disabled={isTrialPlan}
        title={isTrialPlan ? 'Chat is locked on Trial plan' : 'Toggle chat'}
      >
        {isTrialPlan ? (
          <span className="chat-toggle-content locked-state">
            <Lock size={16} />
            Chat Locked
          </span>
        ) : (
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
        )}
      </button>
    </aside>
  );
}
