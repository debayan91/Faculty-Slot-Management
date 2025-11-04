
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  BookOpenCheck,
  LogOut,
  User as UserIcon,
  LogIn,
  ShieldCheck,
  UserCog,
  Home,
  DatabaseZap,
  FileText,
  CalendarCheck,
  Target,
  FilePlus,
  Search,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminProvider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function Header() {
  const auth = useAuth();
  const { user, faculty } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { isAdmin, setIsAdmin, previousPath, setPreviousPath } = useAdmin();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false); // Clear admin state on sign out
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message,
      });
    }
  };

  const handleAdminToggle = (isChecked: boolean) => {
    if (isChecked) {
      // If turning ON, save current path and navigate to admin auth page
      setPreviousPath(pathname);
      router.push('/admin/auth');
    } else {
      // If turning OFF, deactivate admin and go home or to previous path
      setIsAdmin(false);
      toast({ title: "Admin Mode Deactivated" });
      router.push(previousPath || '/');
    }
  };
  
  const handleExitAdminMode = () => {
      setIsAdmin(false);
      toast({ title: "Admin Mode Deactivated" });
      router.push(previousPath || '/');
  }

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navButtons = [
    { name: "Documents for DCM", icon: FileText },
    { name: "Monthly Target", icon: Target },
    { name: "Claim documents", icon: FilePlus },
    { name: "Slot booking for DCM", icon: CalendarCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/50 backdrop-blur-xl">
      {/* Main Header */}
      <div className="container flex h-20 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BookOpenCheck className="h-6 w-6" />
            <span className="font-bold">Faculty Slot Management</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={handleExitAdminMode}>
                <XCircle className="mr-2 h-4 w-4" />
                Exit Admin Mode
            </Button>
          )}

          {user ? (
            <>
              {!isAdmin && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="admin-mode-switch" className="text-sm font-medium">
                    Admin
                  </Label>
                  <Switch
                    id="admin-mode-switch"
                    checked={isAdmin}
                    onCheckedChange={handleAdminToggle}
                  />
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="backdrop-blur-xl relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoURL || undefined}
                        alt={faculty?.name || user.email || ""}
                      />
                      <AvatarFallback>
                        {faculty?.name
                          ? getInitials(faculty.name)
                          : user.email
                          ? user.email.substring(0, 2).toUpperCase()
                          : <UserIcon />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {faculty?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => router.push('/')}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/admin/templates')}>
                        <DatabaseZap className="mr-2 h-4 w-4" />
                        <span>Template Manager</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : !isAdmin && (
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
      <nav className="border-b border-border/40">
        <div className="container flex h-12 max-w-screen-2xl items-center justify-between">
            <div className="flex items-center space-x-2">
                {navButtons.map((button) => (
                    <Button key={button.name} variant="ghost" size="sm" className={cn("h-8 no-shadow", {"bg-transparent": true})}>
                        <button.icon className="mr-2 h-4 w-4"/>
                        {button.name}
                    </Button>
                ))}
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 h-8 w-48 md:w-64 no-shadow" />
            </div>
        </div>
      </nav>
    </header>
  );
}
