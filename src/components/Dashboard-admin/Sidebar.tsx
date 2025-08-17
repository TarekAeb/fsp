'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home,
  Film,
  Users,
  User,
  Tags,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard-admin',
    icon: Home,
  },
  {
    title: 'Movies',
    href: '/dashboard-admin/movies',
    icon: Film,
  },
  {
    title: 'Actors',
    href: '/dashboard-admin/actors',
    icon: Users,
  },
  {
    title: 'Directors',
    href: '/dashboard-admin/directors',
    icon: User,
  },
  {
    title: 'Genres',
    href: '/dashboard-admin/genres',
    icon: Tags,
  },
  {
    title: 'Analytics',
    href: '/dashboard-admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Users',
    href: '/dashboard-admin/admin',
    icon: Users,
  },
];

function SidebarContent({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col bg-gray-900 text-white", className)}>
      {/* Header */}
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Film className="h-4 w-4 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">FSP Admin</span>
            <span className="text-xs text-gray-400">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard-admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-800",
                  isActive 
                    ? "bg-primary text-black shadow-md" 
                    : "text-gray-300 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-black" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <div className="space-y-2">
          <Link
            href="/dashboard-admin/settings"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-gray-800 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start space-x-3 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div
          className={cn(
            "relative flex h-screen transition-all duration-300",
            isCollapsed ? "w-16" : "w-64",
            className
          )}
        >
          <SidebarContent className={isCollapsed ? "w-16" : "w-64"} />
          
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-gray-300 bg-white text-gray-600 shadow-md hover:bg-gray-50"
          >
            <ChevronLeft 
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                isCollapsed && "rotate-180"
              )}
            />
            <span className="sr-only">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}