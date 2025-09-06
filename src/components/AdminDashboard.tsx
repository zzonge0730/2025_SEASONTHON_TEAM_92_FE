import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Vote } from '../types';

interface AnonymousComplaint {
  id: string;
  timestamp: string;
  buildingName: string;
  report: string;
  neighborhood: string;
  city: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface AdminDashboardProps {
  admin: User;
  onLogout: () => void;
}

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [reports, setReports] = useState<AnonymousComplaint[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 익명 신고 목록 가져오기
      const reportsResponse = await fetch('http://localhost:8891/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.data || []);
      }

      // 투표 목록 가져오기
      const votesResponse = await fetch('http://localhost:8891/api/admin/votes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      if (votesResponse.ok) {
        const votesData = await votesResponse.json();
        setVotes(votesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReport = async (reportId: string, verified: boolean) => {
    try {
      const response = await fetch(`http://localhost:8891/api/admin/reports/${reportId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({ verified })
      });

      if (response.ok) {
        toast.success(verified ? '신고가 검증되었습니다.' : '신고 검증이 취소되었습니다.');
        fetchData(); // 데이터 새로고침
      } else {
        toast.error('신고 검증에 실패했습니다.');
      }
      fetchData();
    } catch (error) {
      console.error('Error verifying report:', error);
      toast.error('신고 검증 중 오류가 발생했습니다.');
    }
  };

  const handleCreateVote = async () => {
    try {
      // 실제로는 API 호출
      toast.success('투표가 생성되었습니다.');
      fetchData();
    } catch (error) {
      console.error('Error creating vote:', error);
      toast.error('투표 생성 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                관리자 대시보드
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {admin.nickname}님
              </span>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 신고 건수
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reports.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      검증된 신고
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reports.filter(r => r.verified).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🗳️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      활성 투표
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {votes.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anonymous Reports */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              익명 신고 관리
            </h3>
            {reports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                아직 신고된 내용이 없습니다.
              </p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {report.buildingName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {report.streetAddress}, {report.neighborhood}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          신고 내용: {report.report}
                        </p>
                        {report.verified && (
                          <p className="text-sm text-green-600 mt-1">
                            ✅ 검증됨 ({report.verifiedBy} - {report.verifiedAt ? new Date(report.verifiedAt).toLocaleDateString('ko-KR') : ''})
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleVerifyReport(report.id, true)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          검증
                        </button>
                        <button
                          onClick={() => handleVerifyReport(report.id, false)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          거부
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vote Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                투표 관리
              </h3>
              <button
                onClick={handleCreateVote}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                새 투표 생성
              </button>
            </div>
            {votes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                아직 생성된 투표가 없습니다.
              </p>
            ) : (
              <div className="space-y-4">
                {votes.map((vote) => (
                  <div key={vote.id} className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      투표 ID: {vote.id}
                    </h4>
                    <p className="text-sm text-gray-600">
                      투표가 생성되었습니다.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}