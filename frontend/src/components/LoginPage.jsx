import React, { useState } from 'react';
import { apiPost } from '../api';
import AuthShell from './AuthShell';

export default function LoginPage({ onSuccess, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiPost('/api/auth/login', { email, password });
      onSuccess(result);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Access dashboards, plan limits, and saved analytics."
      submitLabel="Login"
      switchLabel="No account? Create one"
      onSwitch={onSwitch}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
    />
  );
}
