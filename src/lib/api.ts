import axios from 'axios';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8891', // 로컬 개발용
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰을 자동으로 헤더에 추가하는 인터셉터
api.interceptors.request.use((config) => {
  console.log('🚀 API 요청 시작:', config.method?.toUpperCase(), config.url);
  console.log('📤 요청 데이터:', config.data);
  console.log('🌐 Base URL:', config.baseURL);
  
  const token = localStorage.getItem('jwtToken');
  
  // JWT 토큰이 필요하지 않은 엔드포인트들
  const noAuthEndpoints = ['/api/auth/register', '/api/auth/login', '/api/location/verify'];
  const needsAuth = !noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (needsAuth) {
      console.log('🔑 JWT 토큰이 요청 헤더에 추가됨:', config.url);
      console.log('🎫 토큰 미리보기:', token.substring(0, 50) + '...');
    }
  } else if (needsAuth) {
    console.log('❌ JWT 토큰이 없음:', config.url);
  }
  return config;
});

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답 성공:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API 응답 에러:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (userData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  login: async (credentials: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  updateUser: async (userData: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/api/auth/update', userData);
    return response.data;
  },
  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export const locationApi = {
  verifyLocation: async (payload: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/location/verify', payload);
    return response.data;
  },
};

// ... other api objects ...

export const diagnosisApi = {
  submitBulk: async (responses: any[]): Promise<ApiResponse<string>> => {
    const response = await api.post('/api/diagnoses/bulk', responses);
    return response.data;
  },
  getComparisonStats: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/diagnoses/comparison/${userId}`);
    return response.data;
  },
};

export const reportApi = {
  getAdvancedReport: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/reports/advanced/${userId}`);
    return response.data;
  },
  getNegotiationCards: async (userId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/api/reports/negotiation-cards/${userId}`);
    return response.data;
  },
  getNegotiationScenario: async (userId: string): Promise<ApiResponse<string>> => {
    const response = await api.get(`/api/reports/negotiation-scenario/${userId}`);
    return response.data;
  },
  getNegotiationSuccessRate: async (userId: string): Promise<ApiResponse<number>> => {
    const response = await api.get(`/api/reports/success-rate/${userId}`);
    return response.data;
  },
};

export const groupApi = {
  getGroups: async (scope: 'building' | 'neighborhood' = 'building'): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/api/groups?scope=${scope}`);
    return response.data;
  },
  getGroupPainPoints: async (groupId: string): Promise<ApiResponse<string[]>> => {
    const response = await api.get(`/api/groups/${groupId}/pain-points`);
    return response.data;
  },
  getGroupDiscussions: async (groupId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/api/groups/${groupId}/discussions`);
    return response.data;
  },
};

export const tenantApi = {
  createTenant: async (tenantData: any): Promise<ApiResponse<string>> => {
    const response = await api.post('/api/tenants', tenantData);
    return response.data;
  },
  getAllTenants: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/tenants');
    return response.data;
  },
  getTenantById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/tenants/${id}`);
    return response.data;
  },
};

export const letterApi = {
  generateLetter: async (request: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/letters', request);
    return response.data;
  },
};

export const landlordApi = {
  // Add landlord-specific API calls here
  getLandlordData: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/landlord/data');
    return response.data;
  },
  getProperties: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/landlord/properties');
    return response.data;
  },
  submitVerification: async (verification: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/landlord/verification', verification);
    return response.data;
  },
};

export const notificationApi = {
  // Add notification-specific API calls here
  getNotifications: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/notifications');
    return response.data;
  },
  markAsRead: async (id: string): Promise<ApiResponse<string>> => {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (): Promise<ApiResponse<string>> => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },
};

export const infoCardApi = {
  getAllCards: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/info-cards');
    return response.data;
  },
  createCard: async (cardData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/admin/info-cards', cardData);
    return response.data;
  },
  updateCard: async (id: string, cardData: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/admin/info-cards/${id}`, cardData);
    return response.data;
  },
  deleteCard: async (id: string): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/api/admin/info-cards/${id}`);
    return response.data;
  },
};
