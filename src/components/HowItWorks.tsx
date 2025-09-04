
export default function HowItWorks() {
  const steps = [
    {
      title: '월세 제보',
      desc: '현재 거주지의 월세 정보를 간단히 입력하면, 같은 지역의 데이터로 비교가 가능해요.',
      icon: '🏘️',
    },
    {
      title: '리포트 확인',
      desc: '같은 건물/인근 지역의 시세 변화와 거래 목록을 한눈에 확인해요.',
      icon: '📊',
    },
    {
      title: '제안서 발송',
      desc: '데이터 기반 제안서를 자동으로 작성해, 링크로 간편하게 공유해요.',
      icon: '📨',
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-10">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          서비스 이용 방법
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          간단한 3단계로 똑똑하게 협상하세요
        </p>
      </div>
      
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, index) => (
          <div key={s.title} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <span className="text-lg sm:text-xl">{s.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mr-2">
                    {index + 1}단계
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
                  {s.title}
                </h3>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
