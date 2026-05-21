import React, { useState, ChangeEvent, FormEvent } from 'react';
import './auth.css';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: LoginErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('isLoggedIn', 'true');
        setShowSuccess(true);
        setTimeout(() => window.location.replace('/dashboard'), 1500);
      } else {
        setErrorMsg(data.message || 'Invalid email or password.');
        setShowError(true);
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setShowError(true);
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
            <p className="auth-subtitle">Sign in to access the system.</p>

            <div className="auth-field">
              <span className="auth-field-label" onMouseDown={(e) => e.preventDefault()}>Email address</span>
              <input
                className={`auth-field-input${errors.email ? ' input-error' : ''}`}
                type="email"
                name="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <span className="auth-field-label" onMouseDown={(e) => e.preventDefault()}>Password</span>
              <input
                className={`auth-field-input${errors.password ? ' input-error' : ''}`}
                type="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            <div className="auth-btn-wrapper">
              <button className="auth-btn" type="submit" disabled={isLoading}>
                <span className="auth-btn-text">{isLoading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </div>

            <p className="auth-contact">
              No account? <span onClick={() => window.location.href = '/signup'}>Sign Up</span>
            </p>

          </form>
        </div>

        <div className="auth-bg-image" />

      </div>
      <p className="auth-copyright">© 2026 Survey Leveling System V1.1</p>

      {showError && (
        <div className="error-modal-overlay" onClick={() => setShowError(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-icon">❌</div>
            <h2 className="error-modal-title">Oops!</h2>
            <p className="error-modal-message">{errorMsg}</p>
            <button className="error-modal-btn" onClick={() => setShowError(false)}>Try Again</button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52">
                <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2 className="success-modal-title">Access Granted!</h2>
            <p className="success-modal-message">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
