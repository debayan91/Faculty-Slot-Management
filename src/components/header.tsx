
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminProvider";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Search, User, UserCog } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { navButtons, adminNavButtons, facultyNavButtons, studentNavButtons } from "@/config/nav-links";

export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "Logged Out" });
  };

  const isLoginPage = pathname === '/auth';

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  };

  if (adminLoading) {
    return (
        <header className="sticky top-0 z-50 w-full bg-background/50 backdrop-blur-xl">
            <div className="container flex h-[15vh] max-w-screen-2xl items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Image src="https://d2lk14jtvqry1q.cloudfront.net/media/small_Vellore_Institute_of_Technology_Business_School_VIT_BS_54186d8069_43307f0402_809869aaa7_17ad59e62d.png" alt="Logo" width={220} height={80} className="dark:hidden object-contain" />
                    <Image src="https://d2lk14jtvqry1q.cloudfront.net/media/small_Vellore_Institute_of_Technology_Business_School_VIT_BS_54186d8069_43307f0402_809869aaa7_17ad59e62d.png" alt="Logo" width={220} height={80} className="hidden dark:block filter grayscale brightness-[900%] object-contain" />
                </div>
            </div>
        </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/50 backdrop-blur-xl">
      {/* Main Header */}
      <div className="container flex h-[15vh] max-w-screen-2xl items-center justify-between">
        <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-4">
              <div>
                  <Image src="https://d2lk14jtvqry1q.cloudfront.net/media/small_Vellore_Institute_of_Technology_Business_School_VIT_BS_54186d8069_43307f0402_809869aaa7_17ad59e62d.png" alt="Logo" width={220} height={80} className="dark:hidden object-contain" />
                  <Image src="https://d2lk14jtvqry1q.cloudfront.net/media/small_Vellore_Institute_of_Technology_Business_School_VIT_BS_54186d8069_43307f0402_809869aaa7_17ad59e62d.png" alt="Logo" width={220} height={80} className="hidden dark:block filter grayscale brightness-[900%] object-contain" />
              </div>
              <div className="border-r border-border/50 h-10"></div>
            </Link>
            <div className="hidden md:flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-foreground">SCOPE Research Portal</h1>
            </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user && !isLoginPage && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-10 no-shadow bg-transparent">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{user.displayName || user.email}</span>
                      <span className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'Faculty'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!isAdmin && !isLoginPage && (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/auth">
                  <UserCog className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Secondary Navbar */}
      {!isLoginPage && (
        <nav className="hidden md:block border-b border-border/40">
          <div className="container flex h-12 max-w-screen-2xl items-center justify-between">
              <div className="flex items-center space-x-2">
                  {navButtons.map((button) => (
                    <Button key={button.name} variant="ghost" size="sm" className={cn("h-8 no-shadow", {"bg-transparent": true})} asChild>
                      <Link href={button.href}>
                        <button.icon className="mr-2 h-4 w-4"/>
                          {button.name}
                      </Link>
                    </Button>
                  ))}
              </div>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9 h-8 w-48 md:w-64 no-shadow" />
              </div>
          </div>
        </nav>
      )}
    </header>
  );
}
