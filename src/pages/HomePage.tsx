import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface HomePageProps {
  onShowLogin: () => void;
}

export default function HomePage({ onShowLogin }: HomePageProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-md'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={scrollToTop}>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <i className="ri-home-heart-line text-white text-sm"></i>
                </div>
                <h1
                  className={`text-xl font-bold transition-colors ${
                    isScrolled ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  월세 공동협약 네트워크
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className={`font-medium transition-colors cursor-pointer ${
                  isScrolled
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-white hover:text-gray-200'
                }`}
              >
                기능
              </a>
              <a
                href="#usage"
                className={`font-medium transition-colors cursor-pointer ${
                  isScrolled
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-white hover:text-gray-200'
                }`}
              >
                사용법
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onShowLogin}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition-all whitespace-nowrap cursor-pointer"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                공정한 월세,
                <br />
                함께 만들어요
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                AI 분석과 그룹 협상으로 합리적인 월세를 만들어가는
                <br />
                20대를 위한 스마트한 월세 협상 플랫폼
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onShowLogin}
                  className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all whitespace-nowrap cursor-pointer text-center"
                >
                  로그인하기
                </button>
                <Link
                  to="/guide"
                  className="border-2 border-white/50 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all whitespace-nowrap cursor-pointer text-center"
                >
                  무료 진단 받기
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="https://readdy.ai/api/search-image?query=modern%20clean%20website%20interface%20mockup%20on%20laptop%20screen%20showing%20rental%20price%20analysis%20dashboard%20with%20gray%20and%20white%20color%2C%20professional%20minimal%20design%2C%20realistic%20device%20mockup%20against%20dark%20background&width=600&height=400&seq=rental-website-mockup-gray&orientation=landscape"
                  alt="월세 공동협약 네트워크 웹사이트"
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              왜 월세 공동협약 네트워크인가요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              혼자서는 어려운 월세 협상을 이웃들과 함께 데이터로 승부하세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-group-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">이웃 데이터 공유</h3>
              <p className="text-gray-600 text-center">
                같은 건물, 같은 동네 이웃들과 거주 환경 데이터를 공유하여 객관적인 비교 기준을 만듭니다.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-file-chart-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">맞춤형 협상 리포트</h3>
              <p className="text-gray-600 text-center">
                수집된 데이터를 바탕으로 실질적이고 구체적인 협상 전략과 근거를 제공합니다.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-shield-check-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">법적 근거 제공</h3>
              <p className="text-gray-600 text-center">
                주택임대차보호법 등 관련 법령을 근거로 한 합리적인 협상 자료를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="usage" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              어떻게 작동하나요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              단 4단계로 시작하는 스마트한 월세 협상
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">가입 및 진단</h3>
              <p className="text-gray-600">간단한 거주 환경 진단을 통해 데이터를 수집합니다.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">데이터 공유</h3>
              <p className="text-gray-600">이웃들과 익명으로 데이터를 공유하여 비교 기준을 만듭니다.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">리포트 생성</h3>
              <p className="text-gray-600">개인 맞춤형 협상 리포트를 생성합니다.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-2xl">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">협상 실행</h3>
              <p className="text-gray-600">객관적 근거를 바탕으로 성공적인 협상을 진행합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">지금 시작해보세요!</h2>
          <p className="text-xl text-gray-300 mb-8">
            이웃들과 함께 더 나은 거주 환경을 만들어가세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onShowLogin}
              className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-right-line mr-2"></i>
              무료로 시작하기
            </button>
            <Link
              to="/guide"
              className="border-2 border-white/50 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-book-open-line mr-2"></i>
              협상 가이드 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 월세 공동협약 네트워크. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}