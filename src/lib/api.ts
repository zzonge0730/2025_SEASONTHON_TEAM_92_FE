import axios from 'axios';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8891'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  register: async (userData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const locationApi = {
  verifyLocation: async (payload: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/location/verify', payload);
    return response.data;
  },
};

// ... other api objects ...

export const diagnosisApi = {
  submitBulk: async (responses: any[]): Promise<ApiResponse<string>> => {
    const response = await api.post('/diagnoses/bulk', responses);
    return response.data;
  },
  getComparisonStats: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/diagnoses/comparison/${userId}`);
    return response.data;
  },
};

export const reportApi = {
  getAdvancedReport: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/reports/advanced/${userId}`);
    return response.data;
  },
};

export const groupApi = {
  getGroups: async (scope: 'building' | 'neighborhood' = 'building'): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/groups?scope=${scope}`);
    return response.data;
  },
};

export const tenantApi = {
  createTenant: async (tenantData: any): Promise<ApiResponse<string>> => {
    const response = await api.post('/tenants', tenantData);
    return response.data;
  },
  getAllTenants: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/tenants');
    return response.data;
  },
  getTenantById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },
};

export const letterApi = {
  generateLetter: async (request: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/letters', request);
    return response.data;
  },
};

export const landlordApi = {
  // Add landlord-specific API calls here
  getLandlordData: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/landlord/data');
    return response.data;
  },
};

export const notificationApi = {
  // Add notification-specific API calls here
  getNotifications: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id: string): Promise<ApiResponse<string>> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
};

export const infoCardApi = {
  getAllCards: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/info-cards');
    return response.data;
  },
  createCard: async (cardData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/info-cards', cardData);
    return response.data;
  },
  updateCard: async (id: string, cardData: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/admin/info-cards/${id}`, cardData);
    return response.data;
  },
  deleteCard: async (id: string): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/admin/info-cards/${id}`);
    return response.data;
  },
};
