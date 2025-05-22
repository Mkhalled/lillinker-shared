'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { menuAdmin } from '@/components/Sidebar/menus/menuAdmin';

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <DefaultLayout menuGroups={menuAdmin}>{children}</DefaultLayout>;
};

export default AdminDashboardLayout;
