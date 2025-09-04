import { useState } from 'react';
import { NegotiationReport } from '../types';
import toast from 'react-hot-toast';

interface ReportSharingProps {
  report: NegotiationReport;
  onClose: () => void;
}

export default function ReportSharing({ report, onClose }: ReportSharingProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(report.reportUrl);
      setCopied(true);
      toast.success('링크가 클립보드에 복사되었습니다!');
      
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const shareToKakao = () => {
    const message = `거주 환경 분석 리포트를 공유합니다.\n\n${report.title}\n\n링크: ${report.reportUrl}`;
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(report.reportUrl)}&text=${encodeURIComponent(message)}`;
    window.open(kakaoUrl, '_blank');
  };

  const shareToSMS = () => {
    const message = `거주 환경 분석 리포트를 공유합니다.\n\n${report.title}\n\n링크: ${report.reportUrl}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">리포트 공유하기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{report.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{report.summary}</p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>팁:</strong> 이 링크를 임대인에게 전달하세요. 
              임대인은 회원가입 없이도 리포트를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* 링크 복사 */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={report.reportUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>

          {/* 공유 버튼들 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareToKakao}
              className="flex items-center justify-center space-x-2 bg-yellow-400 text-white py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
            >
              <span>💬</span>
              <span>카톡 공유</span>
            </button>
            
            <button
              onClick={shareToSMS}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              <span>📱</span>
              <span>문자 공유</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• 이 리포트는 {new Date(report.createdAt).toLocaleDateString('ko-KR')}에 생성되었습니다.</p>
            <p>• 임대인이 링크를 클릭하면 리포트를 열람할 수 있습니다.</p>
            <p>• 리포트 열람 통계는 실시간으로 업데이트됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}