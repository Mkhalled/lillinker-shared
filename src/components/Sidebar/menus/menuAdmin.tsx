import { LayoutDashboardIcon, UserCog2Icon, Building2Icon, SettingsIcon } from 'lucide-react';

export const menuAdmin = [
  {
    name: 'MENU',
    menuItems: [
      {
        icon: <LayoutDashboardIcon className="w-5 h-5" />,
        label: 'Dashboard',
        route: '/admin/dashboard',
        // children: [{ label: 'eCommerce', route: '/' }],
      },
      {
        icon: <UserCog2Icon className="w-5 h-5" />,
        label: 'Utilisateurs',
        route: '/admin/users',
      },
      {
        icon: <Building2Icon className="w-5 h-5" />,
        label: 'Societies',
        route: '/admin/requests',
      },
      {
        icon: <SettingsIcon className="w-5 h-5" />,
        label: 'Paramètres',
        route: '/admin/settings',
      },
    ],
  },
];
