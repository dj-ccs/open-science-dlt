import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';

type AuthMethod = 'email' | 'stellar';

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stellarKey, setStellarKey] = useState('');
  const [stellarSecret, setStellarSecret] = useState('');
  const [localError, setLocalError] = useState('');

  const { login, loginWithStellar, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Error is handled by store
    }
  };

  const handleStellarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    try {
      // Get challenge from server
      const { challenge } = await api.getChallenge();

      // Sign challenge with Stellar secret key
      // In production, this would use a wallet like Freighter
      const { Keypair } = await import('@stellar/stellar-sdk');
      const keypair = Keypair.fromSecret(stellarSecret);
      const signature = keypair.sign(Buffer.from(challenge)).toString('base64');

      await loginWithStellar(stellarKey || keypair.publicKey(), challenge, signature);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('Failed to authenticate with Stellar');
      }
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Open Science account</p>
        </div>

        <div className="card p-8">
          {/* Auth Method Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setAuthMethod('email')}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                authMethod === 'email'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMethod('stellar')}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                authMethod === 'stellar'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Stellar Wallet
            </button>
          </div>

          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{displayError}</p>
            </div>
          )}

          {authMethod === 'email' ? (
            <form onSubmit={handleEmailLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStellarLogin}>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    For development: Enter your Stellar secret key directly.
                    In production, use a wallet like Freighter.
                  </p>
                </div>
                <div>
                  <label htmlFor="stellarSecret" className="label">
                    Stellar Secret Key
                  </label>
                  <input
                    type="password"
                    id="stellarSecret"
                    value={stellarSecret}
                    onChange={(e) => setStellarSecret(e.target.value)}
                    className="input font-mono text-sm"
                    placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="stellarKey" className="label">
                    Public Key (optional)
                  </label>
                  <input
                    type="text"
                    id="stellarKey"
                    value={stellarKey}
                    onChange={(e) => setStellarKey(e.target.value)}
                    className="input font-mono text-sm"
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to derive from secret key
                  </p>
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? 'Authenticating...' : 'Sign In with Stellar'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
