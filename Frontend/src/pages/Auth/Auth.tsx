import { useState } from 'react';
import { AlertCircle, BookOpen } from 'lucide-react';
import authService from '../../api/auth.service.js';

interface AuthPageProps {
  onAuth: (user: { username: string; token: string }) => void;
}

interface AuthFormData {
  username: string;
  password: string;
  email: string;
  isLogin: boolean;
}

const Auth = ({ onAuth }: AuthPageProps) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authForm, setAuthForm] = useState<AuthFormData>({
    username: '',
    password: '',
    email: '',
    isLogin: true
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authForm.isLogin) {
        const res = await authService.login(authForm.username, authForm.password);
        if (!res || !res.token) throw new Error('Login failed');
        onAuth({ username: authForm.username, token: res.token });
      } else {
        await authService.register(authForm.username, authForm.password);
        // after register, attempt login
        const res = await authService.login(authForm.username, authForm.password);
        if (!res || !res.token) throw new Error('Login after register failed');
        onAuth({ username: authForm.username, token: res.token });
      }

      setAuthForm({ username: '', password: '', email: '', isLogin: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Story Writing App
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={authForm.username}
            onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />

          {!authForm.isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : authForm.isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          onClick={() => setAuthForm({ ...authForm, isLogin: !authForm.isLogin })}
          className="w-full mt-4 text-purple-600 hover:text-purple-700"
        >
          {authForm.isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
