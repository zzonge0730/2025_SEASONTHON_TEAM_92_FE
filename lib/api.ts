import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://2025seasonthonteam92be-production.up.railway.app'; // Railway 백엔드 서버

// 목업 모드 설정 (백엔드 API가 구현되지 않은 경우)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

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

  // Check if Authorization header is already set (e.g., from server-side explicit setting)
  if (!config.headers.Authorization) {
    // Only try to get from localStorage if it's available (client-side)
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 JWT 토큰이 localStorage에서 요청 헤더에 추가됨:', config.url);
      }
    }
  } else {
    console.log('🔑 JWT 토큰이 요청 헤더에 이미 존재함:', config.url);
  }

  // JWT 토큰이 필요하지 않은 엔드포인트들 (team_backend 기준)
  const noAuthEndpoints = ['/member/create', '/member/doLogin', '/api/location/health', '/api/location/preview'];
  const needsAuth = !noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));

  if (needsAuth && !config.headers.Authorization) {
    console.log('❌ JWT 토큰이 없음 (인증 필요 엔드포인트):', config.url);
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

// API 응답 타입 정의 (team_backend의 공통 응답 형식에 맞춤)
// Member API는 이 형식을 따르지 않으므로, 해당 API는 별도로 처리해야 합니다.
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
}

// 사용자 타입 정의 (프론트엔드 기존 User 인터페이스 유지)
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

// 인증 API (team_backend 코드 기반)
// 응답 형식이 ApiResponse<T>를 따르지 않으므로, 호출하는 곳에서 raw 응답을 처리해야 합니다.
export const authApi = {
  register: async (userData: any): Promise<any> => { // Promise<any>로 변경
    const response = await api.post('/member/create', userData);
    return response.data; // { id: number }
  },
  
  login: async (credentials: any): Promise<any> => { // Promise<any>로 변경
    const response = await api.post('/member/doLogin', credentials);
    return response.data; // { id: number, token: string }
  },
  
  // updateUser: team_backend에 없음
  // async (userData: any): Promise<any> => {
  //   const response = await api.put('/api/auth/update', userData);
  //   return response.data;
  // },
  
  getCurrentUser: async (token?: string): Promise<any> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/member/profile', config);
    return response.data; // MemberProfileDto
  },

  setProfileSetting: async (settingData: any): Promise<any> => { // Promise<any>로 변경
    const response = await api.post('/member/profile/setting', settingData);
    return response.data; // { success: boolean, message: string }
  },
};

