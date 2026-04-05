import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarRange,
  ChevronDown,
  ChevronUp,
  ChartColumn,
  CreditCard,
  Filter,
  Globe,
  Lock,
  Search,
  Sparkles,
  UserCircle2,
  LogOut,
  Trash2,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import SearchInterface from './components/SearchInterface';
import GeneratedChart from './components/GeneratedChart';
import InsightPanel from './components/InsightPanel';
import PricingV3 from './components/PricingV3';
import ChatbotV2 from './components/ChatbotV2';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import { apiDelete, apiGet, apiPost, getAuthToken, setAuthToken } from './api';

const mapPlanToUiPlan = (plan) => {
  if (plan === 'plus') return 'Plus';
  if (plan === 'max') return 'Pro';
  if (plan === 'max_plus' || plan === 'pro_max') return 'Premium';
  return 'Free';
};

const formatPlanLabel = (plan) => {
  if (!plan) return 'Trial';
  return String(plan)
    .split('_')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
};

const PLAN_STORAGE_CONFIG = {
  trial: { enabled: false, retentionDays: 0 },
  plus: { enabled: false, retentionDays: 0 },
  max: { enabled: true, retentionDays: 30 },
  max_plus: { enabled: true, retentionDays: 180 },
  pro_max: { enabled: true, retentionDays: 365 },
};

