
"use client";

import { useUser } from "@/firebase";
import AuthForm from "@/components/auth-form";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user, loading, isAuthorized } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in and authorized, show the welcome page.
  if (user && isAuthorized) {
    return (
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle className="text-3xl">Welcome to the SCOPE Research Portal</CardTitle>
                <CardDescription>
                    Hello, {user.displayName || user.email}!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    You can manage schedules and book slots using the navigation options above.
                </p>
            </CardContent>
        </Card>
      </main>
    );
  }

  // If user is not logged in, show the AuthForm.
  if (!user) {
     return (
      <main className="flex-grow flex items-center justify-center p-4">
        <AuthForm />
      </main>
    );
  }

  // This covers the case where a user is logged in but not authorized.
  // The AuthGuard will handle the redirect to the /unauthorized page.
  return (
     <div className="flex items-center justify-center flex-grow">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
  );
}
