import { Link, useLocation } from "wouter";
import React from "react";
import { Button } from "./ui/button";
import { SafeDisplay } from "./ui/safe-display";
import {
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Calendar,
  Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Panel de Control", href: "/", icon: BarChart3 },
  { name: "Presupuestos", href: "/budgets", icon: FileText },
  { name: "Programación", href: "/programming", icon: Calendar },
  { name: "Brigadista", href: "/brigadista", icon: Users },
];

const adminNavigation = [
  { name: "Gestión de Conceptos", href: "/admin/concepts", icon: Plus },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 flex z-40 md:hidden",
          sidebarOpen ? "block" : "hidden",
        )}
      >
        <div
          className="fixed inset-0 bg-[#2C3E50]/50 dark:bg-[#2C3E50]/70"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-sidebar dark:bg-sidebar">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <SidebarContent location={location} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-sidebar dark:bg-sidebar border-r border-sidebar-border dark:border-sidebar-border">
          <SidebarContent location={location} />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-background dark:bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-[#2C3E50] hover:text-[#4F7D2C] dark:text-[#E7F2E0] dark:hover:text-[#68A53B]"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <SafeDisplay value={children} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ location }: { location: string }) {
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <>
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-[#68A53B] dark:bg-[#4F7D2C]">
        <h1 className="text-xl font-semibold text-white">Laboratorio LOA</h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-[#E7F2E0] text-[#4F7D2C] dark:bg-[#4F7D2C] dark:text-[#E7F2E0]"
                      : "text-[#2C3E50] hover:bg-[#E7F2E0]/70 hover:text-[#4F7D2C] dark:text-[#E7F2E0]/90 dark:hover:bg-[#4F7D2C]/50 dark:hover:text-white",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive
                        ? "text-[#68A53B] dark:text-[#68A53B]"
                        : "text-[#2C3E50]/70 group-hover:text-[#68A53B] dark:text-[#E7F2E0]/70 dark:group-hover:text-[#68A53B]",
                    )}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}

          {/* Admin Section */}
          <div className="pt-4">
            <div className="border-t border-[#E7F2E0] dark:border-[#4F7D2C]/40 pt-4">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className={cn(
                  "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  "text-[#2C3E50] hover:bg-[#E7F2E0]/70 hover:text-[#4F7D2C] dark:text-[#E7F2E0]/90 dark:hover:bg-[#4F7D2C]/50 dark:hover:text-white",
                )}
              >
                <Settings className="mr-3 flex-shrink-0 h-4 w-4" />
                <span className="flex-1 text-left">Administración</span>
                {adminOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {adminOpen && (
                <div className="mt-1 space-y-1">
                  {adminNavigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link key={item.name} href={item.href}>
                        <div
                          className={cn(
                            "group flex items-center pl-8 pr-2 py-2 text-sm rounded-md transition-colors",
                            isActive
                              ? "bg-[#E7F2E0] text-[#4F7D2C] dark:bg-[#4F7D2C]/50 dark:text-[#E7F2E0]"
                              : "text-[#2C3E50]/80 hover:bg-[#E7F2E0]/70 hover:text-[#4F7D2C] dark:text-[#E7F2E0]/80 dark:hover:bg-[#4F7D2C]/40 dark:hover:text-[#E7F2E0]",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "mr-3 flex-shrink-0 h-4 w-4",
                              isActive
                                ? "text-[#68A53B] dark:text-[#68A53B]"
                                : "text-[#2C3E50]/60 group-hover:text-[#68A53B] dark:text-[#E7F2E0]/60 dark:group-hover:text-[#68A53B]",
                            )}
                          />
                          {item.name}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
