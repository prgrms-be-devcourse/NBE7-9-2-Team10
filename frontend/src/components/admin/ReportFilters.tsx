'use client';

import { FC, useState, ChangeEvent } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface ReportFiltersProps {
  onFilterChange: (filters: { status?: string | null; keyword?: string | null }) => void;
  initialFilters: { status: string | null; keyword: string | null };
}

const ReportFilters: FC<ReportFiltersProps> = ({ onFilterChange, initialFilters }) => {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');
  const [status, setStatus] = useState(initialFilters.status || '');

  const handleSearch = () => {
    onFilterChange({ status: status || null, keyword: keyword || null });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-6 flex items-center gap-4">
      <Select
        value={status}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
        className="w-48"
      >
        <option value="">전체 상태</option>
        <option value="RECEIVED">접수</option>
        <option value="IN_PROGRESS">처리 중</option>
        <option value="RESOLVED">처리 완료</option>
        <option value="REJECTED">반려</option>
      </Select>
      <Input
        type="text"
        placeholder="신고자 또는 피신고자 이름 검색"
        value={keyword}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
        className="flex-grow"
      />
      <Button onClick={handleSearch}>검색</Button>
    </div>
  );
};

export default ReportFilters;
