import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const VenueSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    venueName: 'HKU Station',
    timezone: 'Asia/Hong_Kong',
    operatingHours: {
      start: '06:00',
      end: '23:00'
    },
    capacity: 500,
    registrationMode: 'open', // 'open' | 'admin_only'
    allowPassTransfer: true,
    requireSurvey: true,
    autoExpiration: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Venue Settings</h1>
        <p className="text-gray-600">Configure venue preferences and policies</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Settings saved successfully!
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
              <input
                type="text"
                value={settings.venueName}
                onChange={(e) => setSettings({...settings, venueName: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                className="input"
              >
                <option value="Asia/Hong_Kong">Hong Kong</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">New York</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours Start</label>
              <input
                type="time"
                value={settings.operatingHours.start}
                onChange={(e) => setSettings({
                  ...settings, 
                  operatingHours: {...settings.operatingHours, start: e.target.value}
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours End</label>
              <input
                type="time"
                value={settings.operatingHours.end}
                onChange={(e) => setSettings({
                  ...settings, 
                  operatingHours: {...settings.operatingHours, end: e.target.value}
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Capacity</label>
              <input
                type="number"
                value={settings.capacity}
                onChange={(e) => setSettings({...settings, capacity: parseInt(e.target.value)})}
                className="input"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Access Control</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Mode</label>
              <select
                value={settings.registrationMode}
                onChange={(e) => setSettings({...settings, registrationMode: e.target.value})}
                className="input"
              >
                <option value="open">Open Registration - Anyone can sign up</option>
                <option value="admin_only">Admin Only - Users must be added by admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {settings.registrationMode === 'open' 
                  ? 'Users can register themselves during login'
                  : 'Only administrators can add new users to the system'
                }
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Feature Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowPassTransfer"
                checked={settings.allowPassTransfer}
                onChange={(e) => setSettings({...settings, allowPassTransfer: e.target.checked})}
                className="rounded border-gray-300 mr-3"
              />
              <label htmlFor="allowPassTransfer" className="text-sm font-medium text-gray-700">
                Allow Pass Transfers
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireSurvey"
                checked={settings.requireSurvey}
                onChange={(e) => setSettings({...settings, requireSurvey: e.target.checked})}
                className="rounded border-gray-300 mr-3"
              />
              <label htmlFor="requireSurvey" className="text-sm font-medium text-gray-700">
                Require Survey Before Pass Usage
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoExpiration"
                checked={settings.autoExpiration}
                onChange={(e) => setSettings({...settings, autoExpiration: e.target.checked})}
                className="rounded border-gray-300 mr-3"
              />
              <label htmlFor="autoExpiration" className="text-sm font-medium text-gray-700">
                Enable Automatic Pass Expiration
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueSettings;