export default function App() {
  const [publicPath, setPublicPath] = useState(() => window.location.pathname || '/');
  const [hasStarted, setHasStarted] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [generations, setGenerations] = useState([]);
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [usage, setUsage] = useState(null);
  const [headerSearch, setHeaderSearch] = useState('');
  const [visualMode, setVisualMode] = useState('free');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [category, setCategory] = useState('All categories');
  const [region, setRegion] = useState('All regions');
  const [databaseStatus, setDatabaseStatus] = useState('Connect your PostgreSQL database to generate charts from SQL.');
  const [databaseInfo, setDatabaseInfo] = useState({ connected: false, schema: { tables: [] } });
  const [dashboardKpis, setDashboardKpis] = useState(null);
  const profileMenuRef = useRef(null);
  const plan = mapPlanToUiPlan(user?.plan);
  const currentPlanId = user?.plan || 'trial';
  const isTrialPlan = currentPlanId === 'trial';
  const hasDatasetLink = Boolean(databaseInfo?.connected);

  const loadSavedDashboards = async () => {
    try {
      const result = await apiGet('/api/dashboards/mine');
      setSavedDashboards(result?.dashboards || []);
    } catch (_err) {
      setSavedDashboards([]);
    }
  };

  const loadUsage = async () => {
    try {
      const result = await apiGet('/api/usage/status');
      setUsage(result);
    } catch (_err) {
      setUsage(null);
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        const me = await apiGet('/api/auth/me');
        setUser(me?.user || null);
      } catch (_err) {
        setAuthToken(null);
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadSavedDashboards();
    loadUsage();
    apiGet('/api/db/status')
      .then((result) => {
        setDatabaseInfo(result || { connected: false, schema: { tables: [] } });
        setDatabaseStatus(result?.connected ? 'Connected successfully.' : 'Connect your PostgreSQL database to start querying.');
      })
      .catch(() => {
        setDatabaseInfo({ connected: false, schema: { tables: [] } });
      });
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current) return;
      if (profileMenuRef.current.contains(event.target)) return;
      setIsProfileMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const classifyGenerationTier = (queryText) => {
    const premiumKeywords = [
      'forecast',
      'prediction',
      'anomaly',
      'cohort',
      'segment',
      'sankey',
      'heatmap',
      'radar',
      'waterfall',
      'gantt',
      'funnel',
      'whisker',
    ];
    const normalized = (queryText || '').toLowerCase();
    return premiumKeywords.some((keyword) => normalized.includes(keyword)) ? 'premium' : 'core';
  };

  const activeFilters = useMemo(() => ({
    dateRange,
    category,
    region,
    useUserDb: Boolean(databaseInfo?.connected),
  }), [dateRange, category, region, databaseInfo]);

  useEffect(() => {
    if (!hasStarted) return;
    if (!hasDatasetLink) {
      setDashboardKpis(null);
      return;
    }

    const loadDashboardData = async () => {
      try {
        const datasetKpis = await apiGet('/api/db/kpis');
        setDashboardKpis(datasetKpis?.kpis || null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setDashboardKpis(null);
      }
    };

    loadDashboardData();
  }, [hasStarted, activeFilters, hasDatasetLink]);

  useEffect(() => {
    if (plan === 'Free') return;

    setGenerations((prev) =>
      prev.map((gen) => {
        const tier = gen.tier || classifyGenerationTier(gen.query);
        if (tier !== 'premium') return gen;
        return {
          ...gen,
          tier,
          isOpen: true,
        };
      })
    );
  }, [plan]);

  useEffect(() => {
    if (!isTrialPlan) return;
    setIsChatOpen(false);
    if (activeNav === 'chat') {
      setActiveNav('dashboard');
    }
  }, [activeNav, isTrialPlan]);

  const handleQuerySubmit = (query) => {
    apiPost('/api/usage/check-dashboard', {})
      .then(() => {
        setGenerations((prev) => {
          const tier = classifyGenerationTier(query);
          const isLockedByPlan = tier === 'premium' && plan === 'Free';
          return [{ query, id: Date.now(), tier, isOpen: !isLockedByPlan }, ...prev];
        });
        loadUsage();
        setActiveNav('reports');
        setTimeout(() => {
          const reportsSection = document.getElementById('reports');
          reportsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      })
      .catch((err) => {
        alert(err.message || 'Limit reached, upgrade plan.');
        setActiveScreen('pricing');
      });
  };

  const handleDatabaseConnect = async (dbUrl) => {
    if (!dbUrl) {
      setDatabaseInfo({ connected: false, schema: { tables: [] } });
      setDatabaseStatus('Please provide a PostgreSQL connection URL.');
      return;
    }

    setDatabaseStatus('Connecting to database...');
    try {
      const result = await apiPost('/api/db/connect', { dbUrl });
      setDatabaseInfo(result || { connected: false, schema: { tables: [] } });
      const tableCount = result?.schema?.tables?.length || 0;
      setDatabaseStatus(`Connected successfully. ${tableCount} tables discovered.`);
    } catch (err) {
      setDatabaseInfo({ connected: false, schema: { tables: [] } });
      setDatabaseStatus(err.message || 'Failed to connect database.');
    }
  };

  const handleDatabaseDisconnect = async () => {
    setDatabaseStatus('Disconnecting database...');
    try {
      await apiPost('/api/db/disconnect', {});
      setDatabaseInfo({ connected: false, schema: { tables: [] } });
      setDatabaseStatus('Database disconnected. Connect your PostgreSQL database to start querying.');
      setDashboardKpis(null);
    } catch (err) {
      setDatabaseStatus(err.message || 'Failed to disconnect database.');
    }
  };

  const handleSaveDashboard = async () => {
    if (!generations.length) {
      alert('Generate at least one chart before saving.');
      return;
    }

    const config = {
      filters: activeFilters,
      charts: generations.slice(0, 8).map((item) => ({
        type: item.tier === 'premium' ? 'premium' : 'standard',
        query: item.query,
      })),
    };

    try {
      await apiPost('/api/dashboards/save', { config });
      await loadSavedDashboards();
      alert('Dashboard saved.');
    } catch (err) {
      alert(err.message || 'Unable to save dashboard.');
    }
  };

  const handleLoadDashboard = async (dashboard) => {
    try {
      console.log('Loading dashboard:', dashboard);
      
      // Config can be either string or object
      let config = dashboard.config;
      if (typeof config === 'string') {
        try {
          config = JSON.parse(config);
        } catch (e) {
          console.warn('Failed to parse config string, treating as object');
        }
      }
      
      // If still not an object, try parsing dashboard object itself
      if (!config || typeof config !== 'object') {
        console.log('Config is not object, trying to parse dashboard');
        config = typeof dashboard === 'string' ? JSON.parse(dashboard) : dashboard;
        if (config.config) {
          if (typeof config.config === 'string') {
            config = JSON.parse(config.config);
          } else {
            config = config.config;
          }
        }
      }
      
      console.log('Final config:', config);
      
      if (!config || typeof config !== 'object') {
        throw new Error('Invalid dashboard configuration format');
      }
      
      // Restore charts/generations from saved config
      const chartList = config.charts || [];
      console.log('Restoring charts:', chartList);
      
      if (chartList.length === 0) {
        alert('Dashboard has no charts to restore.');
        return;
      }
      
      const restoredCharts = chartList.map((chart, idx) => {
        if (!chart.query) {
          console.warn('Chart missing query:', chart);
          return null;
        }
        return {
          id: Date.now() + idx,
          query: chart.query,
          tier: chart.type === 'premium' ? 'premium' : 'standard',
          isOpen: true,
        };
      }).filter(Boolean);
      
      if (restoredCharts.length === 0) {
        alert('No valid charts found in dashboard.');
        return;
      }
      
      setGenerations(restoredCharts);
      setActiveNav('reports');
      
      // Scroll to reports section
      setTimeout(() => {
        const reportsSection = document.getElementById('reports');
        reportsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      
      alert(`Dashboard loaded with ${restoredCharts.length} charts.`);
    } catch (err) {
      console.error('Failed to load dashboard:', err, dashboard);
      alert(`Failed to load dashboard: ${err.message}`);
    }
  };

  const handleAuthSuccess = async (result) => {
    setAuthToken(result?.token);
    setUser(result?.user || null);
    setHasStarted(true);
    await loadSavedDashboards();
    await loadUsage();
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setUsage(null);
    setSavedDashboards([]);
    setGenerations([]);
    setIsChatOpen(false);
    setIsProfileMenuOpen(false);
    setDatabaseInfo({ connected: false, schema: { tables: [] } });
    setDatabaseStatus('Connect your PostgreSQL database to generate charts from SQL.');
    setAuthMode('login');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await apiDelete('/api/auth/account');
      alert('Your account has been deleted successfully.');
      handleLogout();
      setHasStarted(true);
    } catch (err) {
      alert(err.message || 'Unable to delete account right now.');
    }
  };

  const visibleGenerations = generations
    .map((gen) => {
      const tier = gen.tier || classifyGenerationTier(gen.query);
      const baseOpen = typeof gen.isOpen === 'boolean' ? gen.isOpen : true;
      const isLockedByPlan = tier === 'premium' && plan === 'Free';
      return {
        ...gen,
        tier,
        isLockedByPlan,
        isOpen: isLockedByPlan ? false : baseOpen,
      };
    })
    .filter((gen) => gen.query.toLowerCase().includes(headerSearch.toLowerCase()));

  const toggleGenerationOpen = (id) => {
    setGenerations((prev) =>
      prev.map((gen) =>
        gen.id === id
          ? {
              ...gen,
              isOpen: !gen.isOpen,
            }
          : gen
      )
    );
  };

  const kpiCards = useMemo(() => {
    const totalSales = Number(dashboardKpis?.totalRevenue || 0);
    const totalProfit = Number(dashboardKpis?.totalProfit || 0);
    const totalOrders = Number(dashboardKpis?.totalOrders || 0);
    const avgOrder = Number(dashboardKpis?.averageOrderValue || 0);
    const uniqueProducts = Number(dashboardKpis?.uniqueProducts || 0);

    return [
      { label: 'Total Sales', value: `₹${totalSales.toLocaleString()}` },
      { label: 'Profit', value: `₹${totalProfit.toLocaleString()}` },
      { label: 'Orders', value: totalOrders.toLocaleString() },
      {
        label: 'Avg Order Value',
        value: `₹${avgOrder.toLocaleString()} (${uniqueProducts} products)`,
      },
    ];
  }, [dashboardKpis]);

  const handleNavChange = (next) => {
    if (next === 'chat' && isTrialPlan) {
      setIsChatOpen(false);
      setActiveNav('dashboard');
      return;
    }

    setActiveNav(next);
    setActiveScreen('dashboard');

    if (next === 'chat') {
      setIsChatOpen(true);
      return;
    }

    setTimeout(() => {
      const target = document.getElementById(next);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  useEffect(() => {
    const syncPath = () => setPublicPath(window.location.pathname || '/');
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const navigatePublicPath = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setPublicPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (publicPath === '/privacy-policy') {
    return <PrivacyPolicyPage onBack={() => navigatePublicPath('/')} />;
  }

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  if (!authReady) {
    return <div className="auth-loading">Checking your session...</div>;
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage
        onSuccess={handleAuthSuccess}
        onSwitch={() => setAuthMode('signup')}
      />
    ) : (
      <SignupPage
        onSuccess={handleAuthSuccess}
        onSwitch={() => setAuthMode('login')}
        onOpenPrivacyPolicy={() => navigatePublicPath('/privacy-policy')}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeNav}
        setActiveTab={handleNavChange}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        plan={plan}
        isTrialPlan={isTrialPlan}
      />

      <div className="app-main-column">
        <header className="top-navbar">
          <div>
            <h1 className="page-title">{activeScreen === 'pricing' ? 'Subscription Plans' : 'Dashboard'}</h1>
            <p className="page-subtitle">Talking BI enterprise workspace</p>
          </div>

          <div className="top-navbar-actions">
            <label className="top-search" aria-label="Search">
              <Search size={16} />
              <input
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search dashboards, metrics, or reports"
              />
            </label>

            {usage?.dashboard?.limit !== null && (
              <div className="quota-chip">
                <Sparkles size={14} />
                {Math.max(0, usage?.dashboard?.remaining || 0)} dashboards left
              </div>
            )}

            {usage?.chat?.limit !== null && (
              <div className="quota-chip">
                <Sparkles size={14} />
                {Math.max(0, usage?.chat?.remaining || 0)} chats left
              </div>
            )}

            <div className="plan-chip current">Current Plan: {formatPlanLabel(currentPlanId)}</div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setActiveScreen('pricing')}
            >
              <CreditCard size={16} />
              Upgrade Plan
            </button>

            <div className="profile-menu-wrapper" ref={profileMenuRef}>
              <button
                type="button"
                className="profile-btn"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              >
                <UserCircle2 size={22} />
                <span>{user?.email}</span>
                <ChevronDown size={16} />
              </button>

              {isProfileMenuOpen ? (
                <div className="profile-dropdown" role="menu" aria-label="Account menu">
                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                  <button
                    type="button"
                    className="profile-dropdown-item danger"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 size={14} />
                    Delete Account
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="main-content-area">
          <AnimatePresence mode="wait">
            {activeScreen === 'pricing' ? (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <PricingV3
                  currentPlan={currentPlanId}
                  onSelectPlan={async (targetPlan) => {
                    try {
                      const result = await apiPost('/api/subscription/plan', { plan: targetPlan });
                      setUser(result?.user || user);
                      await loadUsage();
                      setActiveScreen('dashboard');
                    } catch (err) {
                      alert(err.message || 'Unable to update plan.');
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="dashboard-layout"
              >
                <section className="filters-row">
                  <div className="filter-title">
                    <Filter size={16} />
                    Filters
                  </div>

                  <label className="filter-control">
                    <CalendarRange size={14} />
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>This quarter</option>
                      <option>This year</option>
                    </select>
                  </label>

                  <label className="filter-control">
                    <ChartColumn size={14} />
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option>All categories</option>
                      <option>Electronics</option>
                      <option>Clothing</option>
                      <option>Furniture</option>
                    </select>
                  </label>

                  <label className="filter-control">
                    <Globe size={14} />
                    <select value={region} onChange={(e) => setRegion(e.target.value)}>
                      <option>All regions</option>
                      <option>Maharashtra</option>
                      <option>Madhya Pradesh</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                      <option>Rajasthan</option>
                    </select>
                  </label>

                  <div className="view-mode-toggle" role="group" aria-label="Graph visual mode">
                    <button
                      type="button"
                      className={`view-mode-btn ${visualMode === 'free' ? 'active' : ''}`}
                      onClick={() => setVisualMode('free')}
                    >
                      Free View
                    </button>
                    <button
                      type="button"
                      className={`view-mode-btn premium ${visualMode === 'premium' ? 'active' : ''}`}
                      onClick={() => setVisualMode('premium')}
                    >
                      Premium View
                    </button>
                  </div>
                </section>

                {hasDatasetLink ? (
                  <section className="kpi-grid">
                    {kpiCards.map((kpi) => (
                      <article className="kpi-card" key={kpi.label}>
                        <p className="kpi-label">{kpi.label}</p>
                        <p className="kpi-value">{kpi.value}</p>
                      </article>
                    ))}
                  </section>
                ) : (
                  <section className="query-card">
                    <p>Connect your database URL to unlock KPI cards and AI insights.</p>
                  </section>
                )}

                <section className="query-card" id="dashboard">
                  <SearchInterface
                    onQuerySubmit={handleQuerySubmit}
                    onDatabaseConnect={handleDatabaseConnect}
                    onDatabaseDisconnect={handleDatabaseDisconnect}
                    isDatabaseConnected={Boolean(databaseInfo?.connected)}
                    databaseStatus={databaseStatus}
                  />
                  <div className="dashboard-action-row">
                    {PLAN_STORAGE_CONFIG[currentPlanId]?.enabled ? (
                      <button type="button" className="btn-primary" onClick={handleSaveDashboard}>
                        Save Dashboard
                      </button>
                    ) : (
                      <span className="dataset-pill">
                        {currentPlanId === 'trial' ? 'Upgrade to enable dashboard save' : 'Storage not available with this plan'}
                      </span>
                    )}
                    {databaseInfo?.connected ? <span className="dataset-pill">Database connected</span> : null}
                  </div>
                </section>

                <div className="content-split-grid">
                  <section className="charts-section" id="reports">
                    <div className="section-header">
                      <h2>Reports</h2>
                      <span>{visibleGenerations.length} generated</span>
                    </div>

                    {visibleGenerations.length > 0 ? (
                      <div className="charts-stack">
                        {visibleGenerations.map((gen) => (
                          <article className={`chart-wrapper graph-view-${visualMode} ${gen.tier === 'premium' ? 'premium-card-shell' : ''}`} key={gen.id}>
                            <div className="chart-wrapper-header">
                              <div className="chart-wrapper-title-group">
                                <h3>{gen.query}</h3>
                                <div className="chart-meta-row">
                                  <span className="chart-meta-chip">Generated analysis</span>
                                  <span className={`chart-meta-chip tier-${gen.tier}`}>{gen.tier === 'premium' ? '[PREMIUM]' : '[FREE]'}</span>
                                  <span className={`chart-meta-chip ${gen.isLockedByPlan ? 'status-locked' : 'status-open'}`}>
                                    {gen.isLockedByPlan ? 'Locked' : gen.isOpen ? 'Open' : 'Collapsed'}
                                  </span>
                                </div>
                              </div>

                              <div className="chart-wrapper-actions">
                                {!gen.isLockedByPlan ? (
                                  <button
                                    type="button"
                                    className="chart-toggle-btn"
                                    onClick={() => toggleGenerationOpen(gen.id)}
                                  >
                                    {gen.isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    {gen.isOpen ? 'Collapse' : 'Open'}
                                  </button>
                                ) : (
                                  <span className="chart-locked-badge">
                                    <Lock size={12} /> Unlock in premium
                                  </span>
                                )}
                              </div>
                            </div>
                            <GeneratedChart
                              query={gen.query}
                              plan={plan}
                              onFollowup={handleQuerySubmit}
                              filters={activeFilters}
                              tier={gen.tier}
                              isOpen={gen.isOpen}
                              isLocked={gen.isLockedByPlan}
                              visualMode={visualMode}
                            />
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>{generations.length > 0 ? 'No matching reports. Try another search.' : 'No data available. Please run a query.'}</p>
                      </div>
                    )}
                  </section>

                  <aside id="insights">
                    {hasDatasetLink ? (
                      <InsightPanel filters={activeFilters} />
                    ) : (
                      <section className="saved-dashboards-panel">
                        <h3>AI Insights</h3>
                        <p>AI insights appear after a valid database connection is established.</p>
                      </section>
                    )}
                    <section className="saved-dashboards-panel">
                      <h3>Saved Dashboards</h3>
                      {savedDashboards.length ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {savedDashboards.map((item) => {
                            const saved = new Date(item.createdAt);
                            const expires = item.expiresAt ? new Date(item.expiresAt) : null;
                            const now = new Date();
                            const daysLeft = expires ? Math.ceil((expires - now) / (1000 * 60 * 60 * 24)) : null;
                            const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
                            const isExpired = daysLeft !== null && daysLeft <= 0;
                            
                            return (
                              <li 
                                key={item.id}
                                onClick={() => !isExpired && handleLoadDashboard(item)}
                                style={{
                                  padding: '10px 12px',
                                  margin: '6px 0',
                                  backgroundColor: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                  border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.3)' : isExpiringSoon ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                                  borderRadius: '6px',
                                  cursor: isExpired ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontSize: '12px',
                                  color: isExpired ? '#f87171' : '#e5e7eb',
                                  opacity: isExpired ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isExpired) {
                                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isExpired) {
                                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                  }
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{isExpired ? '🗑️' : '📊'} {saved.toLocaleDateString()}</span>
                                  <span style={{ fontSize: '11px', opacity: 0.7 }}>
                                    {daysLeft === null ? '♾️ Forever' : daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                                  </span>
                                </div>
                                {daysLeft !== null && (
                                  <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.6 }}>
                                    Expires: {expires?.toLocaleDateString()}
                                  </div>
                                )}
                                {isExpired && (
                                  <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>
                                    This dashboard has expired
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p>No saved dashboards yet.</p>
                      )}
                    </section>
                  </aside>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ChatbotV2
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        plan={plan}
        filters={activeFilters}
        onUsageRefresh={loadUsage}
      />
    </div>
  );
}
