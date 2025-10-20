'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { AuthService } from '@/lib/services/authService';
import { getErrorMessage } from '@/lib/utils/helpers';
import { Gender } from '@/types/user';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import EmailVerification from './EmailVerification';

// 회원가입 스키마
const registerSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
  gender: z.nativeEnum(Gender).refine(val => val !== undefined, {
    message: '성별을 선택해주세요'
  }),
  birthDate: z.string().min(1, '생년월일을 입력해주세요'),
  university: z.string().min(2, '대학교명을 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [step, setStep] = useState<'email-verification' | 'form'>('email-verification');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleEmailVerificationComplete = (email: string) => {
    setVerifiedEmail(email);
    setValue('email', email);
    setStep('form');
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 백엔드 API 형식에 맞게 데이터 변환
      const signupData = {
        name: data.name,
        email: verifiedEmail, // 인증된 이메일 사용
        password: data.password,
        gender: data.gender,
        birthDate: data.birthDate,
        university: data.university,
      };

      await AuthService.signup(signupData);
      
      alert('회원가입이 완료되었습니다!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/login');
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Unimate</h1>
          <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
          <p className="mt-2 text-sm text-gray-600">
            대학생 룸메이트 매칭 서비스
          </p>
          <p className="mt-1 text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              로그인
            </a>
          </p>
        </div>

        {step === 'email-verification' ? (
          <EmailVerification
            onVerificationComplete={handleEmailVerificationComplete}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>새 계정 만들기</CardTitle>
              <CardDescription>
                룸메이트 매칭을 위해 회원가입을 진행해주세요.
                <br />
                <span className="text-green-600 font-medium">
                  ✓ 이메일 인증 완료: {verifiedEmail}
                </span>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}

                <Input
                  label="이름"
                  placeholder="이름을 입력하세요"
                  error={errors.name?.message}
                  {...register('name')}
                  required
                />

                <Input
                  label="이메일"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  error={errors.email?.message}
                  {...register('email')}
                  value={verifiedEmail}
                  disabled
                  required
                />

                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  error={errors.password?.message}
                  {...register('password')}
                  required
                />

                <Input
                  label="비밀번호 확인"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                  required
                />

                <Select
                  label="성별"
                  placeholder="성별을 선택하세요"
                  error={errors.gender?.message}
                  options={[
                    { value: '', label: '성별 선택' },
                    { value: Gender.MALE, label: '남성' },
                    { value: Gender.FEMALE, label: '여성' }
                  ]}
                  {...register('gender')}
                  required
                />

                <Input
                  label="생년월일"
                  type="date"
                  placeholder="생년월일을 입력하세요"
                  error={errors.birthDate?.message}
                  {...register('birthDate')}
                  required
                />

                <Input
                  label="대학교"
                  placeholder="대학교명을 입력하세요"
                  error={errors.university?.message}
                  {...register('university')}
                  required
                />

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('email-verification')}
                    className="flex-1"
                  >
                    이메일 변경
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? '회원가입 중...' : '회원가입'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
