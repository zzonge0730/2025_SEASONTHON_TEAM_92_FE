import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'https://www.jinwook.shop';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// JWT 토큰을 자동으로 헤더에 추가하는 인터셉터
api.interceptors.request.use((config) => {
  console.log('🚀 API 요청 시작:', config.method?.toUpperCase(), config.url);
  console.log('📤 요청 데이터:', config.data);
  console.log('🌐 Base URL:', config.baseURL);
  
  const token = localStorage.getItem('jwtToken');
  
  const noAuthEndpoints = ['/member/create', '/member/doLogin'];
  const needsAuth = !noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (needsAuth) {
      console.log('🔑 JWT 토큰이 요청 헤더에 추가됨:', config.url);
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

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  ok: boolean;
  data: T | null;
  message: string;
}

// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'tenant' | 'landlord' | 'admin' | 'anonymous';
  address?: string;
  buildingName?: string;
  neighborhood?: string;
  profileCompleted?: boolean;
  diagnosisCompleted?: boolean;
  onboardingCompleted?: boolean;
}

// 인증 API
export const authApi = {
  register: async (userData: any): Promise<ApiResponse<User>> => {
    const response = await api.post('/member/create', userData);
    return response.data;
  },
  
  login: async (credentials: any): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/member/doLogin', credentials);
    return response.data;
  },
  
  // updateUser: async (userData: any): Promise<ApiResponse<User>> => {
  //   const response = await api.put('/api/auth/update', userData);
  //   return response.data;
  // },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/member/profile');
    return response.data;
  },
};

// // 위치 API (team_backend에 미구현)
// export const locationApi = {
//   verifyLocation: async (payload: any): Promise<ApiResponse<any>> => {
//     const response = await api.post('/api/location/verify', payload);
//     return response.data;
//   },
// };

// // 그룹 API (team_backend에 미구현)
// export const groupApi = {
//   getGroups: async (scope: 'building' | 'neighborhood'): Promise<ApiResponse<any[]>> => {
//     const response = await api.get(`/api/groups?scope=${scope}`);
//     return response.data;
//   },
//   
//   createGroup: async (groupData: any): Promise<ApiResponse<any>> => {
//     const response = await api.post('/api/groups', groupData);
//     return response.data;
//   },
//   
//   joinGroup: async (groupId: string): Promise<ApiResponse<any>> => {
//     const response = await api.post(`/api/groups/${groupId}/join`);
//     return response.data;
//   },
// };

// 진단 API
export const diagnosisApi = {
  submitDiagnosis: async (diagnosisData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/v1/diagnosis/responses', diagnosisData);
    return response.data;
  },
  
  getDiagnosisResult: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/v1/diagnosis/result');
    return response.data;
  },
};

// // 리포트 API (team_backend에 미구현)
// export const reportApi = {
//   generateReport: async (): Promise<ApiResponse<any>> => {
//     const response = await api.post('/api/reports/generate', userData);
//     return response.data;
//   },
//   
//   getReport: async (reportId: string): Promise<ApiResponse<any>> => {
//     const response = await api.get(`/api/reports/${reportId}`);
//     return response.data;
//   },
//   
//   shareReport: async (reportId: string): Promise<ApiResponse<{ shareToken: string }>> => {
//     const response = await api.post(`/api/reports/${reportId}/share`);
//     return response.data;
//   },
// };

// 주간 미션 API
export const missionApi = {
  getWeeklyMission: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/mission/weekly/current');
    return response.data;
  },
  
  // // 백엔드 경로에 missionId가 필요하여 프론트엔드 호출부 수정 필요
  // submitMissionResponse: async (missionData: any): Promise<ApiResponse<any>> => {
  //   const response = await api.post('/mission/weekly/participate', missionData);
  //   return response.data;
  // },
  
  // // 백엔드 경로에 missionId가 필요하여 프론트엔드 호출부 수정 필요
  // getMissionResults: async (): Promise<ApiResponse<any>> => {
  //   const response = await api.get('/mission/weekly/results');
  //   return response.data;
  // },
};

export default api;