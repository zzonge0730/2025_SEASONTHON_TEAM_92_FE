import { useState } from 'react';
import { Group, User } from '../types';
import VoteBox from './VoteBox';
import ProposalModal from './ProposalModal';

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
          <span>{group.groupSize} households</span>
        </div>
      </div>

      {/* Tenant Data */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Tenant Data</h4>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Average Rent:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(group.avgRentKrw)} KRW
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Median Rent:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(group.medianRentKrw)} KRW
          </span>
        </div>
        
        {group.avgNoticePct > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Notice %:</span>
            <span className="font-medium text-gray-900">
              {group.avgNoticePct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Market Data */}
      {group.marketData && group.marketData.transactionCount > 0 && (
        <div className="space-y-3 mb-6 p-3 bg-green-50 rounded-md">
          <h4 className="text-sm font-medium text-green-700 border-b border-green-200 pb-1">
            Market Data ({group.marketData.transactionCount} transactions)
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">Market Avg Rent:</span>
            <span className="font-medium text-green-900">
              {formatCurrencyK(group.marketData.avgMonthlyRent)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">Market Avg Deposit:</span>
            <span className="font-medium text-green-900">
              {formatCurrencyK(group.marketData.avgDeposit)}
            </span>
          </div>
          
          <div className="text-xs text-green-600">
            Latest: {group.marketData.recentTransactionDate}
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