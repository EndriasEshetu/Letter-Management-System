import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/common/Input';
import PasswordInput from '@/components/common/PasswordInput';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import logoLetter from '@/assets/logo-letter.png';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL parameters for session expiration
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [location]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] flex flex-col justify-between items-center px-4 py-8 md:py-12">
      {/* Top Header Branding */}
      <header className="w-full max-w-md flex items-center justify-between py-4 mb-2">
        <div className="flex items-center space-x-3">
          <img
            src={logoLetter}
            alt="SITA LMS Logo"
            className="w-10 h-10 object-contain rounded-xl bg-[#526A55]/15 p-1 flex-shrink-0"
          />
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-[#292A27] uppercase">SITA</h1>
            <p className="text-xs text-[#6B6A64]">Sidama Innovation & Technology Agency</p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 bg-[#ECEAE3] text-[#526A55] rounded-full border border-[#D8D7D1]">
          Letter Management System
        </span>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md my-auto">
        <div className="bg-white border border-[#292A27]/08 rounded-[1.75rem] p-7 md:p-10 shadow-sm transition-all">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-[#292A27] tracking-tight mb-1.5">Welcome back</h2>
            <p className="text-sm text-[#6B6A64]">Sign in to continue to Letter Management System</p>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. officer@sita.gov.et"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={fieldErrors.email}
              disabled={isSubmitting}
              autoComplete="email"
              autoFocus
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={fieldErrors.password}
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                Sign In
              </Button>
            </div>
          </form>

          {/* Quick Mock Login Assistance */}
          <div className="mt-8 pt-6 border-t border-[#D8D7D1]/60 text-center">
            <p className="text-xs text-[#8A8983] mb-2 font-medium">Demo Access Accounts:</p>
            <div className="flex flex-wrap justify-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@sita.gov.et');
                  setPassword('Sita@2026');
                }}
                className="px-2.5 py-1 bg-[#F9F8F6] text-[#292A27] border border-[#D8D7D1] rounded-lg hover:bg-[#AEBDA5]/20 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('registry@sita.gov.et');
                  setPassword('Sita@2026');
                }}
                className="px-2.5 py-1 bg-[#F9F8F6] text-[#292A27] border border-[#D8D7D1] rounded-lg hover:bg-[#AEBDA5]/20 transition-colors"
              >
                Registry
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('manager@sita.gov.et');
                  setPassword('Sita@2026');
                }}
                className="px-2.5 py-1 bg-[#F9F8F6] text-[#292A27] border border-[#D8D7D1] rounded-lg hover:bg-[#AEBDA5]/20 transition-colors"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('employee@sita.gov.et');
                  setPassword('Sita@2026');
                }}
                className="px-2.5 py-1 bg-[#F9F8F6] text-[#292A27] border border-[#D8D7D1] rounded-lg hover:bg-[#AEBDA5]/20 transition-colors"
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-md text-center py-4 text-xs text-[#8A8983]">
        © 2026 Sidama Innovation and Technology Agency. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
