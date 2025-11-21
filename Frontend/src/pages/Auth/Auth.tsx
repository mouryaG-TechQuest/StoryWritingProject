import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import authService from '../../api/auth.service.js';
import FormInput from '../../components/common/FormInput';
import Alert from '../../components/common/Alert';
import { validateRegistrationForm, validateLoginForm, isValidPassword } from '../../utils/validation';

interface AuthPageProps {
  onAuth: (user: { username: string; token: string }) => void;
}

interface AuthFormData {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isLogin: boolean;
}

const Auth = ({ onAuth }: AuthPageProps) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authForm, setAuthForm] = useState<AuthFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    isLogin: true
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setErrors({});
    setLoading(true);

    try {
      if (authForm.isLogin) {
        // Validate login
        const validation = validateLoginForm(authForm.username, authForm.password);
        if (!validation.isValid) {
          setErrors(validation.errors);
          setError('Please fix the errors below');
          setLoading(false);
          return;
        }

        const res = await authService.login(authForm.username, authForm.password);
        if (!res || !res.token) throw new Error('Login failed');
        onAuth({ username: authForm.username, token: res.token });
      } else {
        // Validate registration
        const validation = validateRegistrationForm(authForm);
        if (!validation.isValid) {
          setErrors(validation.errors);
          setError('Please fix the errors below');
          setLoading(false);
          return;
        }

        const response = await authService.register(
          authForm.username,
          authForm.password,
          authForm.confirmPassword,
          authForm.firstName,
          authForm.lastName,
          authForm.email,
          authForm.phoneNumber
        );

        setSuccess(response.message || 'Registration successful! Please check your email to verify your account.');
        
        // Reset form
        setAuthForm({
          username: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          isLogin: true
        });
        
        // Switch to login after 5 seconds
        setTimeout(() => {
          setSuccess('');
          setAuthForm(prev => ({ ...prev, isLogin: true }));
        }, 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  const handleForgotPassword = async () => {
    if (!authForm.email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email })
      });
      
      setSuccess('If the email exists, a password reset code has been sent.');
      setShowForgotPassword(false);
    } catch (err) {
      setError('Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotUsername = async () => {
    if (!authForm.email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await fetch('/api/auth/forgot-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email })
      });
      
      setSuccess('If the email exists, your username has been sent to your email.');
      setShowForgotUsername(false);
    } catch (err) {
      setError('Failed to send username recovery email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-100">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Story Writing App
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {authForm.isLogin ? 'Welcome back!' : 'Create your account'}
        </p>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />
        )}

        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />
        )}

        {showForgotPassword ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Forgot Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email to receive a 5-digit reset code.
            </p>
            <FormInput
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(value) => setAuthForm({ ...authForm, email: value })}
              required
              autoComplete="email"
              className="mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 font-semibold"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : showForgotUsername ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Forgot Username</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email to receive your username.
            </p>
            <FormInput
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(value) => setAuthForm({ ...authForm, email: value })}
              required
              autoComplete="email"
              className="mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleForgotUsername}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 font-semibold"
              >
                {loading ? 'Sending...' : 'Send Username'}
              </button>
              <button
                onClick={() => setShowForgotUsername(false)}
                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleAuth} className="space-y-4">
              {!authForm.isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      type="text"
                      placeholder="First Name *"
                      value={authForm.firstName}
                      onChange={(value) => setAuthForm({ ...authForm, firstName: value })}
                      error={errors.firstName}
                      required
                      autoComplete="given-name"
                    />
                    <FormInput
                      type="text"
                      placeholder="Last Name *"
                      value={authForm.lastName}
                      onChange={(value) => setAuthForm({ ...authForm, lastName: value })}
                      error={errors.lastName}
                      required
                      autoComplete="family-name"
                    />
                  </div>

                  <FormInput
                    type="email"
                    placeholder="Email *"
                    value={authForm.email}
                    onChange={(value) => setAuthForm({ ...authForm, email: value })}
                    error={errors.email}
                    required
                    autoComplete="email"
                  />

                  <FormInput
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={authForm.phoneNumber}
                    onChange={(value) => setAuthForm({ ...authForm, phoneNumber: value })}
                    error={errors.phoneNumber}
                    autoComplete="tel"
                  />
                </>
              )}

              <FormInput
                type="text"
                placeholder="Username *"
                value={authForm.username}
                onChange={(value) => setAuthForm({ ...authForm, username: value })}
                error={errors.username}
                required
                autoComplete="username"
              />

              <FormInput
                type="password"
                placeholder="Password *"
                value={authForm.password}
                onChange={(value) => setAuthForm({ ...authForm, password: value })}
                error={errors.password}
                required
                autoComplete={authForm.isLogin ? 'current-password' : 'new-password'}
              />

              {!authForm.isLogin && (
                <>
                  <FormInput
                    type="password"
                    placeholder="Confirm Password *"
                    value={authForm.confirmPassword}
                    onChange={(value) => setAuthForm({ ...authForm, confirmPassword: value })}
                    error={errors.confirmPassword}
                    required
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-gray-500">
                    Password must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&)
                  </p>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 font-semibold shadow-lg"
              >
                {loading ? 'Processing...' : authForm.isLogin ? 'Login' : 'Register'}
              </button>
            </form>

            {authForm.isLogin && (
              <div className="flex justify-between mt-3 text-sm">
                <button
                  onClick={() => setShowForgotUsername(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Forgot Username?
                </button>
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition group"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>

              <button
                onClick={() => handleOAuthLogin('microsoft')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition group"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Microsoft</span>
              </button>
            </div>

            <button
              onClick={() => setAuthForm({ ...authForm, isLogin: !authForm.isLogin })}
              className="w-full mt-6 text-purple-600 hover:text-purple-700 font-medium"
            >
              {authForm.isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
