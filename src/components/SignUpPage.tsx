import React, { useState, ChangeEvent, FormEvent } from 'react';
import './auth.css';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  retypePassword: string;
  agreeToTerms: boolean;
}

interface SignUpFormErrors {
  name?: string;
  email?: string;
  password?: string;
  retypePassword?: string;
  agreeToTerms?: string;
}

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    retypePassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: SignUpFormErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.retypePassword) {
      newErrors.retypePassword = 'Please retype your password';
    } else if (formData.password !== formData.retypePassword) {
      newErrors.retypePassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // For demo purposes, always succeed
      setShowSuccess(true);
      setTimeout(() => {
        window.location.replace('/');
      }, 1500);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">

        {/* Left: Form */}
        <div className="auth-form-wrapper">
          <form className="auth-form-group" onSubmit={handleSubmit} noValidate>

            <h1 className="auth-title">Get Started Now</h1>

            {/* Name Field */}
            <div className="auth-field">
              <span className="auth-field-label" onMouseDown={(e) => e.preventDefault()}>Name</span>
              <input
                id="name"
                className={`auth-field-input${errors.name ? ' input-error' : ''}`}
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="auth-error">{errors.name}</span>}
            </div>

            {/* Email Field */}
            <div className="auth-field">
              <span className="auth-field-label" onMouseDown={(e) => e.preventDefault()}>Email address</span>
              <input
                id="email"
                className={`auth-field-input${errors.email ? ' input-error' : ''}`}
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="auth-field">
              <span className="auth-field-label" onMouseDown={(e) => e.preventDefault()}>Password</span>
              <input
                id="password"
                className={`auth-field-input${errors.password ? ' input-error' : ''}`}
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            {/* Retype Password Field */}
            <div className="auth-field">
              <span className="auth-field-label" onMouseDown={(e) => e.preventDefault()}>Retype Password</span>
              <input
                id="retypePassword"
                className={`auth-field-input${errors.retypePassword ? ' input-error' : ''}`}
                type="password"
                name="retypePassword"
                placeholder="Retype your password"
                value={formData.retypePassword}
                onChange={handleChange}
              />
              {errors.retypePassword && <span className="auth-error">{errors.retypePassword}</span>}
            </div>

            {/* Terms Checkbox */}
            <div className="auth-checkbox-group">
              <input
                className="auth-checkbox"
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label className="auth-checkbox-label" htmlFor="agreeToTerms">
                I agree to the terms &amp; policy
              </label>
            </div>
            {errors.agreeToTerms && <span className="auth-error">{errors.agreeToTerms}</span>}

            {/* Sign Up Button */}
            <div className="auth-btn-wrapper">
              <button className="auth-btn" type="submit" disabled={isLoading}>
                <span className="auth-btn-text">{isLoading ? 'Signing up...' : 'Sign Up'}</span>
              </button>
            </div>

            <p className="auth-bottom-link">
              Have an account? <span onClick={() => window.location.href = '/'}>Sign In</span>
            </p>

          </form>
        </div>

        <div className="auth-bg-image" />

      </div>

      {showError && (
        <div className="error-modal-overlay" onClick={() => setShowError(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-icon">❌</div>
            <h2 className="error-modal-title">Oops!</h2>
            <p className="error-modal-message">{errors.email || 'Registration failed.'}</p>
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
            <h2 className="success-modal-title">Account Created!</h2>
            <p className="success-modal-message">Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
