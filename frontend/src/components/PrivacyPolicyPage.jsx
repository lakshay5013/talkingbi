import React from 'react';

export default function PrivacyPolicyPage({ onBack }) {
  return (
    <div className="privacy-policy-page">
      <div className="privacy-policy-card">
        <div className="privacy-policy-head">
          <span className="privacy-policy-chip">Privacy</span>
          <h1>Privacy Policy</h1>
          <p>
            We collect only the minimum data required to create your account and deliver Talking BI
            services securely.
          </p>
        </div>

        <section>
          <h2>1. What We Collect</h2>
          <p>We store your account email, encrypted password hash, plan data, and workspace usage metadata.</p>
        </section>

        <section>
          <h2>2. How We Use Data</h2>
          <p>
            Your data is used only for authentication, product functionality, billing tiers, and platform
            reliability improvements.
          </p>
        </section>

        <section>
          <h2>3. Security</h2>
          <p>
            Passwords are never stored in plain text. We use one-way hashing and standard access controls to
            protect account information.
          </p>
        </section>

        <section>
          <h2>4. Your Choices</h2>
          <p>
            By creating an account, you consent to this policy. If you do not agree, please do not sign up.
          </p>
        </section>

        <div className="privacy-policy-actions">
          <button type="button" className="btn-primary" onClick={onBack}>
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  );
}
