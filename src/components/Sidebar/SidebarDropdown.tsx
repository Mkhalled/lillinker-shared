import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import type { MenuItem } from '@/types/menu';

interface SidebarDropdownProps {
  item: MenuItem;
}

const SidebarDropdown = ({ item }: SidebarDropdownProps) => {
  const pathname = usePathname();

  return (
    <>
      <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
        {item.children?.map((childItem, index: number) => (
          <li key={index}>
            <Link
              href={childItem.route || '#'}
              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                pathname === childItem.route ? 'text-white' : ''
              }`}
            >
              {childItem.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SidebarDropdown;
