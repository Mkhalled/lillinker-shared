import { LayoutDashboardIcon, SettingsIcon, InboxIcon } from 'lucide-react';

export const menuManagerCompany = [
  {
    name: 'MENU',
    menuItems: [
      {
        icon: <LayoutDashboardIcon className="w-5 h-5" />,
        label: 'Dashboard',
        route: '/company/manager/dashboard',
      },
      {
        icon: <InboxIcon className="w-5 h-5" />,
        label: 'Demandes',
        route: '/company/manager/requests',
      },

      {
        icon: <SettingsIcon className="w-5 h-5" />,
        label: 'Paramètres',
        route: '/company/manager/settings',
      },
    ],
  },
];
