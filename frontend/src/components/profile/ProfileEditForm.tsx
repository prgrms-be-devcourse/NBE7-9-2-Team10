'use client';

import React, { useState, useEffect, ChangeEvent, FC } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileCreateRequest, ProfileResponse } from '@/types/profile';
import { ProfileService } from '@/lib/services/profileService';
import { getErrorMessage, calculateAge, getAgeRangeFromAge } from '@/lib/utils/helpers';
import { options } from '@/lib/constants/preferenceOptions';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProfileEditFormProps {
  onSuccess?: () => void;
}

// 재사용 가능한 질문 컴포넌트
const PreferenceQuestion: FC<{
  question: string;
  name: keyof ProfileCreateRequest;
  selectedValue: string | number | boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  optionSet: { label: string; value: string | number | boolean }[];
  disabled?: boolean;
}> = ({ question, name, selectedValue, onChange, optionSet, disabled }) => (
  <div className="mb-4">
    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{question}</h4>
    <div className="flex flex-wrap gap-2">
      {optionSet.map((option) => (
        <label
          key={String(option.value)}
          className={`${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} px-3 py-1.5 border rounded-full text-sm transition-colors ${
            String(selectedValue) === String(option.value)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={String(option.value)}
            checked={String(selectedValue) === String(option.value)}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
);

const ProfileEditForm: FC<ProfileEditFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileCreateRequest>({
    startUseDate: new Date().toISOString().slice(0, 10),
    endUseDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10),
    sleepTime: 2,
    isPetAllowed: false,
    isSmoker: false,
    cleaningFrequency: 3,
    preferredAgeGap: 0,
    hygieneLevel: 3,
    isSnoring: false,
    drinkingFrequency: 1,
    noiseSensitivity: 3,
    guestFrequency: 2,
    mbti: 'ISTJ',
    matchingEnabled: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await ProfileService.getMyProfile();
        // user의 나이로부터 자동으로 나이대 계산
        const autoAgeRange = user?.birthDate ? getAgeRangeFromAge(calculateAge(user.birthDate)) : profileData.preferredAgeGap;
        
        setProfile({
          sleepTime: profileData.sleepTime,
          isPetAllowed: profileData.isPetAllowed,
          isSmoker: profileData.isSmoker,
          cleaningFrequency: profileData.cleaningFrequency,
          preferredAgeGap: autoAgeRange,
          hygieneLevel: profileData.hygieneLevel,
          isSnoring: profileData.isSnoring,
          drinkingFrequency: profileData.drinkingFrequency,
          noiseSensitivity: profileData.noiseSensitivity,
          guestFrequency: profileData.guestFrequency,
          mbti: profileData.mbti,
          startUseDate: profileData.startUseDate,
          endUseDate: profileData.endUseDate,
          matchingEnabled: profileData.matchingEnabled,
        });
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === 'radio') {
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!isNaN(Number(value))) parsedValue = parseInt(value, 10);
      else parsedValue = value; // MBTI string
    }
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setProfile((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await ProfileService.updateProfile(profile);

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

  if (submitError && !profile.mbti) {
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                프로필을 불러올 수 없습니다
              </h3>
              <p className="text-red-600 mb-6">{submitError}</p>
              <div className="space-x-4">
                <Button onClick={() => window.location.reload()}>다시 시도</Button>
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

  const progressPercentage = (step / 2) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">프로필 수정</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">프로필 정보를 수정하고 업데이트할 수 있습니다.</p>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 my-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-2">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">기본 조건</h3>
                <PreferenceQuestion
                  question="흡연 여부"
                  name="isSmoker"
                  selectedValue={profile.isSmoker ?? false}
                  onChange={handleChange}
                  optionSet={options.boolean}
                />
                <PreferenceQuestion
                  question="코골이 여부"
                  name="isSnoring"
                  selectedValue={profile.isSnoring ?? false}
                  onChange={handleChange}
                  optionSet={options.boolean}
                />
                <PreferenceQuestion
                  question="반려동물 여부"
                  name="isPetAllowed"
                  selectedValue={profile.isPetAllowed ?? false}
                  onChange={handleChange}
                  optionSet={options.boolean}
                />
                <PreferenceQuestion
                  question="나이대"
                  name="preferredAgeGap"
                  selectedValue={profile.preferredAgeGap ?? 0}
                  onChange={handleChange}
                  optionSet={options.preferredAgeRange}
                  disabled={true}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">생활 습관</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="startUseDate" className="block font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">
                     룸쉐어 기간
                    </label>
                    <input
                      type="date"
                      id="startUseDate"
                      name="startUseDate"
                      value={profile.startUseDate}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="endUseDate" className="block font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">
                      종료 기간
                    </label>
                    <input
                      type="date"
                      id="endUseDate"
                      name="endUseDate"
                      value={profile.endUseDate}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
                    />
                  </div>
                </div>
                <PreferenceQuestion
                  question="수면 시간대"
                  name="sleepTime"
                  selectedValue={profile.sleepTime ?? 2}
                  onChange={handleChange}
                  optionSet={options.sleepTime}
                />
                <PreferenceQuestion
                  question="음주 빈도"
                  name="drinkingFrequency"
                  selectedValue={profile.drinkingFrequency ?? 1}
                  onChange={handleChange}
                  optionSet={options.drinkingFrequency}
                />
                <PreferenceQuestion
                  question="청소 빈도"
                  name="cleaningFrequency"
                  selectedValue={profile.cleaningFrequency ?? 3}
                  onChange={handleChange}
                  optionSet={options.cleaningFrequency}
                />
                <PreferenceQuestion
                  question="방문자 빈도"
                  name="guestFrequency"
                  selectedValue={profile.guestFrequency ?? 2}
                  onChange={handleChange}
                  optionSet={options.guestFrequency}
                />
                <PreferenceQuestion
                  question="위생 수준"
                  name="hygieneLevel"
                  selectedValue={profile.hygieneLevel ?? 3}
                  onChange={handleChange}
                  optionSet={options.hygieneLevel}
                />
                <PreferenceQuestion
                  question="소음 민감도"
                  name="noiseSensitivity"
                  selectedValue={profile.noiseSensitivity ?? 3}
                  onChange={handleChange}
                  optionSet={options.noiseSensitivity}
                />
                 <PreferenceQuestion
                  question="MBTI"
                  name="mbti"
                  selectedValue={profile.mbti ?? 'ISTJ'}
                  onChange={handleChange}
                  optionSet={options.mbti}
                />
              </div>
            )}

          </div>

          <div className="mt-6 pt-4 border-t">
            {step === 1 && (
              <div className="flex gap-2 w-full">
                <Button onClick={() => router.push('/profile')} variant="outline" className="w-full">
                  취소
                </Button>
                <Button onClick={handleNext} className="w-full">
                  다음
                </Button>
              </div>
            )}
            {step === 2 && (
              <div className="flex gap-2 w-full">
                <Button onClick={handlePrev} variant="outline" className="w-full">
                  이전
                </Button>
                <Button onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? '저장 중...' : '프로필 저장'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditForm;
