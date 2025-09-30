import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@queue-skip/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: async (method: string, credentials: any): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/auth/login', {
      method,
      ...credentials,
    });
    return response.data;
  },

  register: async (userData: any): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/auth/logout');
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};

export const passAPI = {
  getUserPasses: async (venueId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/passes?venueId=${venueId}`);
    return response.data;
  },

  allocatePasses: async (venueId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/passes/allocate', {
      venueId,
    });
    return response.data;
  },

  transferPass: async (passId: string, toUserId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/passes/${passId}/transfer`, {
      toUserId,
    });
    return response.data;
  },

  getPass: async (passId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/passes/${passId}`);
    return response.data;
  },
};

export const qrAPI = {
  generateQR: async (passId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/qr/${passId}/generate`);
    return response.data;
  },

  refreshQR: async (passId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/qr/${passId}/refresh`);
    return response.data;
  },

  validateQR: async (qrData: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/qr/validate', {
      qrData,
    });
    return response.data;
  },
};

export const venueAPI = {
  getVenues: async (): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get('/venues');
    return response.data;
  },

  getVenue: async (venueId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/venues/${venueId}`);
    return response.data;
  },
};

export const communityAPI = {
  getDonationRequests: async (venueId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/community/donations/${venueId}`);
    return response.data;
  },

  createDonationRequest: async (venueId: string, reason: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/community/donations', {
      venueId,
      reason,
    });
    return response.data;
  },

  upvoteDonation: async (donationId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/community/donations/${donationId}/upvote`);
    return response.data;
  },
};

export const blockchainAPI = {
  getStatus: async (): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get('/blockchain/status');
    return response.data;
  },

  connectWallet: async (walletType: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/blockchain/connect', {
      walletType,
    });
    return response.data;
  },

  getTransactionHistory: async (passId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/blockchain/transactions/${passId}`);
    return response.data;
  },
};

export const predictionsAPI = {
  getPredictions: async (venueId: string, date?: string): Promise<ApiResponse<any>> => {
    const url = date 
      ? `/predictions/${venueId}?date=${date}`
      : `/predictions/${venueId}`;
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(url);
    return response.data;
  },

  submitSurvey: async (venueId: string, timeSlot: string, passId?: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/predictions/survey', {
      venueId,
      timeSlot,
      passId,
    });
    return response.data;
  },

  resetPredictions: async (venueId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.delete(`/predictions/${venueId}/reset`);
    return response.data;
  },
};

export default apiClient;
