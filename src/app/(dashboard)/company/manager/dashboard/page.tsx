'use client';

import { useSession } from 'next-auth/react';

const CompanyManagerDashboard = () => {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome, {session?.user?.first_name} {session?.user?.last_name}
      </h1>
      <p className="mt-2 text-gray-600">
        This is the Company Manager Dashboard. More features coming soon.
      </p>
    </div>
  );
};

export default CompanyManagerDashboard;
