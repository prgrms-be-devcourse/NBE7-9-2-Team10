'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthService from '@/lib/services/AdminAuthService';
import Link from 'next/link';

const AdminLoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** ------------------ 로그인 제출 ------------------ */
  /** ------------------ 로그인 제출 ------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = '이메일을 입력해주세요.';
    if (!password) newErrors.password = '비밀번호를 입력해주세요.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = '이메일을 입력해주세요.';
    if (!password) newErrors.password = '비밀번호를 입력해주세요.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setErrors({});
    setLoading(true);

    try {
      await AdminAuthService.login({ email, password });
      router.push('/admin/dashboard');
    } catch (err: any) {
      const backendMessage = err?.message || '로그인 중 오류가 발생했습니다.';
      const status = err?.status;

      if (status === 404) {
        setErrors({ email: backendMessage });
      } else if (status === 401) {
        setErrors({ password: backendMessage });
      } else {
        setErrors({ form: backendMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-3">
          A
        </div>
        <h2 className="text-xl font-semibold mb-1">관리자 로그인</h2>
        <p className="text-sm text-gray-500 text-center">
          관리자 권한으로 시스템에 접근합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이메일 */}
        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            관리자 이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@unimate.com"
            className={`w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-red-500`}
            className={`w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-red-500`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* 비밀번호 */}
        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className={`w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-red-500`}
            className={`w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-red-500`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* 에러 메시지 */}
        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
        {/* 에러 메시지 */}
        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

        {/* 로그인 버튼 */}
        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg mt-2 hover:bg-red-700 disabled:bg-gray-400"
          className="w-full bg-red-600 text-white py-2 rounded-lg mt-2 hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? '로그인 중...' : '관리자 로그인'}
        </button>

        {/* 회원가입 링크 */}
        {/* 회원가입 링크 */}
        <div className="text-center text-sm text-gray-600 mt-6">
          관리자 계정이 없으신가요?{' '}
          <Link href="/admin/signup" className="text-red-600 hover:underline font-medium">
            관리자 회원가입
          </Link>
        </div>

        <div className="text-center text-sm text-gray-600 mt-2">
          일반 사용자이신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            사용자 로그인
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginForm;