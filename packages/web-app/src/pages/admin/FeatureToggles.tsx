import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'social' | 'advanced';
}

const FeatureToggles: React.FC = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureFlag[]>([
    {
      key: 'passTransfer',
      name: 'Pass Transfers',
      description: 'Allow users to transfer passes to other users',
      enabled: true,
      category: 'core'
    },
    {
      key: 'communityForum',
      name: 'Community Forum',
      description: 'Enable community forum and donation requests',
      enabled: true,
      category: 'social'
    },
    {
      key: 'passExpiration',
      name: 'Pass Expiration',
      description: 'Automatically expire passes after validity period',
      enabled: true,
      category: 'core'
    },
    {
      key: 'governmentIdRequired',
      name: 'Government ID Required',
      description: 'Require government ID verification for registration',
      enabled: false,
      category: 'advanced'
    },
    {
      key: 'oneTimePasses',
      name: 'One-Time Passes',
      description: 'Allow creation of single-use passes',
      enabled: true,
      category: 'core'
    },
    {
      key: 'surveyRequired',
      name: 'Optional Usage Survey',
      description: 'Show optional time slot survey to help users predict queue times',
      enabled: true,
      category: 'advanced'
    },
    {
      key: 'usagePredictions',
      name: 'Usage Predictions',
      description: 'Show AI-powered usage predictions and analytics',
      enabled: true,
      category: 'advanced'
    },
    {
      key: 'allowAutoRegistration',
      name: 'Auto-Registration on Sign-In',
      description: 'Allow new users to automatically register when they sign in. If disabled, only pre-existing users can access the system.',
      enabled: true,
      category: 'core'
    },
    {
      key: 'blockchainIntegration',
      name: 'Blockchain Integration',
      description: 'Enable NFT minting and blockchain transactions',
      enabled: false,
      category: 'advanced'
    },
    {
      key: 'appleWalletIntegration',
      name: 'Apple Wallet Integration',
      description: 'Allow passes to be added to Apple Wallet',
      enabled: false,
      category: 'advanced'
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleFeature = (key: string) => {
    setFeatures(features.map(feature => 
      feature.key === key 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Toggles</h1>
          <p className="text-gray-600">Enable or disable features for {user?.venueId}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary flex items-center"
        >
          {loading && <LoadingSpinner size="sm" className="mr-2" />}
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Feature settings saved successfully!
        </div>
      )}

      {/* Feature Categories */}
      <div className="space-y-6">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category} className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(category)} mr-3`}>
                  {category.toUpperCase()}
                </span>
                <h3 className="text-lg font-medium text-gray-900 capitalize">{category} Features</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {categoryFeatures.map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900">{feature.name}</h4>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs rounded-full ${
                          feature.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feature.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleFeature(feature.key)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          feature.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                            feature.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Impact Warning */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Feature Impact Notice</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Disabling core features may affect user experience. Advanced features like blockchain integration 
                may require additional setup and configuration. Changes take effect immediately after saving.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {features.filter(f => f.enabled).length}
          </div>
          <div className="text-sm text-gray-500">Features Enabled</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600">
            {features.filter(f => !f.enabled).length}
          </div>
          <div className="text-sm text-gray-500">Features Disabled</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {features.length}
          </div>
          <div className="text-sm text-gray-500">Total Features</div>
        </div>
      </div>
    </div>
  );
};

export default FeatureToggles;
