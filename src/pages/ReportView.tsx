import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, AdvancedReport } from '../types';
import { reportApi } from '../lib/api';

interface ReportViewProps {
  currentUser: User;
}

const ReportView: React.FC<ReportViewProps> = ({ currentUser }) => {
    const [report, setReport] = useState<AdvancedReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser.id) {
            fetchReport();
        }
    }, [currentUser.id]);

    const fetchReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await reportApi.getAdvancedReport(currentUser.id!);
            if (response.ok && response.data) {
                setReport(response.data);
            } else {
                setError(response.message || '리포트를 생성할 수 없습니다.');
                toast.error(response.message || '리포트를 생성할 수 없습니다.');
            }
        } catch (err: any) {
            const message = err.response?.data?.message || '리포트 생성 중 오류가 발생했습니다.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success('리포트 링크가 클립보드에 복사되었습니다!');
        }, () => {
            toast.error('링크 복사에 실패했습니다.');
        });
    };

    if (isLoading) {
        return <div className="text-center py-20">...리포트 생성 중...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-600 bg-red-50 p-8 rounded-lg">{error}</div>;
    }

    if (!report) {
        return <div className="text-center py-20">리포트 데이터가 없습니다.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">맞춤형 협상 리포트</h1>
                    <p className="text-gray-500">데이터를 기반으로 현명한 협상을 준비하세요.</p>
                </div>
                <button onClick={handleShare} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">공유하기</button>
            </div>

            {/* Section 1: Negotiation Strategies */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-4">핵심 협상 전략</h2>
                <div className="space-y-3">
                    {report.negotiationStrategies.map((tip, index) => (
                        <div key={index} className="p-4 rounded-md bg-indigo-50 border border-indigo-200">
                            <p className="font-medium text-indigo-800">{tip.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 2: Rent Comparison */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">월세 비교</h2>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">나의 월세</p>
                        <p className="text-2xl font-bold text-gray-900">{report.userProfile.monthlyRent?.toLocaleString()}원</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">동네 평균 월세</p>
                        <p className="text-2xl font-bold text-gray-900">{(report.marketData.avgMonthlyRent * 10000).toLocaleString()}원</p>
                    </div>
                </div>
            </div>

            {/* Section 3: Diagnosis Comparison */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">거주 환경 진단 비교</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-center text-gray-700">나의 환경 점수와 이웃들의 점수를 비교한 상세 차트가 여기에 표시됩니다.</p>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
