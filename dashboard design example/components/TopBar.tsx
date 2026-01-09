import { Search, Bell, Settings, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

export function TopBar() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search products, customers, invoices..."
            className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-rose-500 text-white text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-100">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer">
              <div className="flex flex-col gap-1">
                <span>Low stock alert: Product #1234</span>
                <span className="text-xs text-slate-500">2 hours ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer">
              <div className="flex flex-col gap-1">
                <span>New order received from Customer XYZ</span>
                <span className="text-xs text-slate-500">5 hours ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer">
              <div className="flex flex-col gap-1">
                <span>Payment overdue: Invoice #5678</span>
                <span className="text-xs text-slate-500">1 day ago</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
          <Settings className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-slate-100">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">John Doe</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-100">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 cursor-pointer">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
