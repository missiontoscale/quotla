'use client'

import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
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
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function TopBar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const userName = user?.email?.split('@')[0] || 'User';

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Search products, customers, invoices..."
            className="pl-9 h-8 text-[0.81rem] bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100 h-9 w-9">
              <Bell className="w-4.5 h-4.5" />
              <Badge className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center p-0 bg-rose-500 text-white text-[0.72rem]">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80 bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-100 text-[0.81rem]">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer text-[0.81rem]">
              <div className="flex flex-col gap-1">
                <span>Low stock alert: Product #1234</span>
                <span className="text-[0.72rem] text-slate-500">2 hours ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer text-[0.81rem]">
              <div className="flex flex-col gap-1">
                <span>New order received from Customer XYZ</span>
                <span className="text-[0.72rem] text-slate-500">5 hours ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer text-[0.81rem]">
              <div className="flex flex-col gap-1">
                <span>Payment overdue: Invoice #5678</span>
                <span className="text-[0.72rem] text-slate-500">1 day ago</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/settings" className="hidden sm:block">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 h-9 w-9">
            <Settings className="w-4.5 h-4.5" />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-slate-100 h-9">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[0.81rem] capitalize hidden sm:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-100 text-[0.81rem]">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="text-slate-300 hover:bg-slate-800 cursor-pointer text-[0.81rem]">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="text-slate-300 hover:bg-slate-800 cursor-pointer text-[0.81rem]">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-slate-300 hover:bg-slate-800 cursor-pointer text-[0.81rem]"
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
