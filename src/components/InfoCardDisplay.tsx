import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { infoCardApi } from '../lib/api';

interface InfoCard {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InfoCardDisplayProps {
  limit?: number;
  showCategory?: boolean;
}

const InfoCardDisplay: React.FC<InfoCardDisplayProps> = ({ 
  limit = 5, 
  showCategory = true 
}) => {
  const [cards, setCards] = useState<InfoCard[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadInfoCards();
  }, []);

  const loadInfoCards = async () => {
    try {
      setIsLoading(true);
      const response = await infoCardApi.getAllCards();
      
      if (response.ok) {
        const activeCards = (response.data || [])
          .filter((card: InfoCard) => card.isActive)
          .sort((a: InfoCard, b: InfoCard) => {
            // 우선순위별 정렬 (high > medium > low)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
        
        setCards(activeCards);
      } else {
        toast.error('정보 카드를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error loading info cards:', error);
      toast.error('정보 카드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '일반';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'notice':
        return 'bg-blue-100 text-blue-800';
      case 'tip':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-red-100 text-red-800';
      case 'update':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'notice':
        return '공지사항';
      case 'tip':
        return '팁';
      case 'warning':
        return '주의사항';
      case 'update':
        return '업데이트';
      default:
        return category;
    }
  };

  const filteredCards = selectedCategory === 'all' 
    ? cards 
    : cards.filter(card => card.category.toLowerCase() === selectedCategory.toLowerCase());

  const displayCards = limit ? filteredCards.slice(0, limit) : filteredCards;

  const categories = ['all', ...Array.from(new Set(cards.map(card => card.category.toLowerCase())))];

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">정보 카드</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">정보 카드가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            새로운 정보 카드가 등록되면 여기에 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">정보 카드</h3>
        <button
          onClick={loadInfoCards}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          새로고침
        </button>
      </div>

      {/* 카테고리 필터 */}
      {showCategory && categories.length > 1 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? '전체' : getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 정보 카드 목록 */}
      <div className="space-y-4">
        {displayCards.map((card) => (
          <div
            key={card.id}
            className={`border rounded-lg p-4 border-l-4 ${getPriorityColor(card.priority)} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {showCategory && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(card.category)}`}>
                    {getCategoryLabel(card.category)}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  card.priority === 'high' ? 'bg-red-100 text-red-800' :
                  card.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {getPriorityLabel(card.priority)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(card.updatedAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
            
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {card.title}
            </h4>
            
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {card.content}
            </div>
          </div>
        ))}
      </div>

      {limit && filteredCards.length > limit && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            더 보기 ({filteredCards.length - limit}개 더)
          </button>
        </div>
      )}
    </div>
  );
};

export default InfoCardDisplay;