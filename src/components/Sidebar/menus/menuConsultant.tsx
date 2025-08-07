import { LayoutDashboardIcon, SettingsIcon, SendIcon } from 'lucide-react';

export const menuConsultant = [
  {
    name: 'MENU',
    menuItems: [
      {
        icon: <LayoutDashboardIcon className="w-5 h-5" />,
        label: 'Dashboard',
        route: '/consultant/dashboard',
      },
      {
        icon: <SendIcon className="w-5 h-5" />,
        label: 'Mes Demandes',
        route: '/consultant/requests',
      },

      {
        icon: <SettingsIcon className="w-5 h-5" />,
        label: 'Paramètres du compte',
        route: '/consultant/settings',
      },
    ],
  },
];
