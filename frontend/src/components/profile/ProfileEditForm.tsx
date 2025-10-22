'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ProfileCreateRequest, ProfileResponse } from '@/types/profile';
import { profileCreateSchema } from '@/lib/utils/validation';
import { ProfileService } from '@/lib/services/profileService';
import { getErrorMessage } from '@/lib/utils/helpers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProfileEditFormProps {
  onSuccess?: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string>('');
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileCreateRequest>({
    resolver: zodResolver(profileCreateSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await ProfileService.getMyProfile();
        setProfile(profileData);
        
        // yyyy-MM-dd 형식으로 변환하는 헬퍼 함수
        const formatDateForInput = (dateString?: string) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString().split('T')[0];
        };

        // 폼에 기존 데이터 설정
        reset({
          sleepTime: profileData.sleepTime,
          isPetAllowed: profileData.isPetAllowed,
          isSmoker: profileData.isSmoker,
          cleaningFrequency: profileData.cleaningFrequency,
          preferredAgeGap: profileData.preferredAgeGap,
          hygieneLevel: profileData.hygieneLevel,
          isSnoring: profileData.isSnoring,
          drinkingFrequency: profileData.drinkingFrequency,
          noiseSensitivity: profileData.noiseSensitivity,
          guestFrequency: profileData.guestFrequency,
          mbti: profileData.mbti,
          startUseDate: formatDateForInput(profileData.startUseDate),
          endUseDate: formatDateForInput(profileData.endUseDate),
          matchingEnabled: profileData.matchingEnabled,
        });
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileCreateRequest) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await ProfileService.updateProfile(data);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/profile');
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="프로필을 불러오는 중..." />;
  }

  if (submitError && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                프로필을 불러올 수 없습니다
              </h3>
              <p className="text-red-600 mb-6">{submitError}</p>
              <div className="space-x-4">
                <Button onClick={() => window.location.reload()}>
                  다시 시도
                </Button>
                <Button variant="outline" onClick={() => router.push('/profile')}>
                  프로필 페이지로
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 옵션 데이터
  const timeOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i}:00`
  }));

  const frequencyOptions = [
    { value: 1, label: '매우 낮음' },
    { value: 2, label: '낮음' },
    { value: 3, label: '보통' },
    { value: 4, label: '높음' },
    { value: 5, label: '매우 높음' },
  ];

  const ageGapOptions = [
    { value: 0, label: '상관없음' },
    { value: 1, label: '1살 차이' },
    { value: 2, label: '2살 차이' },
    { value: 3, label: '3살 차이' },
    { value: 5, label: '5살 차이' },
    { value: 10, label: '10살 차이' },
  ];

  const mbtiOptions = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ].map(type => ({ value: type, label: type }));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">프로필 수정</CardTitle>
          <CardDescription>
            프로필 정보를 수정하고 업데이트할 수 있습니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            {/* 기본 생활 습관 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 생활 습관</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="평균 수면 시간"
                  placeholder="수면 시간을 선택하세요"
                  options={timeOptions}
                  error={errors.sleepTime?.message}
                  {...register('sleepTime', { valueAsNumber: true })}
                />

                <Select
                  label="청소 빈도"
                  placeholder="청소 빈도를 선택하세요"
                  options={frequencyOptions}
                  error={errors.cleaningFrequency?.message}
                  {...register('cleaningFrequency', { valueAsNumber: true })}
                />

                <Select
                  label="위생 수준"
                  placeholder="위생 수준을 선택하세요"
                  options={frequencyOptions}
                  error={errors.hygieneLevel?.message}
                  {...register('hygieneLevel', { valueAsNumber: true })}
                />

                <Select
                  label="음주 빈도"
                  placeholder="음주 빈도를 선택하세요"
                  options={frequencyOptions}
                  error={errors.drinkingFrequency?.message}
                  {...register('drinkingFrequency', { valueAsNumber: true })}
                />

                <Select
                  label="손님 초대 빈도"
                  placeholder="손님 초대 빈도를 선택하세요"
                  options={frequencyOptions}
                  error={errors.guestFrequency?.message}
                  {...register('guestFrequency', { valueAsNumber: true })}
                />

                <Select
                  label="소음 민감도"
                  placeholder="소음 민감도를 선택하세요"
                  options={frequencyOptions}
                  error={errors.noiseSensitivity?.message}
                  {...register('noiseSensitivity', { valueAsNumber: true })}
                />
              </div>
            </section>

            {/* 성격 및 선호도 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">성격 및 선호도</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="MBTI"
                  placeholder="MBTI를 선택하세요"
                  options={mbtiOptions}
                  error={errors.mbti?.message}
                  {...register('mbti')}
                />

                <Select
                  label="선호 연령대 차이"
                  placeholder="선호 연령대 차이를 선택하세요"
                  options={ageGapOptions}
                  error={errors.preferredAgeGap?.message}
                  {...register('preferredAgeGap', { valueAsNumber: true })}
                />
              </div>
            </section>

            {/* 생활 스타일 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">생활 스타일</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Checkbox
                    label="반려동물 허용"
                    {...register('isPetAllowed')}
                    error={errors.isPetAllowed?.message}
                  />
                  
                  <Checkbox
                    label="흡연자"
                    {...register('isSmoker')}
                    error={errors.isSmoker?.message}
                  />
                  
                  <Checkbox
                    label="코골이"
                    {...register('isSnoring')}
                    error={errors.isSnoring?.message}
                  />
                </div>
              </div>
            </section>

            {/* 사용 기간 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">사용 기간</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="사용 시작일"
                  type="date"
                  error={errors.startUseDate?.message}
                  {...register('startUseDate')}
                />

                <Input
                  label="사용 종료일"
                  type="date"
                  error={errors.endUseDate?.message}
                  {...register('endUseDate')}
                />
              </div>
            </section>

            {/* 매칭 설정 */}
            {/* <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">매칭 설정</h3>
              <Checkbox
                label="매칭 활성화 (다른 사용자들이 나를 찾을 수 있습니다)"
                {...register('matchingEnabled')}
                error={errors.matchingEnabled?.message}
              />
            </section> */}

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile')}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : '프로필 저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditForm;
