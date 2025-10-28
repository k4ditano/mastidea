"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  FaBrain,
  FaLightbulb,
  FaProjectDiagram,
  FaTags,
  FaBell,
} from "react-icons/fa";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const t = useTranslations("navbar");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchPendingInvitations = async () => {
      try {
        const response = await fetch("/api/invitations");
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching invitations:", error);
      }
    };

    fetchPendingInvitations();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchPendingInvitations, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  const navItems = [
    { href: "/", label: t("home"), icon: FaLightbulb },
    { href: "/ideas", label: t("ideas"), icon: FaBrain },
    { href: "/tags", label: t("tags"), icon: FaTags },
    { href: "/graph", label: t("graph"), icon: FaProjectDiagram },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <FaBrain className="text-einstein-600 text-2xl group-hover:text-einstein-500 transition-colors" />
              <span className="absolute -top-1 -right-1 text-xs">²</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Mast<span className="text-einstein-600">Idea</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-einstein-100 text-einstein-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="text-lg" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Invitations Bell */}
            {isSignedIn && (
              <Link
                href="/invitations"
                className={`
                  relative flex items-center space-x-2 px-4 py-2 rounded-lg
                  transition-all duration-200
                  ${
                    pathname === "/invitations"
                      ? "bg-einstein-100 text-einstein-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <FaBell className="text-lg" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
                <span className="hidden sm:inline">{t("invitations")}</span>
              </Link>
            )}

            {/* Language Switcher */}
            <div className="ml-2">
              <LanguageSwitcher />
            </div>

            {/* User Button */}
            <div className="ml-4 flex items-center">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Link
                  href="/sign-in"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  {t("signIn")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
