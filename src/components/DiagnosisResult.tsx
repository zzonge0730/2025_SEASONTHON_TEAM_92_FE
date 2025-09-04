import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { diagnosisApi } from '../lib/api';

interface DiagnosisResultProps {
  currentUser: User;
}

const getScoreDescription = (score: number) => {
    if (score >= 3.5) return { text: '매우 좋음', color: 'text-blue-600' };
    if (score >= 2.5) return { text: '양호', color: 'text-green-600' };
    if (score >= 1.5) return { text: '개선 필요', color: 'text-yellow-600' };
    return { text: '심각', color: 'text-red-600' };
};

const formatQuestionId = (questionId: string): string => {
    switch (questionId) {
        case "noise_level": return "옆집 소음";
        case "noise_interfloor": return "층간 소음";
        case "water_pressure": return "수압";
        case "sunlight": return "채광";
        case "parking": return "주차";
        case "heating": return "난방";
        case "security": return "보안";
        default: return questionId;
    }
};

const ResultCard: React.FC<{ title: string; scores: { [key: string]: number } }> = ({ title, scores }) => (
    <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
            {Object.entries(scores).map(([key, value]) => {
                const scoreInfo = getScoreDescription(value);
                return (
                    <div key={key} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">{formatQuestionId(key)}</span>
                        <div>
                            <span className={`text-sm font-semibold ${scoreInfo.color}`}>{scoreInfo.text}</span>
                            <span className="text-xs text-gray-500 ml-2">({value.toFixed(1)}점)</span>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

export default function DiagnosisResult({ currentUser }: DiagnosisResultProps) {
    const [stats, setStats] = useState<DiagnosisStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser.id) {
            fetchStats();
        }
    }, [currentUser.id]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await diagnosisApi.getComparisonStats(currentUser.id!);
            if (response.ok && response.data) {
                setStats(response.data);
            } else {
                toast.error(response.message || '결과를 불러오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            toast.error('네트워크 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">결과를 분석하고 있습니다...</p>
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center py-10 text-red-500">결과를 불러올 수 없습니다.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">거주 환경 진단 결과</h2>
                <p className="mt-2 text-lg text-gray-500">나의 환경과 이웃의 환경을 비교해보세요.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResultCard title="나의 점수" scores={stats.userScores as any} />
                <ResultCard title="같은 건물 이웃 평균" scores={stats.buildingAverageScores as any} />
                <ResultCard title="같은 동네 이웃 평균" scores={stats.neighborhoodAverageScores as any} />
            </div>
        </div>
    );
}
