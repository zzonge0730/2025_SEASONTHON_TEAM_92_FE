import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { LetterRequest, LetterResponse, User } from '../types';
import ProposalDiscussion from './ProposalDiscussion';

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

  const generateProposal = async () => {
    setIsGenerating(true);
    try {
      const request: LetterRequest = {
        groupId,
        capPct: 3,
        termMonths: 24,
        noticeDays: 30,
        contactEmail: 'team@tenantcollective.com',
        contactPhone: '010-0000-0000'
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/letters`, {
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
                <button
                  onClick={generateProposal}
                  disabled={isGenerating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isGenerating ? '제안서 생성 중...' : '제안서 생성하기'}
                </button>
              </div>
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
              <ProposalDiscussion 
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
