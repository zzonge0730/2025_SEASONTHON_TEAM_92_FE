import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DiagnosisStats } from '../types';

interface ComparisonChartProps {
  stats: DiagnosisStats;
}

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

const ComparisonChart: React.FC<ComparisonChartProps> = ({ stats }) => {
    const chartData = Object.keys(stats.userScores).map(key => ({
        name: formatQuestionId(key),
        '나의 점수': stats.userScores[key]?.toFixed(1),
        '건물 평균': stats.buildingAverageScores[key]?.toFixed(1),
        '동네 평균': stats.neighborhoodAverageScores[key]?.toFixed(1),
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="나의 점수" fill="#8884d8" />
                    <Bar dataKey="건물 평균" fill="#82ca9d" />
                    <Bar dataKey="동네 평균" fill="#ffc658" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ComparisonChart;
