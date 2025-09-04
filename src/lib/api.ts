import axios from 'axios';
import { Tenant, Group, LetterRequest, LetterResponse, ApiResponse, ProposalDiscussion, LandlordVerification, LandlordProperty, Notification } from '../types';

// ngrok URL 자동 감지
const getApiBaseUrl = () => {
  // 개발 환경에서 ngrok URL 자동 감지
  if (import.meta.env.DEV && window.location.hostname.includes('ngrok')) {
    // ngrok 프론트엔드 URL에서 백엔드 URL 추정
    const frontendUrl = window.location.origin;
    const backendUrl = frontendUrl.replace(':3000', ':8891');
    return `${backendUrl}/api`;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8891';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tenantApi = {
  createTenant: async (tenant: Tenant): Promise<ApiResponse<string>> => {
    const response = await api.post('/tenants', tenant);
    return response.data;
  },
  
  getAllTenants: async (): Promise<ApiResponse<Tenant[]>> => {
    const response = await api.get('/tenants');
    return response.data;
  },
  
  getTenantById: async (id: string): Promise<ApiResponse<Tenant>> => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },
};

export const groupApi = {
  getGroups: async (scope: 'building' | 'neighborhood'): Promise<ApiResponse<Group[]>> => {
    const response = await api.get('/groups', {
      params: { scope }
    });
    return response.data;
  },
  
  getGroupPainPoints: async (groupId: string): Promise<ApiResponse<string[]>> => {
    const response = await api.get(`/groups/${groupId}/pain-points`);
    return response.data;
  },
  
  getGroupDiscussions: async (groupId: string): Promise<ApiResponse<ProposalDiscussion[]>> => {
    const response = await api.get(`/groups/${groupId}/discussions`);
    return response.data;
  },
};

export const letterApi = {
  generateLetter: async (request: LetterRequest): Promise<ApiResponse<LetterResponse>> => {
    const response = await api.post('/letters', request);
    return response.data;
  },
};

export const landlordApi = {
  submitVerification: async (verification: LandlordVerification): Promise<ApiResponse<LandlordVerification>> => {
    const response = await api.post('/landlords/verification', verification);
    return response.data;
  },
  
  getVerificationStatus: async (userId: string): Promise<ApiResponse<LandlordVerification>> => {
    const response = await api.get(`/landlords/verification/${userId}`);
    return response.data;
  },
  
  getProperties: async (landlordId: string): Promise<ApiResponse<LandlordProperty[]>> => {
    const response = await api.get(`/landlords/${landlordId}/properties`);
    return response.data;
  },
  
  addProperty: async (property: LandlordProperty): Promise<ApiResponse<LandlordProperty>> => {
    const response = await api.post('/landlords/properties', property);
    return response.data;
  },
  
  getProposalsForProperty: async (propertyId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/landlords/properties/${propertyId}/proposals`);
    return response.data;
  },
};

export const notificationApi = {
  getNotifications: async (userId: string): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  },
  
  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  markAllAsRead: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/notifications/${userId}/read-all`);
    return response.data;
  },
  
  getUnreadCount: async (userId: string): Promise<ApiResponse<number>> => {
    const response = await api.get(`/notifications/${userId}/unread-count`);
    return response.data;
  },
};