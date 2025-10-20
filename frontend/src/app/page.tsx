import Link from "next/link";
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function Home() {
  return (
        <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* 히어로 섹션 */}
      <section className="text-center py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 opacity-50"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6 animate-fade-in">
            🏠 대학생 전용 룸메이트 매칭
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 animate-fade-in">
            나와 맞는 룸메이트를
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              찾아보세요
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            AI 기반 매칭 알고리즘으로
            <br />
            <span className="font-semibold text-gray-800 dark:text-gray-200">생활 습관과 성격</span>을 고려한
            <br />
            완벽한 룸메이트를 만나보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in">
            <Link href="/profile/create">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                ✨ 프로필 만들기
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                👀 프로필 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="py-20">
        <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium mb-4">
            🚀 핵심 기능
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Unimate의
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> 주요 기능</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            정교한 AI 매칭 알고리즘으로 당신에게 가장 적합한 룸메이트를 찾아드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">👤</span>
              </div>
              <CardTitle className="text-xl">상세한 프로필</CardTitle>
              <CardDescription className="text-base">
                수면 패턴, 청소 습관, MBTI 등 다양한 정보를 바탕으로 프로필을 만들어보세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  수면 시간 및 패턴
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  청소 빈도 및 위생 수준
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  MBTI 성격 유형
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  생활 습관 및 선호도
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🤖</span>
              </div>
              <CardTitle className="text-xl">스마트 매칭</CardTitle>
              <CardDescription className="text-base">
                AI 기반 매칭 알고리즘이 당신과 가장 잘 맞는 룸메이트를 찾아드립니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  생활 습관 호환성 분석
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  성격 유형 매칭
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  선호도 기반 추천
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  실시간 매칭 상태
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🛡️</span>
              </div>
              <CardTitle className="text-xl">안전한 소통</CardTitle>
              <CardDescription className="text-base">
                검증된 사용자들과 안전하게 소통하고 룸메이트를 만나보세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  대학생 인증 시스템
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  안전한 메시징
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  신고 및 차단 기능
          </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  개인정보 보호
          </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="relative py-24 px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 opacity-90"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 dark:bg-black/20 text-white text-sm font-medium mb-6 backdrop-blur-sm">
            🚀 지금 시작하세요
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            완벽한 룸메이트를
            <br />
            <span className="text-yellow-300">지금 만나보세요</span>
          </h2>
          <p className="text-xl text-white/90 dark:text-white mb-12 max-w-3xl mx-auto leading-relaxed">
            몇 분만에 프로필을 만들고,
            <br />
            AI가 추천하는 최적의 룸메이트를 찾아보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/profile/create">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
                ✨ 무료로 시작하기
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                🔑 로그인하기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
