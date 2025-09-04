import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { groupApi } from '../lib/api';
import { Group, User } from '../types';
import GroupCard from '../components/GroupCard';
import LetterModal from '../components/LetterModal';

interface GroupsPageProps {
  currentUser: User;
}

export default function GroupsPage({ currentUser }: GroupsPageProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'building' | 'neighborhood'>('building');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await groupApi.getGroups(scope);
      if (response.ok) {
        // 중복된 groupId를 가진 그룹들을 제거
        const uniqueGroups = (response.data || []).reduce((acc: Group[], current: Group) => {
          const existingGroup = acc.find(group => group.groupId === current.groupId);
          if (!existingGroup) {
            acc.push(current);
          } else {
            // 중복된 그룹이 있으면 더 많은 세입자를 가진 그룹을 유지
            if (current.groupSize > existingGroup.groupSize) {
              const index = acc.findIndex(group => group.groupId === current.groupId);
              acc[index] = current;
            }
          }
          return acc;
        }, []);
        setGroups(uniqueGroups);
      } else {
        toast.error(response.message || '그룹을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('그룹을 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [scope]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          세입자 그룹
        </h1>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setScope('building')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              scope === 'building'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            건물별
          </button>
          <button
            onClick={() => setScope('neighborhood')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              scope === 'neighborhood'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            지역별
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">그룹이 없습니다.</p>
          <p className="text-gray-400 mt-2">
            월세 정보를 제출하여 공동 협상을 위한 그룹을 만들어보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {selectedGroup && (
        <LetterModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          group={selectedGroup}
        />
      )}
    </div>
  );
}