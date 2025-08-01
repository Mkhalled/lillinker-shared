'use client';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import MesDemandes from '@/components/tables/MesDemandes';
import { demande } from '@/types/demande';

const Societies = () => {
  const [requests, setRequests] = useState<demande[]>([]);

  useEffect(() => {
    async function fetchRequests() {
      const res = await fetch('/api/company/admin/requests');
      const data = await res.json();
      setRequests(data.requests || []);
    }
    fetchRequests();
  }, []);
  console.log('Requests:', requests);
  return (
    <div className="mx-auto min-h-screen max-w-270">
      <Breadcrumb pageName="Mes Demandes" />
      <div className="flex flex-col gap-10">
        <MesDemandes demandeData={requests} />
      </div>
    </div>
  );
};

export default Societies;
