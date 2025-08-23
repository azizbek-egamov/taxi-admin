"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Car, Package, Coins, Settings, LogOut, Menu, X } from "lucide-react"
import { apiClient } from "@/lib/api"

const navigation = [
  { name: "Bosh sahifa", href: "/", icon: BarChart3 },
  { name: "Foydalanuvchilar", href: "/users", icon: Users },
  { name: "Haydovchilar", href: "/drivers", icon: Car },
  { name: "Buyurtmalar", href: "/orders", icon: Package },
  // { name: "Ball tranzaksiyalari", href: "/points", icon: Coins },
  { name: "Bot sozlamalari", href: "/bot-settings", icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("sidebar_open");
    if (stored !== null) return stored === "true";
    return window.innerWidth >= 1024;
  });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sidebar_open", String(isOpen));
  }, [isOpen]);

  const handleLogout = () => {
    apiClient.logout();
    router.push("/login");
  };

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  if (pathname === "/login") {
    return null;
  }

  return (
    <div>
      {/* Mobile menu button (faqat 1024px dan kichik ekranda) */}
      <div className="block lg:hidden fixed top-4 left-4 z-[110]">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="bg-white/80 backdrop-blur-sm">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop toggle when collapsed (faqat 1024px dan katta ekranda) */}
      {!isOpen && (
        <div className="hidden lg:flex fixed top-4 left-4 z-[70] pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="bg-white/80 backdrop-blur-sm"
            aria-label="Sidebarni ochish"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}


      {/* Sidebar */}
      <div
        className={cn(
          "sidebar fixed top-0 left-0 h-screen z-[100] w-64 max-w-xs bg-white/90 backdrop-blur-md border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:static lg:inset-0 md:w-56 sm:w-full sm:max-w-full sm:px-2 sm:py-2 text-base md:text-sm sm:text-xs",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // On desktop, allow collapsing by shifting out of view with negative margin
          isOpen ? "lg:translate-x-0 lg:ml-0" : "lg:-ml-64",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo + Desktop toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 md:h-14 md:px-2 sm:h-12 sm:px-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 md:w-7 md:h-7 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 md:w-4 md:h-4 sm:w-3 sm:h-3 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 md:text-lg sm:text-base">Yo'l yo'lakay</span>
            </div>
            {/* Desktop toggle button (faqat 1024px dan katta ekranda) */}
            <Button
              variant="outline"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "Sidebarni yopish" : "Sidebarni ochish"}
            >
              {isOpen ? <X className="h-4 w-4 md:h-3 md:w-3 sm:h-2 sm:w-2" /> : <Menu className="h-4 w-4 md:h-3 md:w-3 sm:h-2 sm:w-2" />}
            </Button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 md:px-2 md:py-3 sm:px-1 sm:py-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors md:text-xs sm:text-[11px]",
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 md:h-4 md:w-4 sm:h-3 sm:w-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {/* Logout */}
          <div className="p-4 border-t border-gray-200 md:p-2 sm:p-1">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4 md:h-3 md:w-3 sm:h-2 sm:w-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
