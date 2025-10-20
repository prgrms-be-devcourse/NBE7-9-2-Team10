'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LoginRequest } from '@/types/user';
import { loginSchema } from '@/lib/utils/validation';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/utils/helpers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await login(data.email, data.password);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
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
          <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
          <p className="mt-2 text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입
            </a>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>계정에 로그인</CardTitle>
            <CardDescription>
              이메일과 비밀번호를 입력해주세요.
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
                label="이메일"
                type="email"
                placeholder="이메일을 입력하세요"
                error={errors.email?.message}
                {...register('email')}
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

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
