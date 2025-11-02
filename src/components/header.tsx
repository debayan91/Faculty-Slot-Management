

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminProvider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export function Header() {
  const auth = useAuth();
  const { user, faculty } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin, setIsAdmin } = useAdmin();

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
      // If turning ON, navigate to admin auth page
      router.push('/admin/auth');
    } else {
      // If turning OFF, deactivate admin and go home
      setIsAdmin(false);
      toast({ title: "Admin Mode Deactivated" });
      router.push('/');
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/50 backdrop-blur-xl">
      <div className="container flex h-24 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BookOpenCheck className="h-6 w-6" />
            <span className="font-bold">Faculty Slot Management</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {user ? (
            <>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8">
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
                      <FileText className="mr-2 h-4 w-4" />
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
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" onClick={() => router.push('/admin/auth')}>
                <Link href="/admin/auth">
                  <UserCog className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
