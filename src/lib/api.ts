import axios from 'axios';
import { Tenant, Group, LetterRequest, LetterResponse, ApiResponse } from '../types';

// ngrok URL 자동 감지
const getApiBaseUrl = () => {
  // 개발 환경에서 ngrok URL 자동 감지
  if (import.meta.env.DEV && window.location.hostname.includes('ngrok')) {
    // ngrok 프론트엔드 URL에서 백엔드 URL 추정
    const frontendUrl = window.location.origin;
    const backendUrl = frontendUrl.replace(':3000', ':8891');
    return `${backendUrl}/api`;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8891/api';
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
};

export const letterApi = {
  generateLetter: async (request: LetterRequest): Promise<ApiResponse<LetterResponse>> => {
    const response = await api.post('/letters', request);
    return response.data;
  },
};