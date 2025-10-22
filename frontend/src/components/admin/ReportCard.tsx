'use client';

import { FC } from 'react';
import { ReportSummary } from '@/types/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface ReportCardProps {
  report: ReportSummary;
  onClick: () => void;
}

const getStatusStyle = (status: ReportSummary['status']) => {
  switch (status) {
    case 'RECEIVED': return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
    case 'RESOLVED': return 'bg-green-100 text-green-800';
    case 'REJECTED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ReportCard: FC<ReportCardProps> = ({ report, onClick }) => {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:bg-gray-50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">신고 ID: {report.reportId}</CardTitle>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(report.status)}`}>
            {report.status}
          </span>
        </div>
        <CardDescription>
          {new Date(report.createdAt).toLocaleString('ko-KR')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">신고자</p>
            <p>{report.reporterName}</p>
          </div>
          <div>
            <p className="font-semibold">피신고자</p>
            <p>{report.reportedName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
