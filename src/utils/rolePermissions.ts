// 역할별 권한 관리 시스템

export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface RolePermissions {
  canViewGroups: boolean;
  canSubmitRentInfo: boolean;
  canViewAnonymousReports: boolean;
  canCreateVotes: boolean;
  canVote: boolean;
  canManageReports: boolean;
  canAccessAdminPanel: boolean;
  canViewNegotiationGuide: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  tenant: {
    canViewGroups: true,
    canSubmitRentInfo: true,
    canViewAnonymousReports: false,
    canCreateVotes: false,
    canVote: true,
    canManageReports: false,
    canAccessAdminPanel: false,
    canViewNegotiationGuide: true,
  },
  landlord: {
    canViewGroups: true,
    canSubmitRentInfo: false,
    canViewAnonymousReports: false,
    canCreateVotes: false,
    canVote: false,
    canManageReports: false,
    canAccessAdminPanel: false,
    canViewNegotiationGuide: true,
  },
  admin: {
    canViewGroups: true,
    canSubmitRentInfo: false,
    canViewAnonymousReports: true,
    canCreateVotes: true,
    canVote: false,
    canManageReports: true,
    canAccessAdminPanel: true,
    canViewNegotiationGuide: true,
  },
};

export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[userRole][permission];
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'tenant':
      return '세입자';
    case 'landlord':
      return '집주인';
    case 'admin':
      return '관리자';
    default:
      return '알 수 없음';
  }
}

export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'tenant':
      return '월세 정보를 제출하고 그룹에 참여하여 공동 협상에 참여할 수 있습니다.';
    case 'landlord':
      return '그룹 정보를 확인하고 협상 가이드를 볼 수 있습니다.';
    case 'admin':
      return '시스템을 관리하고 익명 신고를 확인하며 투표를 생성할 수 있습니다.';
    default:
      return '';
  }
}