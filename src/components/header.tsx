
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navButtons } from "@/config/nav-links";
import { ThemeToggle } from "./theme-toggle";
import { AdminToggler } from "./admin-toggler";

export function Header() {
  const { user, isAuthorized, loading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "Logged Out" });
  };

  const isLoginPage = pathname === "/auth";

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-background/50 backdrop-blur-xl">
        <div className="container flex h-[15vh] max-w-screen-2xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="https://d2lk14jtvqry1q.cloudfront.net/media/small_Vellore_Institute_of_Technology_Business_School_VIT_BS_54186d8069_43307f0402_809869aaa7_17ad59e62d.png"
              alt="Logo"
              width={220}
              height={80}
              className="dark:hidden object-contain"
            />
            <Image
              src="https://d2lk14jtvqry1q.cloudfront.net/media/small_Vellore_Institute_of_Technology_Business_School_VIT_BS_54186d8069_43307f0402_809869aaa7_17ad59e62d.png"
              alt="Logo"
              width={220}
              height={80}
              className="hidden dark:block filter grayscale brightness-[900%] object-contain"
            />
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
              <Image
                src="https://d2lk14jtvqry1q.cloudfront.net/media/small_Vellore_Institute_of_Technology_Business_School_VIT_BS_54186d8069_43307f0402_809869aaa7_17ad59e62d.png"
                alt="Logo"
                width={220}
                height={80}
                className="dark:hidden object-contain"
              />
              <Image
                src="https://d2lk14jtvqry1q.cloudfront.net/media/small_Vellore_Institute_of_Technology_Business_School_VIT_BS_54186d8069_43307f0402_809869aaa7_17ad59e62d.png"
                alt="Logo"
                width={220}
                height={80}
                className="hidden dark:block filter grayscale brightness-[900%] object-contain"
              />
            </div>
            <div className="border-r border-border/50 h-10"></div>
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-foreground">
              SCOPE Research Portal
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user && isAuthorized ? (
            <>
              <ThemeToggle />
              <span className="text-green-600 font-thin">
                {user.displayName || user.email}
              </span>
              <AdminToggler />
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <ThemeToggle />
          )}
        </div>
      </div>
      {/* Secondary Navbar */}
      {user && isAuthorized && !isLoginPage && (
        <nav className="hidden md:block border-b border-border/40">
          <div className="container flex h-12 max-w-screen-2xl items-center justify-between">
            <div className="flex items-center space-x-2">
              {navButtons.map((button) => (
                <Button
                  key={button.name}
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 no-shadow", { "bg-transparent": true })}
                  asChild
                >
                  <Link href={button.href}>
                    <button.icon className="mr-2 h-4 w-4" />
                    {button.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