// 위치 API (team_backend 코드 기반)
export const locationApi = {
  healthCheck: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/location/health');
    return response.data;
  },
  getAddressPreview: async (longitude: number, latitude: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/location/preview?longitude=${longitude}&latitude=${latitude}`);
    return response.data;
  },
  verifyLocation: async (payload: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/location/verify', payload);
    return response.data;
  },
};

// // 그룹 API (team_backend에 없음)
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

// 진단 API (API 명세 기반)
export const diagnosisApi = {
  getDiagnosisQuestions: async (): Promise<any> => {
    try {
      const response = await api.get('/diagnosis/questions');
      return response.data; // ApiResponse<DiagnosisQuestions>
    } catch (error: any) {
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          message: "진단 질문을 조회했습니다.",
          data: {
            scoreOptions: [
              {"score": "1", "label": "매우 나쁨"},
              {"score": "2", "label": "나쁨"},
              {"score": "3", "label": "보통"},
              {"score": "4", "label": "좋음"},
              {"score": "5", "label": "매우 좋음"}
            ],
            categories: [
              {
                categoryId: 1,
                sortOrder: 1,
                questions: [
                  {
                    questionId: 1,
                    questionText: "옆집/윗집 생활소음이 어느 정도인가요?",
                    subText: "이웃 소음 - 대화 소리등"
                  },
                  {
                    questionId: 2,
                    questionText: "외부 소음(교통, 공사 등)은 어떤가요?",
                    subText: "외부 소음 - 교통 소음등"
                  }
                ]
              }
            ]
          }
        };
      }
      throw error;
    }
  },
  
  submitDiagnosis: async (diagnosisData: any): Promise<any> => {
    try {
      const response = await api.post('/diagnosis/responses', diagnosisData);
      return response.data; // ApiResponse<DiagnosisSubmission>
    } catch (error: any) {
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          message: "진단 응답이 저장되었습니다.",
          data: {
            totalScore: 73,
            maxScore: 100,
            responseCount: 20,
            submittedAt: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  },
  
  getDiagnosisResult: async (token?: string): Promise<any> => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await api.get('/diagnosis/result', config);
      return response.data; // ApiResponse<DiagnosisResult>
    } catch (error: any) {
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          message: "진단 결과를 조회했습니다.",
          data: {
            summary: {
              totalScore: 73,
              grade: "양호",
              buildingAverage: 68,
              neighborhoodAverage: 71,
            },
            categoryDetails: [
              {
                categoryId: 1,
                myScore: 7,
                buildingAverage: 6.8,
                neighborhoodAverage: 7.0
              },
              {
                categoryId: 2,
                myScore: 8,
                buildingAverage: 7.2,
                neighborhoodAverage: 7.5
              },
              {
                categoryId: 3,
                myScore: 4,
                buildingAverage: 6.5,
                neighborhoodAverage: 6.8
              }
            ],
            analysis: {
              strengths: [
                {"categoryId": 2, "score": 90},
                {"categoryId": 5, "score": 85}
              ],
              improvements: [
                {"categoryId": 3, "score": 40}
              ]
            },
            statistics: {
              participantCount: 8,
              responseCount: 156,
              buildingResidents: 8,
              neighborhoodResidents: 6
            }
          }
        };
      }
      throw error;
    }
  },
};

// 리포트 API (API 명세 기반)
export const reportApi = {
  createReport: async (reportData: any, jwtToken?: string): Promise<any> => {
    try {
      const config = jwtToken ? {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      } : {};
      const response = await api.post('/report/create', reportData, config);
      return response.data; // { reportId: number }
    } catch (error: any) {
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          reportId: Math.floor(Math.random() * 1000) + 1
        };
      }
      throw error;
    }
  },
  
  getReport: async (reportId: number): Promise<any> => {
    try {
      const response = await api.get(`/report/${reportId}`);
      return response.data; // { primaryNegotiationCard, secondaryNegotiationCard, step1, step2 }
    } catch (error: any) {
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          primaryNegotiationCard: "안녕하세요. 현재 거주하고 있는 집의 월세를 조정해드리고 싶어서 연락드립니다. 최근 시장 상황과 주변 임대료를 조사해본 결과, 현재 월세가 시장가보다 높은 것으로 확인되었습니다. 협의를 통해 합리적인 수준으로 조정해주시면 감사하겠습니다.",
          secondaryNegotiationCard: "거주 중 발견된 하자들에 대해 수리 요청드립니다. 화장실 배수구 막힘, 베란다 문 고장, 벽지 벗겨짐 등의 문제가 있어 일상생활에 불편을 겪고 있습니다. 빠른 시일 내에 수리해주시면 감사하겠습니다.",
          step1: "1단계: 관리사무소나 임대인에게 연락하여 월세 조정 및 하자 수리에 대한 협의를 요청합니다. 서면으로 요청사항을 정리하여 전달하는 것이 좋습니다.",
          step2: "2단계: 협의가 원활하지 않을 경우, 임대차분쟁조정위원회에 신청하거나 법적 조치를 고려할 수 있습니다. 관련 서류와 증거를 미리 준비해두세요."
        };
      }
      throw error;
    }
  },
};

// 주간 미션 API (API 명세 기반)
export const missionApi = {
  getCurrentMission: async (token?: string): Promise<any> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    try {
      const response = await api.get('/missions/current', config);
      return response.data; // ApiResponse<CurrentMission>
    } catch (error: any) {
      // 백엔드가 구현되지 않은 경우 목업 데이터 반환
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          data: {
            mission_id: 1,
            category: "소음",
            title: "방음 상태 점검",
            description: "우리 집 소음 환경을 체크해보세요",
            start_date: "2024-01-08",
            end_date: "2024-01-14",
            questions: [
              {
                question_id: 1,
                question_text: "옆집 생활 소음이 들리는 편인가요?",
                question_type: "select",
                options: ["전혀 안 들림", "가끔 들림", "자주 들림"],
                order_number: 1
              },
              {
                question_id: 2,
                question_text: "최근 1달 내 층간소음으로 불편을 겪은 적이 있나요?",
                question_type: "select", 
                options: ["없음", "1~2번", "3번 이상"],
                order_number: 2
              }
            ],
            participation_count: 156,
            user_participated: false
          }
        };
      }
      throw error;
    }
  },
  
  participateInMission: async (missionId: number, responseData: any): Promise<any> => {
    try {
      const response = await api.post(`/missions/${missionId}/participate`, responseData);
      return response.data; // ApiResponse<ParticipationResult>
    } catch (error: any) {
      // 백엔드가 구현되지 않은 경우 목업 데이터 반환
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          data: {
            response_id: 123,
            total_score: 7,
            message: "미션 참여가 완료되었습니다!",
            next_step: "결과 확인하기"
          }
        };
      }
      throw error;
    }
  },
  
  getMissionResult: async (missionId: number): Promise<any> => {
    try {
      const response = await api.get(`/missions/${missionId}/result`);
      return response.data; // ApiResponse<MissionResult>
    } catch (error: any) {
      // 백엔드가 구현되지 않은 경우 목업 데이터 반환
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          data: {
            user_score: 7,
            max_score: 10,
            category: "소음",
            building_comparison: {
              building_average: 6.2,
              user_rank: 8,
              total_participants: 12,
              comparison_text: "우리 건물 평균보다 소음이 적은 편입니다"
            },
            neighborhood_comparison: {
              neighborhood_average: 5.8,
              user_rank: 23,
              total_participants: 45,
              comparison_text: "우리 동네 평균보다 소음이 적은 편입니다"
            },
            insights: [
              "우리 건물은 전반적으로 방음이 잘 되는 편입니다",
              "87% 참가자가 소음에 만족하고 있습니다"
            ]
          }
        };
      }
      throw error;
    }
  },
};

// GPS 인증 API
export const gpsApi = {
  verifyLocation: async (verificationData: any): Promise<any> => {
    try {
      // 백엔드 API 형식에 맞게 데이터 변환
      const requestData = {
        latitude: verificationData.userLocation.latitude,
        longitude: verificationData.userLocation.longitude,
        accuracy: verificationData.userLocation.accuracy,
        timestamp: verificationData.userLocation.timestamp,
        targetAddress: verificationData.targetAddress,
        toleranceRadius: verificationData.toleranceRadius
      };

      const response = await api.post('/api/location/gps/verify', requestData);
      return response.data;
    } catch (error: any) {
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          data: {
            isVerified: true,
            confidence: 87,
            latitude: verificationData.userLocation.latitude,
            longitude: verificationData.userLocation.longitude,
            accuracy: verificationData.userLocation.accuracy,
            timestamp: verificationData.userLocation.timestamp,
            address: "서울시 마포구 망원동 123-45",
            dong: "망원동",
            gu: "마포구",
            si: "서울시",
            verificationMethod: "gps",
            verifiedAt: new Date().toISOString(),
            message: "GPS 인증이 완료되었습니다."
          }
        };
      }
      throw error;
    }
  },
  
  getLocationAccuracy: async (locationData: any): Promise<any> => {
    try {
      // 백엔드 API 형식에 맞게 데이터 변환
      const requestData = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp
      };

      const response = await api.post('/api/location/gps/accuracy', requestData);
      return response.data;
    } catch (error: any) {
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          data: {
            accuracy: locationData.accuracy || 15.5,
            confidence: locationData.accuracy <= 10 ? 95 : 
                       locationData.accuracy <= 50 ? 85 : 
                       locationData.accuracy <= 100 ? 70 : 50,
            recommendations: [
              "실외에서 측정하세요",
              "건물에서 멀리 떨어지세요",
              "GPS 신호가 강한 곳에서 측정하세요"
            ],
            message: "위치 정확도 평가가 완료되었습니다."
          }
        };
      }
      throw error;
    }
  }
};

// 오피스텔 API (team_backend 코드 기반)
export const officetelApi = {
  getRentData: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/officetel/rent-data?lawdCd=${lawdCd}`);
    return response.data;
  },
  getJeonseMarket: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/officetel/jeonse-market?lawdCd=${lawdCd}`);
    return response.data;
  },
  getMonthlyRentMarket: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/officetel/monthly-rent-market?lawdCd=${lawdCd}`);
    return response.data;
  },
};

export default api;