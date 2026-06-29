'use client'

import { Search, Settings, User, LogOut } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useGreeting } from '@/hooks/useGreeting';
import { format } from 'date-fns';

export function TopBar() {
  const { user } = useAuth();
  const router = useRouter();
  const greeting = useGreeting();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const userName = user?.email?.split('@')[0] || 'User';

  return (
    <header className="h-14 flex-shrink-0 bg-primary-700 border-b border-primary-600 flex items-center justify-between px-4 sm:px-6 overflow-hidden">
      {/* Mobile Header: Avatar + Greeting + Date */}
      <div className="flex md:hidden items-center gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-quotla-orange to-secondary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[0.79rem] text-primary-50 font-medium capitalize">
            {greeting}, {userName}
          </span>
          <span className="text-[0.675rem] text-primary-400">
            {format(new Date(), 'EEE, MMM d')}
          </span>
        </div>
      </div>

      {/* Desktop Search - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400" />
          <Input
            placeholder="Search products, customers, invoices..."
            className="pl-9 h-8 text-[0.81rem] bg-primary-700/80 border-primary-600 text-primary-50 placeholder:text-primary-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationCenter />

        <Link href="/business/settings" className="hidden sm:block">
          <Button variant="ghost" size="icon" className="text-primary-400 hover:text-primary-50 h-9 w-9">
            <Settings className="w-4.5 h-4.5" />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-primary-300 hover:text-primary-50 h-9">
              <div className="w-7 h-7 bg-gradient-to-br from-quotla-orange to-secondary-600 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[0.81rem] capitalize hidden sm:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-primary-700 border-primary-600">
            <DropdownMenuLabel className="text-primary-50 text-[0.81rem]">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary-600" />
            <DropdownMenuItem asChild>
              <Link href="/business/settings" className="text-primary-300 hover:bg-primary-700/80 cursor-pointer text-[0.81rem]">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary-600" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-primary-300 hover:bg-primary-700/80 cursor-pointer text-[0.81rem]"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
