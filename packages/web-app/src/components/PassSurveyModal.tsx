import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface TimeSlot {
  id: string;
  label: string;
  time: string;
  period: 'rush' | 'off-peak';
  duration: number; // in minutes
}

interface PassSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (timeSlot: string | null) => void;
  onSkip: () => void;
  loading?: boolean;
  venueId: string;
  passId?: string;
}

const PassSurveyModal: React.FC<PassSurveyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
  loading = false,
  venueId,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Generate time slots for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const timeSlots: TimeSlot[] = [
    // Morning rush hour (30-min slots)
    { id: '08:00', label: '8:00 - 8:30 AM', time: '08:00', period: 'rush', duration: 30 },
    { id: '08:30', label: '8:30 - 9:00 AM', time: '08:30', period: 'rush', duration: 30 },
    { id: '09:00', label: '9:00 - 9:30 AM', time: '09:00', period: 'rush', duration: 30 },
    { id: '09:30', label: '9:30 - 10:00 AM', time: '09:30', period: 'rush', duration: 30 },
    
    // Mid-day off-peak (1-hour slots)
    { id: '10:00', label: '10:00 - 11:00 AM', time: '10:00', period: 'off-peak', duration: 60 },
    { id: '11:00', label: '11:00 AM - 12:00 PM', time: '11:00', period: 'off-peak', duration: 60 },
    { id: '12:00', label: '12:00 - 1:00 PM', time: '12:00', period: 'off-peak', duration: 60 },
    { id: '13:00', label: '1:00 - 2:00 PM', time: '13:00', period: 'off-peak', duration: 60 },
    { id: '14:00', label: '2:00 - 3:00 PM', time: '14:00', period: 'off-peak', duration: 60 },
    { id: '15:00', label: '3:00 - 4:00 PM', time: '15:00', period: 'off-peak', duration: 60 },
    { id: '16:00', label: '4:00 - 5:00 PM', time: '16:00', period: 'off-peak', duration: 60 },
    
    // Evening rush hour (30-min slots)
    { id: '17:00', label: '5:00 - 5:30 PM', time: '17:00', period: 'rush', duration: 30 },
    { id: '17:30', label: '5:30 - 6:00 PM', time: '17:30', period: 'rush', duration: 30 },
    { id: '18:00', label: '6:00 - 6:30 PM', time: '18:00', period: 'rush', duration: 30 },
    { id: '18:30', label: '6:30 - 7:00 PM', time: '18:30', period: 'rush', duration: 30 },
    { id: '19:00', label: '7:00 - 7:30 PM', time: '19:00', period: 'rush', duration: 30 },
  ];

  const handleSubmit = () => {
    onSubmit(selectedSlot);
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">When will you visit?</h2>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Optional:</strong> Share your visit time to help everyone see busy periods
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">📊 Help Everyone Plan Better</p>
                <p>Sharing your visit time creates real-time crowd predictions. Everyone benefits from knowing the busiest times. Completely anonymous!</p>
              </div>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select your intended time for {tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  disabled={loading}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedSlot === slot.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{slot.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {slot.period === 'rush' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            Rush Hour • {slot.duration} min slot
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Off-Peak • {slot.duration} min slot
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedSlot === slot.id && (
                      <svg className="w-6 h-6 text-blue-500 ml-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={loading}
              className="flex-1 btn btn-secondary"
            >
              Skip Survey
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedSlot}
              className="flex-1 btn btn-primary flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit & Continue'
              )}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            💡 <strong>Tip:</strong> Skip if you're not sure yet. You'll still get your passes!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PassSurveyModal;
