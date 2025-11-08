
"use client";

import { useAdmin } from "@/context/AdminProvider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter, usePathname } from "next/navigation";

export function AdminToggler() {
  const { isAdmin, setIsAdmin, setPreviousPath, previousPath } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = (isChecked: boolean) => {
    if (isChecked) {
      if (!pathname.startsWith("/admin")) {
        setPreviousPath(pathname);
      }
      router.push("/admin/auth");
    } else {
      setIsAdmin(false);
      router.push(previousPath || "/");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="admin-mode"
        checked={isAdmin}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="admin-mode">Admin Mode</Label>
    </div>
  );
}
