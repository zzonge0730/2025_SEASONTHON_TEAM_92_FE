import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { InfoCard } from '../types';
import { infoCardApi } from '../lib/api';

const getCategoryStyle = (category: string) => {
    switch (category) {
        case 'POLICY':
            return { bg: 'bg-blue-100', text: 'text-blue-800' };
        case 'LAW':
            return { bg: 'bg-green-100', text: 'text-green-800' };
        case 'NEWS':
            return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};

export default function InfoCardListPage() {
    const [cards, setCards] = useState<InfoCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        setIsLoading(true);
        try {
            const response = await infoCardApi.getAllCards();
            if (response.ok && response.data) {
                setCards(response.data);
            } else {
                toast.error(response.message || '정보를 불러오는 데 실패했습니다.');
            }
        } catch (error) {
            toast.error('네트워크 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-20">...불러오는 중...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-extrabold text-gray-900">정책 및 법률 정보</h1>
                <p className="mt-2 text-lg text-gray-500">임대차 계약 시 알아두면 좋은 유용한 정보들을 확인하세요.</p>
            </div>

            <div className="space-y-6">
                {cards.length > 0 ? (
                    cards.map(card => {
                        const categoryStyle = getCategoryStyle(card.category);
                        return (
                            <a 
                                key={card.id} 
                                href={card.linkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}>
                                        {card.category}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(card.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-gray-900">{card.title}</h3>
                                <p className="mt-2 text-sm text-gray-600">{card.summary}</p>
                            </a>
                        );
                    })
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p>아직 등록된 정보가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
