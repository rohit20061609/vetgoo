import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/lib/providers";
import { ToastProvider, ToastViewport } from "@/components/ui/toaster";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VetGo - Your Pet's Health Companion",
  description:
    "Comprehensive pet healthcare management platform with AI-powered veterinary assistance",
  keywords: ["pet health", "veterinary", "pet care", "health tracking"],
  authors: [{ name: "VetGo Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vetgo.app",
    siteName: "VetGo",
    title: "VetGo - Your Pet's Health Companion",
    description: "Comprehensive pet healthcare management platform",
    images: [
      {
        url: "https://vetgo.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VetGo",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <SessionProvider session={session}>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}
