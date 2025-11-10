'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import TableSkeleton from '@/components/common/skeleton/Demandes';
import MesDemandes from '@/components/tables/MesDemandes';
import { demande } from '@/types/demande';

type RequestsResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: demande[];
};

const SocietiesContent = () => {
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

  const fetchRequests = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/freelance/requests?page=${page}&pageSize=5`);

      if (!res.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await res.json();
      setResponses(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRequests(1);
  }, [fetchRequests]);

  const handlePageChange = (page: number) => {
    if (page !== responses.page && page >= 1 && page <= responses.totalPages) {
      fetchRequests(page);
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }
  return (
    <div key={routeKey} className="mx-auto min-h-screen max-w-270">
      <Breadcrumb pageName="Demandes" />

      <div className="flex flex-col gap-6">
        <MesDemandes
          demandeData={responses.data}
          pagination={{
            currentPage: responses.page,
            pageSize: responses.pageSize,
            totalPages: responses.totalPages,
          }}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

const Societies = () => {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <SocietiesContent />
    </Suspense>
  );
};

export default Societies;
