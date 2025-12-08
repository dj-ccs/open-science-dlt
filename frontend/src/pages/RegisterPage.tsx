import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    stellarPublicKey: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [generateKey, setGenerateKey] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [localError, setLocalError] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleGenerateKeys = async () => {
    try {
      const { Keypair } = await import('@stellar/stellar-sdk');
      const keypair = Keypair.random();
      const keys = {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
      };
      setGeneratedKeys(keys);
      setFormData({ ...formData, stellarPublicKey: keys.publicKey });
      setGenerateKey(true);
    } catch (err) {
      setLocalError('Failed to generate Stellar keys');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    // Validation
    if (!formData.stellarPublicKey) {
      setLocalError('Stellar public key is required');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        stellarPublicKey: formData.stellarPublicKey,
        email: formData.email || undefined,
        password: formData.password || undefined,
        displayName: formData.displayName || undefined,
      });
      navigate('/login', { state: { registered: true } });
    } catch {
      // Error is handled by store
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join the Open Science community</p>
        </div>

        <div className="card p-8">
          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Stellar Key Section */}
              <div>
                <label className="label">Stellar Public Key *</label>
                {!generateKey ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.stellarPublicKey}
                      onChange={(e) => setFormData({ ...formData, stellarPublicKey: e.target.value })}
                      className="input font-mono text-sm"
                      placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateKeys}
                      className="btn-secondary w-full"
                    >
                      Generate New Stellar Keys
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-800 mb-2">Keys Generated!</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-green-700">Public Key:</p>
                        <p className="font-mono text-xs break-all text-green-900">
                          {generatedKeys?.publicKey}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-green-700">Secret Key (save this!):</p>
                        <p className="font-mono text-xs break-all text-green-900 bg-green-100 p-2 rounded">
                          {generatedKeys?.secretKey}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      Save your secret key securely! You won't be able to see it again.
                    </p>
                  </div>
                )}
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="label">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="input"
                  placeholder="Dr. Jane Smith"
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label htmlFor="email" className="label">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="you@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for email login and notifications
                </p>
              </div>

              {/* Password (Optional) */}
              {formData.email && (
                <>
                  <div>
                    <label htmlFor="password" className="label">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      placeholder="Min. 8 characters"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input"
                      placeholder="Confirm your password"
                    />
                  </div>
                </>
              )}

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
