import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ProposalDiscussion as DiscussionType, User } from '../types';

interface ProposalDiscussionProps {
  proposalId: string;
  currentUser: User;
}

interface DiscussionFormData {
  content: string;
}

const ProposalDiscussion: React.FC<ProposalDiscussionProps> = ({ proposalId, currentUser }) => {
  const [discussions, setDiscussions] = useState<DiscussionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DiscussionFormData>();

  useEffect(() => {
    fetchDiscussions();
  }, [proposalId]);

  const fetchDiscussions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/discussions/proposal/${proposalId}`);
      const result = await response.json();
      
      if (result.ok) {
        setDiscussions(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const onSubmit = async (data: DiscussionFormData) => {
    if (!currentUser.id) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = replyingTo 
        ? `/api/discussions/${replyingTo}/reply`
        : '/api/discussions';

      const payload = replyingTo
        ? {
            authorId: currentUser.id,
            authorRole: currentUser.role,
            content: data.content
          }
        : {
            proposalId,
            authorId: currentUser.id,
            authorRole: currentUser.role,
            content: data.content
          };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success(replyingTo ? '댓글이 등록되었습니다!' : '게시글이 등록되었습니다!');
        reset();
        setReplyingTo(null);
        fetchDiscussions();
      } else {
        toast.error(result.message || '등록에 실패했습니다.');
      }
    } catch (error) {
      toast.error('네트워크 오류. 다시 시도해주세요.');
      console.error('Discussion submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tenant': return 'bg-blue-100 text-blue-800';
      case 'landlord': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tenant': return '세입자';
      case 'landlord': return '집주인';
      default: return '익명';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        제안서 토론
      </h3>

      {/* 새 게시글 작성 */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <div className="mb-4">
          <textarea
            {...register('content', { 
              required: '내용을 입력해주세요',
              maxLength: {
                value: 1000,
                message: '내용은 1000자 이하여야 합니다'
              }
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={replyingTo ? "댓글을 입력하세요..." : "제안서에 대한 의견을 남겨주세요..."}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            {replyingTo && (
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                취소
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? '등록 중...' : (replyingTo ? '댓글 등록' : '게시글 등록')}
          </button>
        </div>
      </form>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">아직 게시글이 없습니다.</p>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(discussion.authorRole)}`}>
                    {getRoleLabel(discussion.authorRole)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(discussion.timestamp || '')}
                  </span>
                </div>
                {!discussion.isReply && currentUser.id && (
                  <button
                    onClick={() => setReplyingTo(discussion.id || '')}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    댓글
                  </button>
                )}
              </div>
              
              <div className="text-gray-900 mb-2">
                {discussion.content}
              </div>

              {/* 댓글들 */}
              {discussion.id && (
                <RepliesList 
                  parentId={discussion.id} 
                  currentUser={currentUser}
                  onReplyAdded={fetchDiscussions}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 댓글 목록 컴포넌트
const RepliesList: React.FC<{
  parentId: string;
  currentUser: User;
  onReplyAdded: () => void;
}> = ({ parentId, currentUser, onReplyAdded }) => {
  const [replies, setReplies] = useState<DiscussionType[]>([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{content: string}>();

  useEffect(() => {
    fetchReplies();
  }, [parentId]);

  const fetchReplies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/discussions/${parentId}/replies`);
      const result = await response.json();
      
      if (result.ok) {
        setReplies(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const onSubmitReply = async (data: {content: string}) => {
    if (!currentUser.id) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/discussions/${parentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: currentUser.id,
          authorRole: currentUser.role,
          content: data.content
        }),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('댓글이 등록되었습니다!');
        reset();
        setShowReplyForm(false);
        fetchReplies();
        onReplyAdded();
      } else {
        toast.error(result.message || '댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      toast.error('네트워크 오류. 다시 시도해주세요.');
      console.error('Reply submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tenant': return 'bg-blue-100 text-blue-800';
      case 'landlord': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tenant': return '세입자';
      case 'landlord': return '집주인';
      default: return '익명';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="ml-4 mt-3">
      {replies.length > 0 && (
        <div className="space-y-2 mb-3">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(reply.authorRole)}`}>
                  {getRoleLabel(reply.authorRole)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(reply.timestamp || '')}
                </span>
              </div>
              <div className="text-sm text-gray-900">
                {reply.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {!showReplyForm ? (
        <button
          onClick={() => setShowReplyForm(true)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          댓글 달기
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmitReply)} className="mt-2">
          <textarea
            {...register('content', { 
              required: '댓글 내용을 입력해주세요',
              maxLength: {
                value: 1000,
                message: '댓글은 1000자 이하여야 합니다'
              }
            })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="댓글을 입력하세요..."
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
          )}
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProposalDiscussion;
