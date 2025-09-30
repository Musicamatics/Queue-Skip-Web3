import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { communityAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReason, setNewReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.venueId) {
      loadDonations();
    }
  }, [user]);

  const loadDonations = async () => {
    if (!user?.venueId) return;
    
    try {
      setLoading(true);
      const response = await communityAPI.getDonationRequests(user.venueId);
      if (response.success && response.data) {
        setDonations(response.data.donations || []);
      }
    } catch (error) {
      console.error('Failed to load donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.venueId || !newReason.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await communityAPI.createDonationRequest(user.venueId, newReason);
      if (response.success) {
        setNewReason('');
        setShowCreateForm(false);
        await loadDonations();
      }
    } catch (error) {
      console.error('Failed to create donation request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (donationId: string) => {
    try {
      const response = await communityAPI.upvoteDonation(donationId);
      if (response.success) {
        await loadDonations(); // Reload to show updated upvotes
      }
    } catch (error) {
      console.error('Failed to upvote donation:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600 mt-2">
            Request pass donations from the community when you need them.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          Request Donation
        </button>
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <div className="card">
          <form onSubmit={handleCreateRequest}>
            <h3 className="text-lg font-semibold mb-4">Request Pass Donation</h3>
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for request
              </label>
              <textarea
                id="reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Please explain why you need a pass donation..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !newReason.trim()}
                className="btn btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Donation Requests */}
      {donations.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donation requests</h3>
          <p className="text-gray-600 mb-6">
            Be the first to request a pass donation from the community.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600">
                      {donation.user?.email || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      donation.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {donation.status}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-3">{donation.reason}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleUpvote(donation.id)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{donation.upvotes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Guidelines */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Community Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be respectful and honest in your donation requests</li>
          <li>• Provide clear reasons for why you need a pass</li>
          <li>• Upvote requests you think deserve community support</li>
          <li>• Remember that donations are voluntary and depend on venue policies</li>
        </ul>
      </div>
    </div>
  );
};

export default CommunityPage;
