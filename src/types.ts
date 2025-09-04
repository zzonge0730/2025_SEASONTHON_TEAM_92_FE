export interface Tenant {
  id?: string;
  timestamp?: string;
  buildingName: string;
  streetAddress: string;
  neighborhood: string;
  city: string;
  buildingType: 'apartment' | 'officetel' | 'villa';
  contractType: 'monthly' | 'yearly';
  currentRentKrw: number;
  depositKrw: number;
  maintenanceFee?: number;
  leaseEndYyyyMm: string;
  increaseNoticePctOptional?: number;
  landlordEmailOptional?: string;
  painPointsFreeText?: string;
  consentYesNo: boolean;
}

export interface MarketData {
  neighborhood: string;
  buildingName: string;
  avgDeposit: number;
  avgMonthlyRent: number;
  medianDeposit: number;
  medianMonthlyRent: number;
  transactionCount: number;
  recentTransactionDate: string;
}

export interface Group {
  groupId: string;
  label: string;
  scope: string;
  groupSize: number;
  avgRentKrw: number;
  medianRentKrw: number;
  avgNoticePct: number;
  marketData?: MarketData;
}

export interface LetterRequest {
  groupId: string;
  capPct: number;
  termMonths: number;
  noticeDays: number;
  contactEmail: string;
  contactPhone: string;
  selectedPainPoints?: string[];
  selectedDiscussions?: string[];
  customContent?: string;
}

export interface LetterResponse {
  generatedText: string;
  tokens: number;
  usedLlm: boolean;
}

export interface User {
  id?: string;
  timestamp?: string;
  email?: string;
  password?: string;
  nickname: string;
  role: 'tenant' | 'landlord' | 'anonymous' | 'admin';
  latitude?: number;
  longitude?: number;
  address?: string;
  active?: boolean;
  // 집주인 인증 관련
  isVerified?: boolean;
  businessRegistrationNumber?: string;
  propertyAddresses?: string[];
  verificationDocuments?: string[];
}

export interface ProposalDiscussion {
  id?: string;
  timestamp?: string;
  proposalId: string;
  authorId: string;
  authorRole: 'tenant' | 'landlord';
  content: string;
  isReply?: boolean;
  parentId?: string;
}

export interface AnonymousReport {
  id?: string;
  timestamp?: string;
  buildingName: string;
  report: string;
  neighborhood?: string;
  city?: string;
  verified?: boolean;
}

export interface Vote {
  id?: string;
  timestamp?: string;
  proposalId: string;
  userId: string;
  vote: 'agree' | 'disagree';
  deadline?: string;
}

export interface VoteResult {
  proposalId: string;
  totalVotes: number;
  agreeVotes: number;
  disagreeVotes: number;
  agreePercentage: number;
  disagreePercentage: number;
}

export interface LandlordVerification {
  id?: string;
  timestamp?: string;
  userId: string;
  businessRegistrationNumber: string;
  propertyAddresses: string[];
  verificationDocuments: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface LandlordProperty {
  id?: string;
  timestamp?: string;
  landlordId: string;
  address: string;
  buildingName: string;
  totalUnits: number;
  currentTenants: number;
  avgRent: number;
  isActive: boolean;
}

export interface Notification {
  id?: string;
  timestamp?: string;
  userId: string;
  type: 'proposal' | 'vote' | 'discussion' | 'system' | 'verification';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string; // proposalId, voteId, etc.
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

// 진단 시스템 관련 타입들
export interface DiagnosisQuestion {
  id: string;
  category: 'noise' | 'water_pressure' | 'lighting' | 'parking' | 'heating' | 'security' | 'elevator' | 'facilities';
  question: string;
  options: string[];
  weight: number;
}

export interface DiagnosisResult {
  id: string;
  userId: string;
  category: string;
  score: number;
  answers: { [questionId: string]: string };
  createdAt: string;
}

export interface ComprehensiveDiagnosis {
  id: string;
  userId: string;
  overallScore: number;
  categoryScores: { [category: string]: number };
  buildingComparison: ComparisonData;
  neighborhoodComparison: ComparisonData;
  recommendations: string[];
  createdAt: string;
}

export interface ComparisonData {
  averageScore: number;
  participantCount: number;
  rank: number;
  percentile: number;
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  questions: DiagnosisQuestion[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MissionParticipation {
  id: string;
  userId: string;
  missionId: string;
  answers: { [questionId: string]: string };
  completedAt: string;
}

export interface NegotiationReport {
  id: string;
  userId: string;
  reportUrl: string;
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  marketData: MarketData;
  diagnosisData: ComprehensiveDiagnosis;
  createdAt: string;
  isShared: boolean;
}