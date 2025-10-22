'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gender } from '@/types/user';
import { RegisterService } from '@/lib/services/registerService';
import { ApiError, ERROR_CODES } from '@/types/api';
import Link from "next/link";

const RegisterForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [university, setUniversity] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  /** ------------------ 이메일 인증 ------------------ */
  const handleSendCode = async () => {
    if (!email || !email.endsWith('.ac.kr')) {
      setErrors({ email: '학교 이메일(.ac.kr)만 인증 가능합니다.' });
      return;
    }
    setLoading(true);
    setErrors({});
    setMessage('');

    try {
      await RegisterService.requestVerification(email);
      setIsCodeSent(true);
      setMessage('인증번호가 이메일로 전송되었습니다.');
    } catch (err) {
      const apiError = err as ApiError;
      setErrors({ email: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value);
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setErrors({ code: '인증번호를 입력해주세요.' });
      return;
    }
    if (code.length !== 6) {
      setErrors({ code: '인증번호는 6자리여야 합니다.' });
      return;
    }

    setLoading(true);
    try {
      await RegisterService.verifyEmailCode(email, code);
      setIsVerified(true);
      setMessage('이메일 인증이 완료되었습니다');
      setErrors({});
    } catch (err) {
      const apiError = err as ApiError;
      setErrors({ code: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  /** ------------------ 비밀번호 실시간 검증 ------------------ */
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const newErrors = { ...errors };
    if (value.length < 8)
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    else delete newErrors.password;

    if (confirmPassword && value !== confirmPassword)
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    else delete newErrors.confirmPassword;

    setErrors(newErrors);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const newErrors = { ...errors };

    if (password && value !== password)
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    else delete newErrors.confirmPassword;

    setErrors(newErrors);
  };

  /** ------------------ 회원가입 제출 ------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!isVerified) newErrors.email = '이메일 인증을 완료해주세요.';
    if (!password) newErrors.password = '비밀번호를 입력해주세요.';
    if (password.length < 8)
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    if (password !== confirmPassword)
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    if (!name) newErrors.name = '이름을 입력해주세요.';
    if (!birthDate) newErrors.birthDate = '생년월일을 입력해주세요.';
    if (!university) newErrors.university = '대학교명을 입력해주세요.';
    else if (!university.endsWith('대학교'))
      newErrors.university = '대학교명은 "대학교"로 끝나야 합니다.';
    if (!gender) newErrors.gender = '성별을 선택해주세요.';
    if (!agree) newErrors.agree = '이용약관에 동의해주세요.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await RegisterService.signup({
        email,
        password,
        name,
        gender: gender as Gender,
        birthDate,
        university,
      });
      alert('회원가입이 완료되었습니다!');
      router.push('/login');
    } catch (err) {
      const apiError = err as ApiError;

      // 에러 코드와 메시지에 따른 세분화된 처리
      if (apiError.errorCode === ERROR_CODES.BAD_REQUEST) {
        // 이메일 관련 에러는 email 필드에 표시
        if (apiError.message.includes('이메일')) {
          setErrors({ email: apiError.message });
          setIsVerified(false); // 인증 상태 초기화
        } else {
          setErrors({ form: apiError.message });
        }
      } else if (apiError.errorCode === ERROR_CODES.CONFLICT) {
        setErrors({ email: apiError.message });
        setIsVerified(false);
      } else {
        setErrors({ form: apiError.message });
      }
    } finally {
      setLoading(false);
    }
  };

  /** ------------------ UI 렌더 ------------------ */
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-3">
          U
        </div>
        <h2 className="text-xl font-semibold mb-1">계정 만들기</h2>
        <p className="text-sm text-gray-500 text-center">
          UniMate에 가입하여 완벽한 룸메이트를 찾아보세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <div className="flex space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@uni.ac.kr"
              className={`flex-1 border rounded-lg px-3 py-2 placeholder:text-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              disabled={isVerified}
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={loading || isVerified}
              className={`px-4 py-2 rounded-lg text-white ${isVerified
                ? 'bg-green-500 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isVerified ? '인증 완료' : '인증번호 전송'}
            </button>
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* 인증번호 */}
        {isCodeSent && !isVerified && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">인증번호</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={code}
                onChange={handleCodeInput}
                placeholder="인증번호 6자리 입력"
                maxLength={6}
                className={`flex-1 border rounded-lg px-3 py-2 placeholder:text-gray-400 ${errors.code ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                확인
              </button>
            </div>
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>
        )}

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className={`w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 ${errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            className={`w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className={`w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 ${errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* 생년월일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
          <input
            type="date"
            value={birthDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setBirthDate(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 ${errors.birthDate ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
          />
          {errors.birthDate && (
            <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
          )}
        </div>

        {/* 대학교 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">대학교</label>
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="예: 서울대학교"
            className={`w-full border rounded-lg px-3 py-2 placeholder:text-gray-400 ${errors.university ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
          />
          {errors.university && (
            <p className="text-red-500 text-sm mt-1">{errors.university}</p>
          )}
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="MALE"
                checked={gender === 'MALE'}
                onChange={() => setGender(Gender.MALE)}
              />
              <span>남성</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                checked={gender === 'FEMALE'}
                onChange={() => setGender(Gender.FEMALE)}
              />
              <span>여성</span>
            </label>
          </div>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        {/* 이용약관 */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <label className="text-sm text-gray-600">
            이용약관 및 개인정보처리방침에 동의합니다
          </label>
        </div>
        {errors.agree && <p className="text-red-500 text-sm">{errors.agree}</p>}

        {/* 성공/에러 메시지 */}
        {message && <p className="text-blue-600 text-sm">{message}</p>}
        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '가입 중...' : '다음'}
        </button>
        <div className="text-center text-sm text-gray-600 mt-6">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            로그인
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;