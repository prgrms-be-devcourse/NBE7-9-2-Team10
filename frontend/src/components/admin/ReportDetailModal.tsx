'use client';

import { useState, useEffect, FC } from 'react';
import { AdminService } from '@/lib/services/adminService';
import { ReportDetail } from '@/types/admin';
import { getErrorMessage } from '@/lib/utils/helpers';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ReportDetailModalProps {
  reportId: number;
  onClose: () => void;
}

const ReportDetailModal: FC<ReportDetailModalProps> = ({ reportId, onClose }) => {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await AdminService.getReportDetail(reportId);
        setReport((response as any).data || response || null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [reportId]);

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">신고 상세 정보</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">신고 ID: {reportId}</p>
        </div>
        
        {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
        {error && <p className="text-red-500 p-4 text-center">{error}</p>}
        
        {report && (
          <div className="space-y-4">
            <InfoSection title="신고 상태" data={report.status} />
            <InfoSection title="신고 유형" data={report.category} />
            <InfoSection title="신고 내용" data={report.content} preWrap />
            <hr className="dark:border-gray-700"/>
            <UserInfo title="신고자 정보" user={report.reporterInfo} />
            <hr className="dark:border-gray-700"/>
            <UserInfo title="피신고자 정보" user={report.reportedInfo} />
          </div>
        )}

        <div className="flex justify-end pt-6 mt-4 border-t">
          <Button variant="outline" onClick={onClose}>닫기</Button>
          {/* TODO: 신고 처리 로직 (예: 상태 변경) 버튼 추가 */}
        </div>
      </div>
    </Modal>
  );
};

const InfoSection: FC<{ title: string; data: string; preWrap?: boolean }> = ({ title, data, preWrap = false }) => (
  <div>
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className={`text-gray-600 mt-1 ${preWrap ? 'whitespace-pre-wrap' : ''}`}>{data}</p>
  </div>
);

const UserInfo: FC<{ title: string; user: ReportDetail['reporterInfo'] }> = ({ title, user }) => (
  <div>
    <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="text-sm text-gray-600 space-y-1">
      <p><strong>ID:</strong> {user.userId}</p>
      <p><strong>이름:</strong> {user.name}</p>
      <p><strong>이메일:</strong> {user.email}</p>
      <p><strong>학교:</strong> {user.university}</p>
    </div>
  </div>
);

export default ReportDetailModal;
