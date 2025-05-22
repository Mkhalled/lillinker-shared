'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { menuManagerCompany } from '@/components/Sidebar/menus/menuManagerCompany';

const CompanyDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <DefaultLayout menuGroups={menuManagerCompany}>{children}</DefaultLayout>;
};

export default CompanyDashboardLayout;
