'use client';

import { FC, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, content: string) => void;
  reportedUserName: string;
  isSubmitting: boolean;
}

const REPORT_CATEGORIES = [
  { value: '부적절한 언행', label: '부적절한 언행' },
  { value: '허위 정보', label: '허위 정보' },
  { value: '사기 의심', label: '사기 의심' },
  { value: '괴롭힘', label: '괴롭힘' },
  { value: '기타', label: '기타' },
];

const ReportModal: FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  reportedUserName,
  isSubmitting,
}) => {
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ category?: string; content?: string }>({});

  const handleSubmit = () => {
    // 유효성 검사
    const newErrors: { category?: string; content?: string } = {};
    
    if (!category) {
      newErrors.category = '신고 사유를 선택해주세요.';
    }
    
    if (!content.trim()) {
      newErrors.content = '신고 내용을 입력해주세요.';
    } else if (content.trim().length < 10) {
      newErrors.content = '신고 내용은 최소 10자 이상 입력해주세요.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(category, content);
  };

  const handleClose = () => {
    setCategory('');
    setContent('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`${reportedUserName}님 신고하기`} size="md">
      <div className="space-y-5">
        {/* 안내 문구 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">신고하기 전에 확인해주세요</p>
              <p className="text-xs">허위 신고는 제재 대상이 될 수 있습니다. 신중하게 작성해주세요.</p>
            </div>
          </div>
        </div>

        {/* 신고 사유 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            신고 사유 <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setErrors({ ...errors, category: undefined });
            }}
            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-colors ${
              errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          >
            <option value="">선택해주세요</option>
            {REPORT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* 신고 내용 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            신고 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors({ ...errors, content: undefined });
            }}
            placeholder="구체적인 신고 사유를 작성해주세요. (최소 10자)"
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-colors resize-none ${
              errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.content ? (
              <p className="text-sm text-red-500">{errors.content}</p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {content.length}/500자
              </p>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                신고 중...
              </>
            ) : (
              '신고하기'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal;

