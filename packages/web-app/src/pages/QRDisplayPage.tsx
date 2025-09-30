import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { passAPI } from '../utils/api';
import DynamicQRCode from '../components/DynamicQRCode';
import LoadingSpinner from '../components/LoadingSpinner';

const QRDisplayPage: React.FC = () => {
  const { passId } = useParams<{ passId: string }>();
  const { } = useAuth();
  const [pass, setPass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (passId) {
      loadPass();
    }
  }, [passId]);

  const loadPass = async () => {
    if (!passId) return;
    
    try {
      setLoading(true);
      const response = await passAPI.getPass(passId);
      if (response.success && response.data) {
        setPass(response.data.pass);
      } else {
        setError('Pass not found or access denied');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load pass');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Pass</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/passes" className="btn btn-primary">
          Back to My Passes
        </Link>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Pass Not Found</h3>
        <p className="text-gray-600 mb-6">The requested pass could not be found.</p>
        <Link to="/passes" className="btn btn-primary">
          Back to My Passes
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Link to="/passes" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to My Passes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Queue Skip Pass</h1>
        <p className="text-gray-600">Present this QR code to staff for validation</p>
      </div>

      {/* Pass Details */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Pass #{pass.id.slice(-8)}</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Type:</strong> {pass.passType?.name || pass.type}</p>
              <p><strong>Venue:</strong> {pass.venue?.name || pass.venueId}</p>
              <p><strong>Valid from:</strong> {new Date(pass.validFrom).toLocaleString()}</p>
              <p><strong>Valid until:</strong> {new Date(pass.validUntil).toLocaleString()}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pass.status)}`}>
            {pass.status}
          </span>
        </div>

        {pass.status === 'active' ? (
          <div className="text-center">
            <DynamicQRCode passId={pass.id} className="mx-auto" />
            
            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">How to Use</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>1. Show this QR code to venue staff</li>
                <li>2. Staff will scan the code for validation</li>
                <li>3. QR code refreshes every 30 seconds automatically</li>
                <li>4. Pass can only be used once</li>
              </ul>
            </div>

            {/* Apple Wallet Option */}
            <div className="mt-6">
              <button className="btn btn-secondary w-full">
                Add to Apple Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pass Not Available</h3>
            <p className="text-gray-600">
              This pass is {pass.status} and cannot be used for queue skipping.
            </p>
          </div>
        )}

        {/* Blockchain Info */}
        {pass.blockchainTxHash && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-xs text-gray-500">
              <strong>Blockchain Transaction:</strong> {pass.blockchainTxHash}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Mode */}
      {pass.status === 'active' && (
        <div className="text-center">
          <button
            onClick={() => {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              }
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            🔍 View in Full Screen
          </button>
        </div>
      )}
    </div>
  );
};

export default QRDisplayPage;
