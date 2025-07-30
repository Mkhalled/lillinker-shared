'use client';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import MesDemandes from '@/components/tables/MesDemandes';

const Societies = () => {
  return (
    <div className="mx-auto min-h-screen max-w-270">
      <Breadcrumb pageName="Mes Demandes" />
        <div className="flex flex-col gap-10">
            <MesDemandes/>
        </div>
    </div>
  );
};

export default Societies;
