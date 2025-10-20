'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EmailVerificationService } from '@/lib/services/emailVerificationService';
import { getErrorMessage } from '@/lib/utils/helpers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

// 이메일 인증 스키마
const emailSchema = z.object({
  email: z.string()
    .email('올바른 이메일 형식이 아닙니다')
    .refine((email) => email.endsWith('.ac.kr'), {
      message: '학교 이메일(.ac.kr)만 인증 가능합니다'
    }),
});

const codeSchema = z.object({
  code: z.string().length(6, '인증코드는 6자리 숫자입니다').regex(/^[0-9]{6}$/, '숫자만 입력해주세요'),
});

interface EmailVerificationProps {
  email?: string;
  onVerificationComplete: (email: string) => void;
  onBack?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  email: initialEmail, 
  onVerificationComplete, 
  onBack 
}) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 이메일 입력 폼
  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: initialEmail || '' },
  });

  // 인증코드 입력 폼
  const codeForm = useForm<{ code: string }>({
    resolver: zodResolver(codeSchema),
  });

  const handleEmailSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    setError('');

    try {
      await EmailVerificationService.requestVerificationCode(data.email);
      setEmail(data.email);
      setStep('code');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (data: { code: string }) => {
    setIsLoading(true);
    setError('');

    try {
      await EmailVerificationService.verifyCode(email, data.code);
      onVerificationComplete(email);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      await EmailVerificationService.requestVerificationCode(email);
      // 성공 메시지는 Toast로 표시
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>이메일 인증</CardTitle>
          <CardDescription>
            회원가입을 위해 이메일 인증이 필요합니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Input
              label="학교 이메일"
              type="email"
              placeholder="예: student@university.ac.kr"
              error={emailForm.formState.errors.email?.message}
              {...emailForm.register('email')}
              required
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>학교 이메일만 인증 가능합니다.</strong><br />
                    .ac.kr로 끝나는 대학교 이메일 주소를 입력해주세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  뒤로
                </Button>
              )}
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? '전송 중...' : '인증코드 전송'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>인증코드 입력</CardTitle>
        <CardDescription>
          {email}로 전송된 6자리 인증코드를 입력해주세요.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Input
            label="인증코드"
            type="text"
            placeholder="6자리 인증코드"
            error={codeForm.formState.errors.code?.message}
            {...codeForm.register('code')}
            maxLength={6}
            required
          />

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-500 underline disabled:opacity-50"
            >
              인증코드 다시 받기
            </button>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('email')}
              className="flex-1"
            >
              이메일 변경
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '인증 중...' : '인증 완료'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
