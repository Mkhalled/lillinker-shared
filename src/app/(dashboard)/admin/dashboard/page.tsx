'use client';

import { useSession } from 'next-auth/react';

const PlatformAdminDashboard = () => {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome Platform Admin : {session?.user.username}
      </h1>
    </div>
  );
};

export default PlatformAdminDashboard;
