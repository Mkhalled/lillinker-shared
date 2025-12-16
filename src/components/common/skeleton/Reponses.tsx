import Skeleton from '@mui/material/Skeleton';

const ReponseSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Request Info Cards Skeleton */}
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-5">
      <div className="flex justify-between">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* TJM Card Skeleton */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30 text-center">
            <Skeleton variant="text" width={120} height={16} className="mb-2 mx-auto" />
            <Skeleton variant="text" width={80} height={32} className="mx-auto" />
          </div>

          {/* Days Card Skeleton */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 text-center">
            <Skeleton variant="text" width={100} height={16} className="mb-2 mx-auto" />
            <Skeleton variant="text" width={60} height={32} className="mx-auto" />
          </div>

          {/* Total CA Card Skeleton */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30 text-center">
            <Skeleton variant="text" width={140} height={16} className="mb-2 mx-auto" />
            <Skeleton variant="text" width={100} height={32} className="mx-auto" />
          </div>
        </div>

        {/* Back Button Skeleton */}
        <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: '6px' }} />
      </div>
    </div>

    {/* Responses Table Skeleton */}
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header with Button */}
      <div className="flex flex-col space-y-3 px-5 pt-6 pb-2 sm:px-7.5 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <Skeleton variant="text" width={150} height={24} />
        </div>
        <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: '6px' }} />
      </div>

      {/* Table Container */}
      <div className="px-5 pb-2.5 pt-2 sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Pseudonyme
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Frais de Gestion
                </th>
                <th className="min-w-[140px] px-4 py-4 font-medium text-black dark:text-white">
                  Total Charges
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Reste CA + Charges Pro
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  % Reçu
                </th>
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
                    <Skeleton variant="text" width={80} height={20} />
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <Skeleton variant="text" width={100} height={20} />
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <Skeleton variant="text" width={60} height={20} />
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

      {/* Pagination Skeleton */}
      <div className="border-t border-stroke bg-gray-50 px-4 py-3 sm:px-6 dark:border-strokedark dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <Skeleton variant="text" width={200} height={20} />
            </div>
            <div className="flex space-x-1">
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '4px' }} />
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '4px' }} />
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '4px' }} />
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ReponseSkeleton;
