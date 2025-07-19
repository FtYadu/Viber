'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/client',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/client/projects',
    icon: FolderOpen,
  },
  {
    title: 'Invoices',
    href: '/client/invoices',
    icon: FileText,
  },
  {
    title: 'Support',
    href: '/client/support',
    icon: MessageSquare,
  },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div
      className={cn(
        'bg-background border-r flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[70px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <Link href="/client" className="font-bold text-xl">
            Client Portal
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sign Out Button */}
      <div className="p-2 border-t mt-auto">
        <Button
          variant="ghost"
          className={cn(
            'w-full flex items-center gap-3 justify-start',
            collapsed && 'justify-center'
          )}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}