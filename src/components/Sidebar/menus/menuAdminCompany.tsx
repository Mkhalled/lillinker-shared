import { LayoutDashboardIcon, SettingsIcon, UserCog2Icon, InboxIcon } from 'lucide-react';

export const menuAdminCompany = [
  {
    name: 'MENU',
    menuItems: [
      {
        icon: <LayoutDashboardIcon className="w-5 h-5" />,
        label: 'Dashboard',
        route: '/company/admin/dashboard',
      },
      {
        icon: <UserCog2Icon className="w-5 h-5" />,
        label: 'Utilisateurs',
        route: '/company/admin/users',
      },
      {
        icon: <InboxIcon className="w-5 h-5" />,
        label: 'Demandes',
        route: '/company/admin/requests',
      },

      {
        icon: <SettingsIcon className="w-5 h-5" />,
        label: 'Paramètres',
        route: '/company/admin/settings',
      },
    ],
  },
];
