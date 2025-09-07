'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import CompanySkeleton from '@/components/common/skeleton/CompanyRequests';
import CompanyDemandes from '@/components/tables/CompanyDemandes';
import { demande } from '@/types/demande';

type RequestsResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: demande[];
};

const Societies = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = pathname + searchParams.toString();
  const [responses, setResponses] = useState<RequestsResponse>({
    page: 1,
    pageSize: 5,
    total: 0,
    totalPages: 0,
    data: [],
  });
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const fetchRequests = useCallback(
    async (page: number, sort: 'newest' | 'oldest' = 'newest', date: string = '') => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: '4',
          sortOrder: sort,
        });

        // Add date filter if provided
        if (date) {
          params.append('date', date);
        }

        const res = await fetch(`/api/company/admin/requests?${params.toString()}`);

        if (!res.ok) {
          throw new Error('Failed to fetch requests');
        }

        const data = await res.json();
        setResponses(data.requests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchRequests(1, sortOrder, selectedDate);
  }, [fetchRequests, sortOrder, selectedDate]);

  const handlePageChange = (page: number) => {
    if (page !== responses.page && page >= 1 && page <= responses.totalPages) {
      fetchRequests(page, sortOrder, selectedDate);
    }
  };

  const handleSortChange = (newSortOrder: 'newest' | 'oldest') => {
    setSortOrder(newSortOrder);
    // Reset to page 1 when changing sort order
    fetchRequests(1, newSortOrder, selectedDate);
  };

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    // Reset to page 1 when changing date filter
    fetchRequests(1, sortOrder, date);
  };

  if (loading && responses.data.length === 0) {
    return <CompanySkeleton />;
  }

  return (
    <div key={routeKey} className="mx-auto min-h-screen max-w-270">
      <Breadcrumb pageName="Demandes" />

      <div className="flex flex-col gap-6">
        <CompanyDemandes
          demandeData={responses.data}
          pagination={{
            currentPage: responses.page,
            pageSize: responses.pageSize,
            totalPages: responses.totalPages,
          }}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onDateFilter={handleDateFilter}
          sortOrder={sortOrder}
          selectedDate={selectedDate}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Societies;
