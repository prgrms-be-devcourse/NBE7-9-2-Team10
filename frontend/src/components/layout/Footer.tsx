import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Unimate</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              대학생들을 위한 룸메이트 매칭 서비스입니다.
              <br />
              나와 맞는 룸메이트를 찾아보세요.
            </p>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">서비스</h4>
            <ul className="space-y-2">
              <li>
                <a href="/profile" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                  프로필 관리
                </a>
              </li>
              <li>
                <a href="/matches" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                  룸메이트 찾기
                </a>
              </li>
              <li>
                <a href="/chat" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                  채팅
                </a>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">문의</h4>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-400 text-sm">
                이메일: support@unimate.com
              </li>
              <li className="text-gray-600 dark:text-gray-400 text-sm">
                운영시간: 평일 09:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2025 Unimate. All rights reserved.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
              대학생들을 위한 안전한 룸메이트 매칭 플랫폼
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
