
"use client";

import { useUser } from "@/firebase";
import AuthForm from "@/components/auth-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthorized } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in and authorized, redirect them away from the login page.
    if (!loading && user && isAuthorized) {
      router.replace('/slot-booking-for-dcm');
    }
  }, [user, loading, isAuthorized, router]);


  if (loading || (user && isAuthorized)) {
    return (
      <div className="flex items-center justify-center flex-grow">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Only show AuthForm if the user is not logged in.
  if (!user) {
    return (
      <main className="flex-grow flex items-center justify-center p-4">
        <AuthForm />
      </main>
    );
  }

  // This covers the case where a user is logged in but not authorized,
  // or some other edge case. The AuthGuard will handle the redirect.
  return (
     <div className="flex items-center justify-center flex-grow">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
  );
}
