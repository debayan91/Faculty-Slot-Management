
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// This is a placeholder for a real password check. 
// In a production app, this should be a call to a serverless function
// that validates a password stored securely (e.g., in a secret manager).
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "1234";

export default function AdminAuthPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setIsAdmin } = useAdmin();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate a network request
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        toast({
          title: "Success",
          description: "Admin mode unlocked.",
        });
        setIsAdmin(true); // Set admin state globally
        router.push('/admin'); // Redirect to the main admin dashboard
      } else {
        setError('Incorrect password. Please try again.');
        toast({
          title: "Authentication Failed",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Mode</CardTitle>
          <CardDescription>
            Enter the password to unlock admin privileges. This is an additional
            security measure for authorized administrators.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Unlock'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
