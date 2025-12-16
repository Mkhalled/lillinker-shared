import Skeleton from '@mui/material/Skeleton';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

const CompanySkeleton: React.FC = () => (
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
                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    Pseudonyme
                  </th>
                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    TJM
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Date
                  </th>
                  <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                    Priorité
                  </th>
                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, index) => (
                  <tr key={index}>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Skeleton variant="text" width={40} height={20} />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Skeleton variant="text" width={40} height={20} />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Skeleton variant="text" width={100} height={20} />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Skeleton
                        variant="rectangular"
                        width={70}
                        height={24}
                        sx={{ borderRadius: '20px' }}
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Skeleton variant="text" width={20} height={20} />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
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

export default CompanySkeleton;
