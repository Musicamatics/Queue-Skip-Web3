import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { passAPI, predictionsAPI } from '../utils/api';
import DynamicQRCode from '../components/DynamicQRCode';
import LoadingSpinner from '../components/LoadingSpinner';
import PassSurveyModal from '../components/PassSurveyModal';

const PassesPage: React.FC = () => {
  const { user } = useAuth();
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSelectedPass] = useState<string | null>(null);
  const [transferUserId, setTransferUserId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [allocatingPasses, setAllocatingPasses] = useState(false);

  useEffect(() => {
    if (user?.venueId) {
      loadPasses();
    }
  }, [user]);

  const loadPasses = async () => {
    if (!user?.venueId) return;
    
    try {
      setLoading(true);
      const response = await passAPI.getUserPasses(user.venueId);
      if (response.success && response.data) {
        setPasses(response.data.passes || []);
      }
    } catch (error) {
      console.error('Failed to load passes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocatePasses = async () => {
    if (!user?.venueId) return;
    
    // Show survey modal (user can skip it)
    setShowSurvey(true);
  };

  const handleSurveySubmit = async (timeSlot: string | null) => {
    if (!user?.venueId) return;
    
    try {
      setAllocatingPasses(true);
      setSurveyLoading(true);

      // Submit survey if user selected a time slot
      if (timeSlot) {
        await predictionsAPI.submitSurvey(user.venueId, timeSlot);
      }

      // Allocate passes
      const response = await passAPI.allocatePasses(user.venueId);
      if (response.success) {
        setShowSurvey(false);
        await loadPasses(); // Reload passes
      }
    } catch (error) {
      console.error('Failed to allocate passes:', error);
    } finally {
      setAllocatingPasses(false);
      setSurveyLoading(false);
    }
  };

  const handleSurveySkip = async () => {
    if (!user?.venueId) return;
    
    try {
      setAllocatingPasses(true);
      
      // Just allocate passes without survey
      const response = await passAPI.allocatePasses(user.venueId);
      if (response.success) {
        setShowSurvey(false);
        await loadPasses(); // Reload passes
      }
    } catch (error) {
      console.error('Failed to allocate passes:', error);
    } finally {
      setAllocatingPasses(false);
    }
  };

  const handleTransferPass = async (passId: string) => {
    if (!transferUserId.trim()) return;
    
    try {
      setTransferLoading(true);
      const response = await passAPI.transferPass(passId, transferUserId);
      if (response.success) {
        setTransferUserId('');
        setSelectedPass(null);
        await loadPasses(); // Reload passes
      }
    } catch (error) {
      console.error('Failed to transfer pass:', error);
    } finally {
      setTransferLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Passes</h1>
          <p className="text-gray-600 mt-2">
            Venue: {user?.venueId?.replace('venue-', '').replace('-', ' ') || 'Unknown'}
          </p>
        </div>
        <button
          onClick={handleAllocatePasses}
          disabled={loading || allocatingPasses}
          className="btn btn-primary flex items-center"
        >
          {allocatingPasses ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Getting Passes...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Plan Your Visit
            </>
          )}
        </button>
      </div>

      {/* Survey Modal */}
      <PassSurveyModal
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        onSubmit={handleSurveySubmit}
        onSkip={handleSurveySkip}
        loading={surveyLoading}
        venueId={user?.venueId || ''}
      />

      {passes.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No passes yet</h3>
          <p className="text-gray-600 mb-6">
            Get your daily passes and optionally share when you'll use them to help everyone plan better.
          </p>
          <button
            onClick={handleAllocatePasses}
            className="btn btn-primary flex items-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Get Daily Passes
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {passes.map((pass) => (
            <div key={pass.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Pass #{pass.id.slice(-8)}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Type: {pass.type}</p>
                    <p>Valid from: {new Date(pass.validFrom).toLocaleString()}</p>
                    <p>Valid until: {new Date(pass.validUntil).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pass.status)}`}>
                  {pass.status}
                </span>
              </div>

              {pass.status === 'active' && (
                <div className="border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* QR Code Display */}
                    <div>
                      <h4 className="font-medium mb-3">Dynamic QR Code</h4>
                      <DynamicQRCode passId={pass.id} />
                    </div>

                    {/* Pass Actions */}
                    <div>
                      <h4 className="font-medium mb-3">Actions</h4>
                      <div className="space-y-4">
                        {/* Transfer Pass */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transfer to User ID
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={transferUserId}
                              onChange={(e) => setTransferUserId(e.target.value)}
                              placeholder="user-test-employee"
                              className="input flex-1 text-sm"
                            />
                            <button
                              onClick={() => handleTransferPass(pass.id)}
                              disabled={!transferUserId.trim() || transferLoading}
                              className="btn btn-secondary text-sm"
                            >
                              {transferLoading ? 'Transferring...' : 'Transfer'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Test with: user-test-employee or user-test-visitor
                          </p>
                        </div>

                        {/* Apple Wallet */}
                        <button className="btn btn-secondary w-full text-sm">
                          Add to Apple Wallet
                        </button>

                        {/* Blockchain Info */}
                        {pass.blockchainTxHash && (
                          <div className="text-xs text-gray-500">
                            Blockchain TX: {pass.blockchainTxHash.slice(0, 16)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pass.status === 'used' && (
                <div className="border-t pt-4 text-center text-gray-500">
                  <p>This pass has been redeemed and cannot be used again.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PassesPage;
