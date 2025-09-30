import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import WalletConnect from '../components/WalletConnect';

const LoginPage: React.FC = () => {
  const [method, setMethod] = useState<string>('email');
  const [email, setEmail] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [web3Address, setWeb3Address] = useState('');
  const [ssoToken, setSsoToken] = useState('');
  const [venueId, setVenueId] = useState('venue-hku-station');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials: any = { venueId, isAdmin: isAdminLogin };
      
      switch (method) {
        case 'email':
          credentials.email = email;
          break;
        case 'government_id':
          credentials.governmentId = governmentId;
          break;
        case 'web3_wallet':
          credentials.web3Address = web3Address;
          break;
        case 'sso':
          credentials.ssoToken = ssoToken;
          break;
      }

      await login(method, credentials);
      
      // Navigate based on admin status
      if (isAdminLogin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/passes');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Login failed';
      
      // Special handling for admin login failures
      if (isAdminLogin && errorMessage.includes('Insufficient permissions')) {
        setError('You are not an admin! Please use regular sign-in or contact an administrator.');
        setIsAdminLogin(false); // Switch back to regular login mode
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">QS</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isAdminLogin ? 'Admin Sign In' : 'Sign in to Queue Skip'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isAdminLogin 
              ? 'Sign in with your administrator credentials' 
              : 'New users are automatically registered on first sign-in'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Venue Selection */}
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
              Select Venue
            </label>
            <select
              id="venue"
              value={venueId}
              onChange={(e) => {
                const newVenueId = e.target.value;
                setVenueId(newVenueId);
                // Auto-select Web3 for Commercial Building
                if (newVenueId === 'venue-commercial-building') {
                  setMethod('web3_wallet');
                }
              }}
              className="input"
              required
            >
              <option value="venue-hku-station">HKU Station</option>
              <option value="venue-commercial-building">Central Commercial Building</option>
            </select>
          </div>

          {/* Authentication Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authentication Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const allMethods = [
                  { value: 'email', label: 'Email', icon: '📧' },
                  { value: 'government_id', label: 'Gov ID', icon: '🆔' },
                  { value: 'web3_wallet', label: 'Web3', icon: '🔗' },
                  { value: 'sso', label: 'SSO', icon: '🏢' },
                ];
                
                // Restrict Commercial Building to Web3 only
                const availableMethods = venueId === 'venue-commercial-building' 
                  ? allMethods.filter(m => m.value === 'web3_wallet')
                  : allMethods;
                
                return availableMethods.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMethod(option.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      method === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ));
              })()}
            </div>
            {venueId === 'venue-commercial-building' && (
              <p className="text-xs text-blue-600 mt-2">
                ℹ️ This venue requires Web3 wallet authentication | New wallets auto-register
              </p>
            )}
          </div>

          {/* Dynamic Input Fields */}
          <div className="space-y-4">
            {method === 'email' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="student@hku.hk"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Test existing: student@hku.hk | Try any email to auto-register
                </p>
              </div>
            )}

            {method === 'government_id' && (
              <div>
                <label htmlFor="governmentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID
                </label>
                <input
                  id="governmentId"
                  type="text"
                  value={governmentId}
                  onChange={(e) => setGovernmentId(e.target.value)}
                  className="input"
                  placeholder="HK123456789"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Test existing: HK123456789 | Try any ID to auto-register
                </p>
              </div>
            )}

            {method === 'web3_wallet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connect Web3 Wallet
                </label>
                <WalletConnect
                  onConnect={(address) => setWeb3Address(address)}
                  onError={(error) => setError(error)}
                  disabled={loading}
                />
                {web3Address && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <strong>Connected:</strong> {web3Address.slice(0, 6)}...{web3Address.slice(-4)}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  New wallets are automatically registered on first connect
                </p>
              </div>
            )}

            {method === 'sso' && (
              <div>
                <label htmlFor="ssoToken" className="block text-sm font-medium text-gray-700 mb-2">
                  SSO Token
                </label>
                <input
                  id="ssoToken"
                  type="text"
                  value={ssoToken}
                  onChange={(e) => setSsoToken(e.target.value)}
                  className="input"
                  placeholder="hku-sso-123"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Test existing: hku-sso-123 | Try any token to auto-register
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="text-center space-y-2">
            {!isAdminLogin && (
              <div>
                <button
                  type="button"
                  onClick={() => setIsAdminLogin(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Are you an administrator?
                </button>
              </div>
            )}
            {isAdminLogin && (
              <div>
                <button
                  type="button"
                  onClick={() => setIsAdminLogin(false)}
                  className="text-gray-600 hover:text-gray-800 text-sm underline"
                >
                  ← Back to regular sign in
                </button>
              </div>
            )}
            <div>
              <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
                ← Back to home
              </Link>
            </div>
          </div>
        </form>

        {/* Demo Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">✨ Auto-Registration Enabled</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>New Users:</strong> Just sign in! Your account will be created automatically</p>
            <p><strong>All Methods Supported:</strong> Email, Gov ID, SSO, or Web3 Wallet</p>
            <p><strong>Existing Users:</strong> Use your credentials to sign in as normal</p>
            <p className="mt-2 pt-2 border-t border-blue-200">
              💡 Admins can disable auto-registration in venue settings if needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
