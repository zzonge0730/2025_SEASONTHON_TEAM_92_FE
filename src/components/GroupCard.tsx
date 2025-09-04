import { useState } from 'react';
import { Group, User } from '../types';
import VoteBox from './VoteBox';
import ProposalModal from './ProposalModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GroupCardProps {
  group: Group;
  currentUser: User;
}

export default function GroupCard({ group, currentUser }: GroupCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatCurrencyK = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '만원';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {group.label}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {group.scope}
          </span>
          <span>{group.groupSize} 가구</span>
        </div>
      </div>

      {/* 세입자 데이터 */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700 border-b pb-1">세입자 데이터</h4>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">평균 월세:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(group.avgRentKrw)}원
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">중간값 월세:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(group.medianRentKrw)}원
          </span>
        </div>
        
        {group.avgNoticePct > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">평균 인상 통지율:</span>
            <span className="font-medium text-gray-900">
              {group.avgNoticePct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Market Data Visualization */}
      {group.marketData && group.marketData.transactionCount > 0 && (
        <div className="space-y-3 mb-6 p-3 bg-green-50 rounded-md">
          <h4 className="text-sm font-medium text-green-700 border-b border-green-200 pb-1">
            시세 비교 ({group.marketData.transactionCount}건 거래)
          </h4>
          
          {/* Rent Comparison Chart */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: '우리 그룹',
                    월세: Math.round(group.avgRentKrw / 10000), // Convert to 만원
                    보증금: Math.round(group.avgRentKrw * 10 / 10000), // Estimate deposit as 10x rent
                  },
                  {
                    name: '시장 평균',
                    월세: Math.round(group.marketData.avgMonthlyRent / 10000),
                    보증금: Math.round(group.marketData.avgDeposit / 10000),
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [`${value}만원`, name]}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="월세" fill="#3B82F6" name="월세" />
                <Bar dataKey="보증금" fill="#10B981" name="보증금" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Key Insights */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded border">
              <div className="text-gray-600">우리 그룹 평균</div>
              <div className="font-medium text-gray-900">
                {formatCurrencyK(group.avgRentKrw)}
              </div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-gray-600">시장 평균</div>
              <div className="font-medium text-gray-900">
                {formatCurrencyK(group.marketData.avgMonthlyRent)}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-green-600">
            최근 거래: {group.marketData.recentTransactionDate}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          제안서 생성
        </button>
        
        <VoteBox 
          proposalId={group.groupId} 
          currentUser={currentUser}
        />
      </div>

      <ProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupId={group.groupId}
        currentUser={currentUser}
      />
    </div>
  );
}