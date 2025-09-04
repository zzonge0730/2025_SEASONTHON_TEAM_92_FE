import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Vote } from '../types';

interface AnonymousReport {
  id: string;
  timestamp: string;
  buildingName: string;
  report: string;
  neighborhood?: string;
  city?: string;
  verified: boolean;
}

interface AdminDashboardProps {
  admin: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [infoCards, setInfoCards] = useState<InfoCard[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'votes' | 'content'>('reports');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoteForResults, setSelectedVoteForResults] = useState<Vote | null>(null);
  const [voteResults, setVoteResults] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<InfoCard | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // Assuming a fetch function exists for reports
      // const response = await fetch...
      // setReports(result.data || []);
      toast.success("신고 목록을 불러왔습니다. (임시)");
    } catch (error) {
      toast.error('신고 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVotes = async () => {
    setIsLoading(true);
    try {
      // Assuming a fetch function exists for votes
      // const response = await fetch...
      // setVotes(result.data || []);
      toast.success("투표 목록을 불러왔습니다. (임시)");
    } catch (error) {
      toast.error('투표 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInfoCards = async () => {
    setIsLoading(true);
    try {
      const response = await infoCardApi.getAllCards();
      if (response.ok) {
        setInfoCards(response.data || []);
      } else {
        toast.error('콘텐츠 카드를 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'votes') {
      fetchVotes();
    } else if (activeTab === 'content') {
      fetchInfoCards();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button onClick={() => setActiveTab('reports')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              익명 신고 관리
            </button>
            <button onClick={() => setActiveTab('votes')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'votes' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              투표 관리
            </button>
            <button onClick={() => setActiveTab('content')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'content' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              콘텐츠 관리
            </button>
          </nav>
        </div>

        {activeTab === 'reports' && (
          <div className="bg-white shadow rounded-lg p-6">
            <p>익명 신고 관리 탭입니다.</p>
          </div>
        )}

        {activeTab === 'votes' && (
          <div className="bg-white shadow rounded-lg p-6">
            <p>투표 관리 탭입니다.</p>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">콘텐츠 카드 관리</h3>
              <button onClick={() => { setSelectedCard(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                새 카드 추가
              </button>
            </div>
            {isLoading ? (
              <div className="text-center py-10">로딩 중...</div>
            ) : (
              <div className="space-y-4">
                {infoCards.map(card => (
                  <div key={card.id} className="border p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{card.category}</span>
                      <h4 className="font-bold mt-2">{card.title}</h4>
                      <p className="text-sm text-gray-600">{card.summary}</p>
                      <a href={card.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">{card.linkUrl}</a>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => { setSelectedCard(card); setIsModalOpen(true); }} className="text-sm text-blue-600">수정</button>
                      <button onClick={async () => { if(window.confirm('정말 삭제하시겠습니까?')) { await infoCardApi.deleteCard(card.id); fetchInfoCards(); } }} className="text-sm text-red-600">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <InfoCardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchInfoCards} 
        card={selectedCard} 
      />
    </div>
  );
};

export default AdminDashboard;
