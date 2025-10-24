'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/helpers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 렌더링되도록 마운트 상태 관리
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ESC 키로 모달 닫기 및 스크롤 방지
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div

      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"

      // className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"

      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full mx-4 dark:bg-gray-800',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={cn('p-6', !title && 'pt-6')}>
          {children}
        </div>
      </div>
    </div>
  );

  // 서버에서는 렌더링하지 않고, 클라이언트에서 마운트된 후에만 포탈을 통해 렌더링
  if (!isOpen || !isMounted) return null;

  return createPortal(modalContent, document.body);
};

export default Modal;
