import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { venueAPI, predictionsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);

  useEffect(() => {
    loadVenues();
    loadPredictions();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const response = await venueAPI.getVenues();
      if (response.success && response.data) {
        setVenues(response.data.venues || []);
      }
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    try {
      setPredictionsLoading(true);
      // Load predictions for HKU Station (default venue)
      const response = await predictionsAPI.getPredictions('venue-hku-station');
      if (response.success && response.data) {
        const { predictions: allPredictions } = response.data;
        
        // Get top 3 busiest time slots
        const topPredictions = [...allPredictions]
          .sort((a: any, b: any) => b.expectedPasses - a.expectedPasses)
          .slice(0, 3)
          .map((p: any) => ({
            timeSlot: p.timeSlot,
            expectedPasses: p.expectedPasses,
            venue: 'HKU Station',
            date: p.date,
          }));
        
        setPredictions(topPredictions);
      }
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setPredictionsLoading(false);
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
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Skip the Queue with Web3
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get dynamic QR codes that refresh every 30 seconds, transfer passes to friends, 
          and enjoy blockchain transparency for all transactions.
        </p>
        
        {user ? (
          <Link to="/passes" className="btn btn-primary text-lg px-8 py-3">
            View My Passes
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01m-5.01 0h.01m0 0h-4.01M16 8h4M4 16h4m0 0h-.01M4 20h4m0 0h.01m-.01 0h.01M4 8h4m0 0h-.01M4 4h4m0 0h-.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Dynamic QR Codes</h3>
          <p className="text-gray-600">
            QR codes refresh every 30 seconds to prevent screenshots and ensure security.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Pass Transfers</h3>
          <p className="text-gray-600">
            Transfer unused passes to friends when venues allow it.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Blockchain Transparency</h3>
          <p className="text-gray-600">
            All pass allocations, transfers, and redemptions recorded on Solana.
          </p>
        </div>
      </div>

      {/* Queue Predictions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Tomorrow's Queue Predictions</h2>
          {predictionsLoading && <LoadingSpinner size="sm" />}
        </div>
        
        {predictions.length > 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Top 3 busiest time slots based on user surveys (anonymous data)
            </p>
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-orange-400">
                  <div>
                    <div className="flex items-center">
                      <span className="font-semibold text-lg">{prediction.timeSlot}</span>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        #{index + 1} Busiest
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm">{prediction.venue}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {prediction.expectedPasses}
                    </div>
                    <div className="text-xs text-gray-500">expected passes</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              💡 Help improve predictions! When you get a pass, tell us when you'll use it.
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No prediction data available yet.</p>
            <p className="text-sm mt-2">Be the first to contribute by completing the usage survey when getting a pass!</p>
          </div>
        )}
      </div>

      {/* Available Venues */}
      {venues.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Available Venues</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {venues.map((venue) => (
              <div key={venue.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{venue.name}</h3>
                <p className="text-gray-600 mb-2">{venue.address}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {venue.type}
                  </span>
                  {user && (
                    <Link 
                      to="/passes" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Get Passes →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
