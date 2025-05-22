export interface MenuChild {
  label: string;
  route: string;
}

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  children?: MenuChild[];
}

export interface MenuGroup {
  name: string;
  menuItems: MenuItem[];
}
