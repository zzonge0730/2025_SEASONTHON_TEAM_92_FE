import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Vote, VoteResult, User } from '../types';

interface VoteBoxProps {
  proposalId: string;
  currentUser: User;
  onVoteChange?: (result: VoteResult) => void;
}

const VoteBox: React.FC<VoteBoxProps> = ({ proposalId, currentUser, onVoteChange }) => {
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetchVoteResult();
    fetchUserVote();
  }, [proposalId, currentUser.id]);

  const fetchVoteResult = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/votes/proposal/${proposalId}`);
      const result = await response.json();
      
      if (result.ok) {
        setVoteResult(result.data);
        onVoteChange?.(result.data);
      }
    } catch (error) {
      console.error('Error fetching vote result:', error);
    }
  };

  const fetchUserVote = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/votes/proposal/${proposalId}/user/${currentUser.id}`);
      const result = await response.json();
      
      if (result.ok && result.data) {
        setUserVote(result.data);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const submitVote = async (vote: 'agree' | 'disagree') => {
    if (!currentUser.id) {
      toast.error('You must be logged in to vote');
      return;
    }

    setIsVoting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          userId: currentUser.id,
          vote,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setVoteResult(result.data);
        setUserVote({
          id: userVote?.id,
          proposalId,
          userId: currentUser.id,
          vote,
        });
        onVoteChange?.(result.data);
        toast.success('Vote submitted successfully!');
      } else {
        toast.error(result.message || 'Failed to submit vote');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('Vote submission error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  if (!voteResult) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Vote on Proposal
      </h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Agree</span>
          <span className="text-sm text-gray-500">{voteResult.agreeVotes} votes</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${voteResult.agreePercentage}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">
          {voteResult.agreePercentage.toFixed(1)}%
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Disagree</span>
          <span className="text-sm text-gray-500">{voteResult.disagreeVotes} votes</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${voteResult.disagreePercentage}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">
          {voteResult.disagreePercentage.toFixed(1)}%
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mb-4">
        Total votes: {voteResult.totalVotes}
      </div>

      {currentUser.id && (
        <div className="space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={() => submitVote('agree')}
              disabled={isVoting}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userVote?.vote === 'agree'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isVoting ? 'Voting...' : 'Agree'}
            </button>
            <button
              onClick={() => submitVote('disagree')}
              disabled={isVoting}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userVote?.vote === 'disagree'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isVoting ? 'Voting...' : 'Disagree'}
            </button>
          </div>
          
          {userVote && (
            <p className="text-sm text-gray-600 text-center">
              You voted: <span className="font-medium capitalize">{userVote.vote}</span>
            </p>
          )}
        </div>
      )}

      {!currentUser.id && (
        <div className="text-center text-sm text-gray-500">
          Please log in to vote on this proposal
        </div>
      )}
    </div>
  );
};

export default VoteBox;
