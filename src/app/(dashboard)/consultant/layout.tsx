'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { menuConsultant } from '@/components/Sidebar/menus/menuConsultant';

const ConsultantDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <DefaultLayout menuGroups={menuConsultant}>{children}</DefaultLayout>;
};

export default ConsultantDashboardLayout;
