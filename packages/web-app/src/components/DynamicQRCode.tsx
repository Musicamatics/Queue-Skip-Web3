import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode.react';
import { qrAPI } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from './LoadingSpinner';

interface DynamicQRCodeProps {
  passId: string;
  className?: string;
}

const DynamicQRCode: React.FC<DynamicQRCodeProps> = ({ passId, className = '' }) => {
  const [qrData, setQrData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { joinPass, leavePass } = useSocket();

  const loadQRCode = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await qrAPI.generateQR(passId);
      
      if (response.success && response.data?.qrCode?.currentCode?.data) {
        setQrData(response.data.qrCode.currentCode.data);
        setLastRefresh(new Date());
      } else {
        setError('Failed to generate QR code');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  }, [passId]);

  const refreshQRCode = useCallback(async () => {
    try {
      const response = await qrAPI.refreshQR(passId);
      
      if (response.success && response.data?.qrCode?.data) {
        setQrData(response.data.qrCode.data);
        setLastRefresh(new Date());
      }
    } catch (err: any) {
      console.error('Failed to refresh QR code:', err);
      // Don't show error for refresh failures, keep showing old QR
    }
  }, [passId]);

  // Join pass room for real-time updates
  useEffect(() => {
    joinPass(passId);
    
    return () => {
      leavePass(passId);
    };
  }, [passId, joinPass, leavePass]);

  // Handle real-time QR refresh via WebSocket
  useEffect(() => {
    const handleQRRefresh = (event: CustomEvent) => {
      if (event.detail.passId === passId) {
        setQrData(event.detail.newQRCode.data);
        setLastRefresh(new Date());
      }
    };

    window.addEventListener('qrRefresh', handleQRRefresh as EventListener);
    
    return () => {
      window.removeEventListener('qrRefresh', handleQRRefresh as EventListener);
    };
  }, [passId]);

  // Initial load and auto-refresh timer
  useEffect(() => {
    loadQRCode();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      refreshQRCode();
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [passId]); // Only depend on passId to prevent multiple intervals

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-red-600 text-center mb-4">{error}</div>
        <button
          onClick={loadQRCode}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-gray-500">No QR code available</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCode
          value={qrData}
          size={256}
          level="M"
          includeMargin={true}
        />
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Updates automatically every 30 seconds
        </div>
      </div>
    </div>
  );
};

export default DynamicQRCode;
