import React, { useState } from 'react';
import { apiPost } from '../api';
import AuthShell from './AuthShell';

export default function SignupPage({ onSuccess, onSwitch, onOpenPrivacyPolicy }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!consentChecked) {
      setError('You must accept the Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const result = await apiPost('/api/auth/signup', { email, password, consent: consentChecked });
      onSuccess(result);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="New accounts start on Trial plan by default. Upgrade anytime inside dashboard."
      submitLabel="Signup"
      switchLabel="Already have an account? Login"
      onSwitch={onSwitch}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      passwordHint="Default plan: Trial"
      submitDisabled={!consentChecked}
      submitDisabledMessage="You must accept the Privacy Policy"
      afterPasswordContent={(
        <label className="auth-consent-row">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
          />
          <span>
            I agree to the{' '}
            <a
              href="/privacy-policy"
              className="auth-policy-link"
              onClick={(e) => {
                if (typeof onOpenPrivacyPolicy === 'function') {
                  e.preventDefault();
                  onOpenPrivacyPolicy();
                }
              }}
            >
              Privacy Policy
            </a>
          </span>
        </label>
      )}
    />
  );
}
