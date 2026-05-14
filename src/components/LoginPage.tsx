import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import './auth.css';

const LoginPage: React.FC = () => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
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
      setShowModal(true);
      return;
    }
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Validate passcode (replace '123456' with your actual passcode)
      const VALID_PASSCODE = '123456'; // Change this to your actual passcode
      
      if (passcode === VALID_PASSCODE) {
        setShowSuccess(true);
        sessionStorage.setItem('isLoggedIn', 'true');
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 1500);
      } else {
        setError('Invalid passcode. Please try again.');
        setShowModal(true);
        setDigits(Array(6).fill(''));
        inputs.current[0]?.focus();
      }
      setIsLoading(false);
    }, 800);
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
                  className="otp-input"
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>

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

      {/* Error Modal */}
      {showModal && (
        <div className="error-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-icon">❌</div>
            <h2 className="error-modal-title">Oops!</h2>
            <p className="error-modal-message">{error}</p>
            <button className="error-modal-btn" onClick={() => setShowModal(false)}>Try Again</button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52">
                <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
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
