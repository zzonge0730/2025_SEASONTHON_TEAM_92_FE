import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User } from '../types';

interface AnonymousReport {
  id: string;
  timestamp: string;
  buildingName: string;
  report: string;
  neighborhood?: string;
  city?: string;
  verified: boolean;
}

interface Vote {
  id: string;
  title: string;
  description: string;
  options: string[];
  createdAt: string;
  status: 'active' | 'closed';
}

interface AdminDashboardProps {
  admin: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'votes'>('reports');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedVoteForResults, setSelectedVoteForResults] = useState<Vote | null>(null);
  const [voteResults, setVoteResults] = useState<any>(null);

  // 익명 신고 목록 조회
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/reports`);
      const result = await response.json();
      
      if (result.ok) {
        setReports(result.data || []);
      } else {
        toast.error('신고 목록을 불러오는데 실패했습니다');
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다');
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 투표 목록 조회
  const fetchVotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/votes`);
      const result = await response.json();
      
      if (result.ok) {
        setVotes(result.data || []);
      } else {
        toast.error('투표 목록을 불러오는데 실패했습니다');
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다');
      console.error('Error fetching votes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchVotes();
    }
  }, [activeTab]);

  // 신고 검증 상태 변경
  const toggleReportVerification = async (reportId: string, verified: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/reports/${reportId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified }),
      });

      const result = await response.json();
      
      if (result.ok) {
        toast.success(verified ? '신고를 검증했습니다' : '신고 검증을 취소했습니다');
        fetchReports();
      } else {
        toast.error('상태 변경에 실패했습니다');
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다');
    }
  };

  // 투표 결과 조회
  const fetchVoteResults = async (voteId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/votes/${voteId}/results`);
      const result = await response.json();
      
      if (result.ok) {
        setVoteResults(result.data);
        return result.data;
      } else {
        toast.error('투표 결과를 불러오는데 실패했습니다');
        return null;
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다');
      return null;
    }
  };

  // 투표 결과 보기
  const showVoteResults = async (vote: Vote) => {
    setSelectedVoteForResults(vote);
    await fetchVoteResults(vote.id);
  };

  // 투표 결과 모달 닫기
  const closeResultsModal = () => {
    setSelectedVoteForResults(null);
    setVoteResults(null);
  };

  // 새 투표 생성 (간단한 prompt 방식)
  const createVote = async () => {
    const title = prompt('투표 제목을 입력하세요:');
    if (!title) return;

    const description = prompt('투표 설명을 입력하세요:');
    if (!description) return;

    const optionsInput = prompt('투표 옵션을 쉼표로 구분하여 입력하세요 (예: 찬성, 반대):');
    if (!optionsInput) return;

    const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt);

    // 기한 입력 (선택사항)
    const deadlineInput = prompt('투표 마감일을 입력하세요 (YYYY-MM-DDTHH:mm 형식, 예: 2024-12-31T23:59, 빈칸이면 7일 후):');
    let deadline = '';
    if (deadlineInput && deadlineInput.trim()) {
      deadline = deadlineInput.trim();
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          options,
          deadline,
        }),
      });

      const result = await response.json();
      
      if (result.ok) {
        toast.success('투표가 생성되었습니다');
        // 새로 생성된 투표를 목록에 추가
        const newVote = result.data;
        setVotes(prevVotes => [...prevVotes, newVote]);
      } else {
        toast.error('투표 생성에 실패했습니다');
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                관리자 대시보드
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                관리자: {admin.nickname}
              </span>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              익명 신고 관리
            </button>
            <button
              onClick={() => setActiveTab('votes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'votes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              투표 관리
            </button>
          </nav>
        </div>

        {/* 익명 신고 탭 */}
        {activeTab === 'reports' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  익명 신고 목록
                </h3>
                <button
                  onClick={fetchReports}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  새로고침
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : reports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">신고가 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {report.buildingName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {report.neighborhood && report.city 
                              ? `${report.city} ${report.neighborhood}`
                              : '위치 정보 없음'
                            }
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            report.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.verified ? '검증됨' : '미검증'}
                          </span>
                          <button
                            onClick={() => toggleReportVerification(report.id, !report.verified)}
                            className={`px-3 py-1 text-xs rounded ${
                              report.verified
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {report.verified ? '검증 취소' : '검증'}
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700">{report.report}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(report.timestamp).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 투표 관리 탭 */}
        {activeTab === 'votes' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  투표 관리
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={createVote}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    새 투표 생성
                  </button>
                  <button
                    onClick={fetchVotes}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    새로고침
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : votes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">투표가 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {votes.map((vote) => (
                    <div key={vote.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {vote.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          vote.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vote.status === 'active' ? '진행중' : '종료'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{vote.description}</p>
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-600 mb-1">투표 옵션:</p>
                        <div className="flex flex-wrap gap-2">
                          {(vote.options || []).map((option, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>생성일: {new Date(vote.createdAt).toLocaleString('ko-KR')}</p>
                          {vote.deadline && (
                            <p>마감일: {new Date(vote.deadline).toLocaleString('ko-KR')}</p>
                          )}
                        </div>
                        <button
                          onClick={() => showVoteResults(vote)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          결과 보기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 투표 결과 모달 */}
      {selectedVoteForResults && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  투표 결과: {selectedVoteForResults.title}
                </h3>
                <button
                  onClick={closeResultsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">닫기</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">{selectedVoteForResults.description}</p>
              </div>

              {voteResults ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">투표 현황</h4>
                    <p className="text-sm text-gray-600">
                      총 투표수: <span className="font-medium">{voteResults.totalVotes}표</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      마지막 업데이트: {new Date(voteResults.lastUpdated).toLocaleString('ko-KR')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">투표 결과</h4>
                    {Object.entries(voteResults.results).map(([option, count]) => (
                      <div key={option} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{option}</span>
                          <span className="text-sm text-gray-600">
                            {count}표 ({voteResults.percentages[option]}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${voteResults.percentages[option]}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeResultsModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;