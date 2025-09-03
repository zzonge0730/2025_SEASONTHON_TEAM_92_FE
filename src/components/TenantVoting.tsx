import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User } from '../types';

interface Vote {
  id: string;
  title: string;
  description: string;
  options: string[];
  createdAt: string;
  deadline?: string;
  status: 'active' | 'closed';
  userVote?: string;
  results?: {
    [option: string]: number;
  };
}

interface TenantVotingProps {
  currentUser: User;
}

const TenantVoting: React.FC<TenantVotingProps> = ({ currentUser }) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState<{ [voteId: string]: boolean }>({});
  const [voteResults, setVoteResults] = useState<{ [voteId: string]: any }>({});

  // 투표가 만료되었는지 확인
  const isVoteExpired = (vote: Vote): boolean => {
    if (!vote.deadline) return false;
    return new Date(vote.deadline) < new Date();
  };

  // 투표 상태 확인 (만료 여부 포함)
  const getVoteStatus = (vote: Vote): 'active' | 'expired' | 'closed' => {
    if (vote.status === 'closed') return 'closed';
    if (isVoteExpired(vote)) return 'expired';
    return 'active';
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
    fetchVotes();
  }, []);

  // 투표 참여
  const submitVote = async (voteId: string, option: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: voteId,
          userId: currentUser.id,
          vote: option,
        }),
      });

      const result = await response.json();
      
      if (result.ok) {
        toast.success('투표가 완료되었습니다!');
        // 투표 완료 상태 업데이트
        setVotes(prevVotes => 
          prevVotes.map(vote => 
            vote.id === voteId 
              ? { ...vote, userVote: option }
              : vote
          )
        );
      } else {
        toast.error(result.message || '투표 제출에 실패했습니다');
        console.error('Vote submission error:', result);
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
        setVoteResults(prev => ({ ...prev, [voteId]: result.data }));
        return result.data;
      }
    } catch (error) {
      console.error('Error fetching vote results:', error);
    }
    return null;
  };

  // 투표 결과 보기/숨기기
  const toggleResults = async (voteId: string) => {
    if (!showResults[voteId]) {
      // 결과 보기
      if (!voteResults[voteId]) {
        await fetchVoteResults(voteId);
      }
      setShowResults(prev => ({ ...prev, [voteId]: true }));
    } else {
      // 결과 숨기기
      setShowResults(prev => ({ ...prev, [voteId]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            투표 참여
          </h2>
          <p className="text-gray-600">
            관리자가 생성한 투표에 참여하여 의견을 표현하세요.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : votes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">진행 중인 투표가 없습니다.</p>
            <p className="text-gray-400 mt-2">
              관리자가 투표를 생성하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {votes.map((vote) => (
              <div key={vote.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {vote.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{vote.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    getVoteStatus(vote) === 'active'
                      ? 'bg-green-100 text-green-800'
                      : getVoteStatus(vote) === 'expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getVoteStatus(vote) === 'active' ? '진행중' : 
                     getVoteStatus(vote) === 'expired' ? '만료' : '종료'}
                  </span>
                </div>

                {getVoteStatus(vote) === 'active' && !vote.userVote ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">투표 옵션:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {vote.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => submitVote(vote.id, option)}
                          className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-500 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : vote.userVote ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✅ 투표 완료: {vote.userVote}
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      투표해주셔서 감사합니다!
                    </p>
                  </div>
                ) : getVoteStatus(vote) === 'expired' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">
                      ⏰ 투표가 만료되었습니다.
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                      마감일: {vote.deadline ? new Date(vote.deadline).toLocaleString('ko-KR') : '미설정'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">
                      투표가 종료되었습니다.
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>생성일: {new Date(vote.createdAt).toLocaleString('ko-KR')}</p>
                      {vote.deadline && (
                        <p>마감일: {new Date(vote.deadline).toLocaleString('ko-KR')}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleResults(vote.id)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    >
                      {showResults[vote.id] ? '결과 숨기기' : '결과 보기'}
                    </button>
                  </div>

                  {/* 투표 결과 표시 */}
                  {showResults[vote.id] && voteResults[vote.id] && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">투표 결과</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          총 투표수: <span className="font-medium">{voteResults[vote.id].totalVotes}표</span>
                        </p>
                        {Object.entries(voteResults[vote.id].results).map(([option, count]) => (
                          <div key={option} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{option}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                {count}표 ({voteResults[vote.id].percentages[option]}%)
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${voteResults[vote.id].percentages[option]}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={fetchVotes}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantVoting;