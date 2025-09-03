export interface Tenant {
  id?: string;
  timestamp?: string;
  buildingName: string;
  streetAddress: string;
  neighborhood: string;
  city: string;
  currentRentKrw: number;
  depositKrw: number;
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
  role: 'tenant' | 'landlord' | 'anonymous';
  latitude?: number;
  longitude?: number;
  address?: string;
  active?: boolean;
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
}

export interface VoteResult {
  proposalId: string;
  totalVotes: number;
  agreeVotes: number;
  disagreeVotes: number;
  agreePercentage: number;
  disagreePercentage: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}