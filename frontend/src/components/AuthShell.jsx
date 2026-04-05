import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function AuthShell({
  title,
  subtitle,
  submitLabel,
  switchLabel,
  onSwitch,
  onSubmit,
  loading,
  error,
  email,
  password,
  setEmail,
  setPassword,
  passwordHint,
  afterPasswordContent,
  submitDisabled,
  submitDisabledMessage,
}) {
  return (
    <div className="auth-shell">
      <motion.aside
        className="auth-brand-panel"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="auth-brand-chip">
          <Sparkles size={14} />
          Talking BI Cloud
        </div>

        <h1>Build Intelligence at the Speed of Thought</h1>
        <p>
          Convert raw data into instant decisions with conversational analytics, premium dashboards,
          and enterprise-ready insights.
        </p>

        <div className="auth-brand-metrics">
          <div>
            <span>99.9%</span>
            <small>Data Uptime</small>
          </div>
          <div>
            <span>5 Plans</span>
            <small>Scale as You Grow</small>
          </div>
          <div>
            <span>Real-time</span>
            <small>BI Conversations</small>
          </div>
        </div>
      </motion.aside>

      <motion.main
        className="auth-form-panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <form className="auth-card" onSubmit={onSubmit}>
          <h2>{title}</h2>
          <p>{subtitle}</p>

          <label className="auth-input-wrap">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
            />
          </label>

          <label className="auth-input-wrap">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="Minimum 6 characters"
            />
            {passwordHint ? <small>{passwordHint}</small> : null}
          </label>

          {afterPasswordContent ? afterPasswordContent : null}

          {error ? <div className="auth-error">{error}</div> : null}

          {submitDisabled && submitDisabledMessage ? (
            <div className="auth-helper-text">{submitDisabledMessage}</div>
          ) : null}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading || submitDisabled}
            title={submitDisabled ? submitDisabledMessage : ''}
          >
            {loading ? 'Please wait...' : submitLabel}
            <ArrowRight size={16} />
          </button>

          <button type="button" className="auth-switch" onClick={onSwitch}>
            {switchLabel}
          </button>
        </form>
      </motion.main>
    </div>
  );
}
