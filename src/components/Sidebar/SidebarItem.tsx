import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import SidebarDropdown from '@/components/Sidebar/SidebarDropdown';
import type { MenuItem } from '@/types/menu';

interface SidebarItemProps {
  item: MenuItem;
  pageName: string;
  setPageName: (name: string) => void;
}

const SidebarItem = ({ item, pageName, setPageName }: SidebarItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Update page name state (your existing logic)
    const updatedPageName = pageName !== item.label.toLowerCase() ? item.label.toLowerCase() : '';
    setPageName(updatedPageName);

    if (item.route) {
      const isCurrentRoute = pathname === item.route || pathname.startsWith(`${item.route}?`);

      if (isCurrentRoute) {
        // Force remount without refreshing the whole app
        const resetUrl = `${item.route}?reset=${Date.now()}`;
        router.push(resetUrl); // ✅ use push, not replace
      } else {
        router.push(item.route);
      }
    }
  };

  const isActive = (menuItem: MenuItem): boolean => {
    if (menuItem.route === pathname) return true;
    if (menuItem.children) {
      return menuItem.children.some(child => child.route === pathname);
    }
    return false;
  };

  const isItemActive = isActive(item);

  return (
    <>
      <li>
        <Link
          href={item.route || '#'}
          onClick={handleClick}
          className={`${
            isItemActive
              ? 'bg-[#9260f8] text-white dark:bg-meta-4 dark:text-white'
              : 'text-gray-300 dark:text-gray-300'
          } group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-[#9260f8] hover:text-white dark:hover:bg-meta-4 dark:hover:text-white`}
        >
          <span
            className={`${isItemActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}
          >
            {item.icon}
          </span>
          {item.label}
          {item.children && (
            <svg
              className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current transition-transform duration-300 ${
                pageName === item.label.toLowerCase() && 'rotate-180'
              } ${isItemActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                fill="currentColor"
              />
            </svg>
          )}
        </Link>

        {item.children && (
          <div
            className={`translate transform overflow-hidden transition-all duration-300 ${
              pageName !== item.label.toLowerCase() && 'hidden'
            }`}
          >
            <SidebarDropdown item={item} />
          </div>
        )}
      </li>
    </>
  );
};

export default SidebarItem;
