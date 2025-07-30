'use client';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import MesDemandes from '@/components/tables/MesDemandes';
import { demande } from '@/types/demande';

const Societies = () => {
  const [requests, setRequests] = useState<demande[]>([]);

  useEffect(() => {
    async function fetchRequests() {
      const res = await fetch('/api/freelance/requests');
      const data = await res.json();
      setRequests(data.requests || []);
    }
    fetchRequests();
  }, []);
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
