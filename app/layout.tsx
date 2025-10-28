import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import Navbar from "@/components/Navbar";
import InstallPWA from "@/components/InstallPWA";
import InvitationNotifications from "@/components/InvitationNotifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MastIdea - Explora tus ideas con IA",
  description:
    "Captura, expande y desarrolla tus ideas con la ayuda de inteligencia artificial. Inspirado en el pensamiento de Einstein.",
  keywords: ["ideas", "creatividad", "IA", "brainstorming", "innovación"],
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MastIdea",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale}>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#7c3aed" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Navbar />
            {children}
            <InstallPWA />
            <InvitationNotifications />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
