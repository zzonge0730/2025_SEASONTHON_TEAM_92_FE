import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    // Vercel처럼 엄격한 타입 체크 활성화
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint 설정 문제로 일시적으로 비활성화
    ignoreDuringBuilds: true,
  },
  // Vercel 배포를 위한 설정 (정적 export 제거)
  // output: 'export', // 동적 라우트 때문에 제거
};

export default nextConfig;
