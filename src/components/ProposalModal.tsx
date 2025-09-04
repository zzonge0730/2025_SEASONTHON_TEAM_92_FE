import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LetterRequest, LetterResponse, User, ProposalDiscussion } from '../types';
import { groupApi } from '../lib/api';
import ProposalDiscussionComponent from './ProposalDiscussion';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  currentUser: User;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose, groupId, currentUser }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<LetterResponse | null>(null);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  
  // 커스터마이징 데이터
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [discussions, setDiscussions] = useState<ProposalDiscussion[]>([]);
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [selectedDiscussions, setSelectedDiscussions] = useState<string[]>([]);
  const [customContent, setCustomContent] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  
  // 제안서 설정
  const [capPct, setCapPct] = useState(3);
  const [termMonths, setTermMonths] = useState(24);
  const [noticeDays, setNoticeDays] = useState(30);

  // 데이터 로드
  useEffect(() => {
    if (isOpen && showCustomization) {
      loadCustomizationData();
    }
  }, [isOpen, showCustomization, groupId]);

  const loadCustomizationData = async () => {
    setLoadingData(true);
    try {
      const [painPointsResponse, discussionsResponse] = await Promise.all([
        groupApi.getGroupPainPoints(groupId),
        groupApi.getGroupDiscussions(groupId)
      ]);

      if (painPointsResponse.ok) {
        setPainPoints(painPointsResponse.data || []);
      }
      if (discussionsResponse.ok) {
        setDiscussions(discussionsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading customization data:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoadingData(false);
    }
  };

  const generateProposal = async () => {
    setIsGenerating(true);
    try {
      const request: LetterRequest = {
        groupId,
        capPct,
        termMonths,
        noticeDays,
        contactEmail: 'team@tenantcollective.com',
        contactPhone: '010-0000-0000',
        selectedPainPoints: selectedPainPoints.length > 0 ? selectedPainPoints : undefined,
        selectedDiscussions: selectedDiscussions.length > 0 ? selectedDiscussions : undefined,
        customContent: customContent.trim() || undefined
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/letters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (result.ok) {
        setProposal(result.data);
        toast.success('제안서가 생성되었습니다!');
      } else {
        toast.error(result.message || '제안서 생성에 실패했습니다.');
      }
    } catch (error) {
      toast.error('네트워크 오류. 다시 시도해주세요.');
      console.error('Proposal generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (proposal?.generatedText) {
      navigator.clipboard.writeText(proposal.generatedText);
      toast.success('제안서가 클립보드에 복사되었습니다!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">제안서 생성</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* 제안서 생성 섹션 */}
          {!proposal && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">제안서 생성</h3>
                <p className="text-blue-800 text-sm mb-4">
                  같은 건물의 세입자들과 함께 작성된 제안서를 생성합니다. 
                  월세 상한제, 계약 기간, 통지 기간 등을 포함한 합리적인 제안서가 만들어집니다.
                </p>
                
                {/* 기본 설정 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      월세 상한제 (%)
                    </label>
                    <input
                      type="number"
                      value={capPct}
                      onChange={(e) => setCapPct(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      계약 기간 (개월)
                    </label>
                    <input
                      type="number"
                      value={termMonths}
                      onChange={(e) => setTermMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="12"
                      max="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      통지 기간 (일)
                    </label>
                    <input
                      type="number"
                      value={noticeDays}
                      onChange={(e) => setNoticeDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="15"
                      max="90"
                    />
                  </div>
                </div>

                {/* 커스터마이징 옵션 */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowCustomization(!showCustomization)}
                    className="text-blue-700 hover:text-blue-800 text-sm font-medium underline"
                  >
                    {showCustomization ? '기본 설정으로 생성' : '내용 커스터마이징'}
                  </button>
                </div>

                <button
                  onClick={generateProposal}
                  disabled={isGenerating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isGenerating ? '제안서 생성 중...' : '제안서 생성하기'}
                </button>
              </div>

              {/* 커스터마이징 섹션 */}
              {showCustomization && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">제안서 내용 커스터마이징</h4>
                  
                  {loadingData ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* 불만사항 선택 */}
                      {painPoints.length > 0 && (
                        <div>
                          <h5 className="text-md font-medium text-gray-800 mb-2">포함할 불만사항 선택</h5>
                          <div className="space-y-2">
                            {painPoints.map((painPoint, index) => (
                              <label key={index} className="flex items-start space-x-2">
                                <input
                                  type="checkbox"
                                  checked={selectedPainPoints.includes(painPoint)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPainPoints([...selectedPainPoints, painPoint]);
                                    } else {
                                      setSelectedPainPoints(selectedPainPoints.filter(p => p !== painPoint));
                                    }
                                  }}
                                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">{painPoint}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 토론 내용 선택 */}
                      {discussions.length > 0 && (
                        <div>
                          <h5 className="text-md font-medium text-gray-800 mb-2">포함할 토론 내용 선택</h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {discussions.map((discussion) => (
                              <label key={discussion.id} className="flex items-start space-x-2">
                                <input
                                  type="checkbox"
                                  checked={selectedDiscussions.includes(discussion.id || '')}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDiscussions([...selectedDiscussions, discussion.id || '']);
                                    } else {
                                      setSelectedDiscussions(selectedDiscussions.filter(id => id !== discussion.id));
                                    }
                                  }}
                                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                  <span className="text-sm text-gray-700">{discussion.content}</span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {discussion.authorRole} • {discussion.timestamp}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 추가 내용 */}
                      <div>
                        <h5 className="text-md font-medium text-gray-800 mb-2">추가할 내용 (선택사항)</h5>
                        <textarea
                          value={customContent}
                          onChange={(e) => setCustomContent(e.target.value)}
                          placeholder="제안서에 추가하고 싶은 내용을 입력하세요..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 생성된 제안서 */}
          {proposal && (
            <div className="mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">생성된 제안서</h3>
                  <div className="space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      복사하기
                    </button>
                    <button
                      onClick={() => setShowDiscussion(!showDiscussion)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                    >
                      {showDiscussion ? '토론 숨기기' : '토론 보기'}
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {proposal.generatedText}
                  </pre>
                </div>

                <div className="text-xs text-gray-500">
                  {proposal.usedLlm ? 'AI로 생성됨' : '템플릿으로 생성됨'} | 
                  토큰 사용량: {proposal.tokens}
                </div>
              </div>
            </div>
          )}

          {/* 토론 섹션 */}
          {showDiscussion && proposal && (
            <div className="mb-6">
              <ProposalDiscussionComponent 
                proposalId={groupId} 
                currentUser={currentUser} 
              />
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
