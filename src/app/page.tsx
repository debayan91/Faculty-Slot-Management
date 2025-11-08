
"use client";

import { useUser } from "@/firebase";
import LoginForm from "@/components/login-form";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[calc(100vh-128px)]">
        <LoginForm />
      </main>
    );
  }

  // This is the view for logged-in users.
  return (
     <main className="flex-grow flex items-center justify-center min-h-[calc(100vh-128px)]">
        <div className="container mx-auto p-4 text-center">
             <h1 className="text-4xl font-bold tracking-tight mb-4">
                Welcome, {user.displayName || user.email}!
              </h1>
              <p className="text-lg text-muted-foreground">
                You are successfully logged in.
              </p>
        </div>
    </main>
  );
}
