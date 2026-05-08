import React, { useState, ChangeEvent, FormEvent } from 'react';
import { LoginFormData, LoginFormErrors, LoginPayload } from '../types/login.types';
import './auth.css';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};
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
    const payload: LoginPayload = {
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    };
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      console.log('Login success:', data);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ password: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">

        {/* Left: Form */}
        <div className="auth-form-wrapper">
          <form className="auth-form-group" onSubmit={handleSubmit} noValidate>

            <h1 className="auth-title">Welcome back!</h1>
            <p className="auth-subtitle">Enter your Credentials to access your account</p>

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
              <span className="auth-field-label" onMouseDown={(e) => e.preventDefault()}>
                Password
                <a href="/forgot-password" className="forgot-password" onClick={(e) => e.stopPropagation()}>Forgot password</a>
              </span>
              <input
                className={`auth-field-input${errors.password ? ' input-error' : ''}`}
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            {/* Remember Me */}
            <div className="auth-checkbox-group">
              <input
                className="auth-checkbox"
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label className="auth-checkbox-label" htmlFor="rememberMe">Remember me</label>
            </div>

            {/* Login Button */}
            <div className="auth-btn-wrapper">
              <button className="auth-btn" type="submit" disabled={isLoading}>
                <span className="auth-btn-text">{isLoading ? 'Logging in...' : 'Login'}</span>
              </button>
            </div>

            <p className="auth-bottom-link">
              Don't have an account? <span onClick={() => window.location.href = '/signup'}>Sign Up</span>
            </p>

          </form>
        </div>

        {/* Right: Background Image */}
        <div className="auth-bg-image" />

      </div>
    </div>
  );
};

export default LoginPage;
