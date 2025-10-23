'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthService from '@/lib/services/AdminAuthService';
import Link from 'next/link';

const AdminLoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AdminAuthService.login({ email, password });
      alert('관리자 로그인 성공!');
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            관리자 이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@unimate.com"
            className="w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg mt-4 hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? '로그인 중...' : '관리자 로그인'}
        </button>

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