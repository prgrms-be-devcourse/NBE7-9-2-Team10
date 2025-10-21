'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services/adminService';
import { ReportSummary } from '@/types/admin';
import { getErrorMessage } from '@/lib/utils/helpers';

interface ReportsFilter {
  status: string | null;
  keyword: string | null;
}

export const useReports = (initialPage = 0, initialSize = 10) => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportsFilter>({ status: null, keyword: null });

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AdminService.getReports(page, initialSize, filters.status, filters.keyword);
      // TODO: 백엔드 응답 구조에 맞춰 데이터 추출 로직 수정 필요
      const data = response.data;
      if (data && data.content) {
        setReports(data.content);
        setTotalPages(data.totalPages);
      } else {
        setReports([]);
        setTotalPages(0);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, initialSize, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: Partial<ReportsFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // 필터 변경 시 첫 페이지로 리셋
  };

  return {
    reports,
    isLoading,
    error,
    page,
    totalPages,
    handlePageChange,
    handleFilterChange,
    filters,
  };
};
