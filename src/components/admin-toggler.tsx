
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminProvider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function AdminToggler() {
  const router = useRouter();
  const pathname = usePathname();
  // The `isAdmin` from context is now the source of truth, determined by claims.
  // The local `isChecked` is for the visual state of the switch.
  const { isAdmin, setIsAdmin, setPreviousPath, previousPath } = useAdmin();

  const handleToggle = (isChecked: boolean) => {
    // We now use `setIsAdmin` to control the global state
    setIsAdmin(isChecked);

    if (isChecked) {
      // If we are not already in an admin page, save the current path
      if (!pathname.startsWith("/admin")) {
        setPreviousPath(pathname);
      }
      // Redirect to the password authentication page
      router.push("/admin/auth");
    } else {
      // Return to the page the user was on before entering admin mode.
      router.push(previousPath);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="admin-mode"
        // The switch is checked if the user is in admin mode.
        checked={isAdmin} 
        onCheckedChange={handleToggle}
        aria-label="Admin Mode Toggle"
      />
      <Label htmlFor="admin-mode">Admin Mode</Label>
    </div>
  );
}
