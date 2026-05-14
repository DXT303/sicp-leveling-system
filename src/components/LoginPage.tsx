import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import './auth.css';

const LoginPage: React.FC = () => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value.replace(/\D/, '');
    if (!val) return;
    const updated = [...digits];
    updated[i] = val[val.length - 1];
    setDigits(updated);
    setError('');
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace') {
      const updated = [...digits];
      if (digits[i]) {
        updated[i] = '';
        setDigits(updated);
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const passcode = digits.join('');
    if (passcode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await response.json();
      if (response.status === 429) {
        setError('Too many attempts. Try again in 15 minutes.');
        setDigits(Array(6).fill(''));
        return;
      }
      if (!response.ok) {
        setError(data.message || 'Invalid passcode. Please try again.');
        setDigits(Array(6).fill(''));
        inputs.current[0]?.focus();
        return;
      }
      window.location.href = '/dashboard';
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">

        <div className="auth-form-wrapper">
          <form className="auth-form-group" onSubmit={handleSubmit} noValidate>

            <h1 className="auth-title">Welcome back!</h1>
            <p className="auth-subtitle">Enter your passcode to access the system.</p>

            <div className="otp-group">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  className={`otp-input${error ? ' input-error' : ''}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>
            {error && <span className="auth-error">{error}</span>}

            <div className="auth-btn-wrapper">
              <button className="auth-btn" type="submit" disabled={isLoading}>
                <span className="auth-btn-text">{isLoading ? 'Verifying...' : 'Login'}</span>
              </button>
            </div>

            <p className="auth-contact">Need access? <span>Contact Administrator</span></p>

          </form>
        </div>

        <div className="auth-bg-image" />

      </div>
      <p className="auth-copyright">© 2026 Survey Leveling System V1.1</p>
    </div>
  );
};

export default LoginPage;
