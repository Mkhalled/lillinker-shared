'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { menuAdminCompany } from '@/components/Sidebar/menus/menuAdminCompany';

const CompanyDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <DefaultLayout menuGroups={menuAdminCompany}>{children}</DefaultLayout>;
};

export default CompanyDashboardLayout;
