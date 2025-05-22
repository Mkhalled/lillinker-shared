'use client';

import { useSession } from 'next-auth/react';

const ConsultantDashboard = () => {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Welcome : {session?.user.username}</h1>
    </div>
  );
};

export default ConsultantDashboard;
