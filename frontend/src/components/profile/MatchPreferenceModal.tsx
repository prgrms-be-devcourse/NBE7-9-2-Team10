'use client';

import { useState, ChangeEvent, FC } from 'react';
import { options } from '@/lib/constants/preferenceOptions';
import { MatchService } from '@/lib/services/matchService';
import { MatchPreference } from '@/types/profile';
import { getErrorMessage } from '@/lib/utils/helpers';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface MatchPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // 저장 성공 시 호출될 콜백
}

// 재사용 가능한 질문 컴포넌트
const PreferenceQuestion: FC<{
  question: string;
  name: keyof MatchPreference;
  selectedValue: string | number | boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  optionSet: { label: string; value: string | number | boolean }[];
}> = ({ question, name, selectedValue, onChange, optionSet }) => (
  <div className="mb-4">
    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{question}</h4>
    <div className="flex flex-wrap gap-2">
      {optionSet.map((option) => (
        <label
          key={String(option.value)}
          className={`cursor-pointer px-3 py-1.5 border rounded-full text-sm transition-colors ${
            String(selectedValue) === String(option.value)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={String(option.value)}
            checked={String(selectedValue) === String(option.value)}
            onChange={onChange}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
);

const MatchPreferenceModal: FC<MatchPreferenceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<MatchPreference>({
    startUseDate: new Date().toISOString().slice(0, 10),
    endUseDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10),
    sleepTime: 2,
    isPetAllowed: false,
    isSmoker: false,
    cleaningFrequency: 3,
    preferredAgeGap: 1,
    hygieneLevel: 3,
    isSnoring: false,
    drinkingFrequency: 1,
    noiseSensitivity: 3,
    guestFrequency: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === 'radio') {
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else parsedValue = parseInt(value, 10);
    }
    if (type === 'range' || type === 'number') {
      parsedValue = parseInt(value, 10);
    }

    setPreferences((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleNext = () => setStep(2);
  const handlePrev = () => setStep(1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // TODO: 백엔드 API 엔드포인트 확정 후 matchService 수정 필요
      await MatchService.updatePreference(preferences);
      alert('선호도 등록이 완료되었습니다!');
      onSave(); // 부모 컴포넌트에 저장 성공 알림
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="매칭 선호도 등록">
      <div className="max-w-lg max-h-[80vh] overflow-y-auto p-1">
        <div className="text-center mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">룸메이트 매칭을 위해 선호하는 생활 습관과 조건을 입력해주세요.</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 my-4">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: step === 1 ? '50%' : '100%' }}></div>
        </div>

        <Card className="border-none shadow-none">
          <CardContent>
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">기본 조건</h3>
                <PreferenceQuestion question="흡연 여부" name="isSmoker" selectedValue={preferences.isSmoker} onChange={handleChange} optionSet={options.boolean} />
                <PreferenceQuestion question="코골이 허용 여부" name="isSnoring" selectedValue={preferences.isSnoring} onChange={handleChange} optionSet={options.boolean} />
                <PreferenceQuestion question="반려동물 허용 여부" name="isPetAllowed" selectedValue={preferences.isPetAllowed} onChange={handleChange} optionSet={options.boolean} />
                <PreferenceQuestion question="선호하는 연령대" name="preferredAgeGap" selectedValue={preferences.preferredAgeGap} onChange={handleChange} optionSet={options.preferredAgeRange} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">생활 습관</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startUseDate" className="block font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">시작 기간</label>
                    <input type="date" id="startUseDate" name="startUseDate" value={preferences.startUseDate} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"/>
                  </div>
                  <div>
                    <label htmlFor="endUseDate" className="block font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">종료 기간</label>
                    <input type="date" id="endUseDate" name="endUseDate" value={preferences.endUseDate} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"/>
                  </div>
                </div>
                <PreferenceQuestion question="수면 시간대" name="sleepTime" selectedValue={preferences.sleepTime} onChange={handleChange} optionSet={options.sleepTime} />
                <PreferenceQuestion question="음주 빈도" name="drinkingFrequency" selectedValue={preferences.drinkingFrequency} onChange={handleChange} optionSet={options.drinkingFrequency} />
                <PreferenceQuestion question="청소 빈도" name="cleaningFrequency" selectedValue={preferences.cleaningFrequency} onChange={handleChange} optionSet={options.cleaningFrequency} />
                <PreferenceQuestion question="방문자 빈도" name="guestFrequency" selectedValue={preferences.guestFrequency} onChange={handleChange} optionSet={options.guestFrequency} />
                <PreferenceQuestion question="위생 수준" name="hygieneLevel" selectedValue={preferences.hygieneLevel} onChange={handleChange} optionSet={options.hygieneLevel} />
                <PreferenceQuestion question="소음 민감도" name="noiseSensitivity" selectedValue={preferences.noiseSensitivity} onChange={handleChange} optionSet={options.noiseSensitivity} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 pt-4 border-t">
          {step === 1 && (
            <Button onClick={handleNext} className="w-full">다음</Button>
          )}
          {step === 2 && (
            <div className="flex gap-2 w-full">
              <Button onClick={handlePrev} variant="outline" className="w-full">이전</Button>
              <Button onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting} className="w-full">
                {isSubmitting ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MatchPreferenceModal;
