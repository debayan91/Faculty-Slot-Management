
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { FirebaseClientProvider } from "@/firebase";
import { AdminProvider } from "@/context/AdminProvider";
import { AuthGuard } from "@/components/auth-guard";

const montserrat = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SCOPE Research Portal",
  description: "Book and manage faculty time slots",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(montserrat.className, "min-h-screen flex flex-col")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AdminProvider>
              <AuthGuard>
                <Header />
                <main className="flex-grow flex flex-col">{children}</main>
                <Toaster />
              </AuthGuard>
            </AdminProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
