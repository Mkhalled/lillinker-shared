'use client';
import { Skeleton } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import MesDemandes from '@/components/tables/MesDemandes';
import { demande } from '@/types/demande';

type RequestsResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: demande[];
};

const Societies = () => {
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
      const res = await fetch(`/api/company/admin/requests?page=${page}&pageSize=5`);
      
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
    return (
      <div className="mx-auto min-h-screen max-w-270">
        <Breadcrumb pageName="Demandes" />
        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            {/* Table Container */}
            <div className="px-5 pb-2.5 pt-6 sm:px-7.5 xl:pb-1">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="min-w-[80px] px-4 py-4 font-medium text-black dark:text-white">ID</th>
                      <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">TJM</th>
                      <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Date</th>
                      <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">Priorité</th>
                      <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">Status</th>
                      <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">Reponses</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <Skeleton variant="text" width={40} height={20} />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <Skeleton variant="text" width={80} height={20} />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <Skeleton variant="text" width={100} height={20} />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: '20px' }} />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '20px' }} />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <Skeleton variant="text" width={20} height={20} />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <Skeleton variant="circular" width={18} height={18} />
                            <Skeleton variant="circular" width={18} height={18} />
                            <Skeleton variant="circular" width={18} height={18} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-270">
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

export default Societies;