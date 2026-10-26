import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Foodie — Your Personal Food Companion",
  description:
    "Foodie helps you discover nearby food places, hidden gems, local favorites and budget eats — matched to who you're eating with and what you crave.",
  keywords: ["Foodie", "food discovery", "restaurants", "hidden gems", "food companion"],
  authors: [{ name: "Foodie" }],
  other: {
    // Release marker — lets deployment verification confirm which build is live.
    "application-version": "prototype-4.0.0",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Foodie",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Foodie — Your Personal Food Companion",
    description: "Discover nearby food places, hidden gems, local favorites and budget eats.",
    siteName: "Foodie",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
