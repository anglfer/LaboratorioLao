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

// Helper functions for page titles and descriptions
function getPageTitle(location: string): string {
  const page =
    navigation.find((nav) => nav.href === location) ||
    adminNavigation.find((nav) => nav.href === location);
  return page?.name || "Panel de Control";
}

function getPageDescription(location: string): string {
  const descriptions: Record<string, string> = {
    "/": "Resumen general de actividades y métricas principales",
    "/budgets": "Gestión y seguimiento de presupuestos de proyectos",
    "/programming": "Programación y planificación de actividades",
    "/brigadista": "Gestión de personal y equipos de trabajo",
    "/admin/concepts": "Administración de conceptos y configuraciones",
  };
  return descriptions[location] || "Bienvenido al sistema de gestión";
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 flex z-40 md:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-[#2C3E50]/60"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <SidebarContent location={location} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg border-r border-[#F8F9FA]">
          <SidebarContent location={location} />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 md:hidden bg-white shadow-sm border-b border-[#F8F9FA]">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-[#2C3E50] hover:text-[#68A53B] hover:bg-[#E7F2E0]"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-[#2C3E50]">
              Laboratorio LOA
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block sticky top-0 z-10 bg-white shadow-sm border-b border-[#F8F9FA]">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2C3E50]">
                  {getPageTitle(location)}
                </h2>
                <p className="text-sm text-[#6C757D] mt-0.5">
                  {getPageDescription(location)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-[#68A53B] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">LA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="p-4 md:p-6">
            <SafeDisplay value={children} />
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
      {/* Logo Header */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-[#68A53B] to-[#4F7D2C] shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Laboratorio</h1>
            <p className="text-xs text-white/80 font-medium">LOA</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out",
                    isActive
                      ? "bg-[#68A53B] text-white shadow-lg shadow-[#68A53B]/20"
                      : "text-[#2C3E50] hover:bg-[#E7F2E0] hover:text-[#68A53B] hover:shadow-sm"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-lg mr-3 transition-colors",
                      isActive
                        ? "bg-white/20"
                        : "bg-[#F8F9FA] group-hover:bg-[#68A53B]/10"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-[#6C757D] group-hover:text-[#68A53B]"
                      )}
                    />
                  </div>
                  {item.name}
                </div>
              </Link>
            );
          })}

          {/* Admin Section */}
          <div className="pt-4 mt-4 border-t border-[#F8F9FA]">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className={cn(
                "group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                "text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#68A53B]"
              )}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg mr-3 bg-[#F8F9FA] group-hover:bg-[#68A53B]/10 transition-colors">
                <Settings className="h-4 w-4 text-[#6C757D] group-hover:text-[#68A53B] transition-colors" />
              </div>
              <span className="flex-1 text-left">Administración</span>
              <div className="ml-auto">
                {adminOpen ? (
                  <ChevronDown className="h-4 w-4 text-[#6C757D] group-hover:text-[#68A53B] transition-colors" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#6C757D] group-hover:text-[#68A53B] transition-colors" />
                )}
              </div>
            </button>

            {adminOpen && (
              <div className="mt-1 ml-4 space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-[#68A53B] text-white shadow-md shadow-[#68A53B]/20"
                            : "text-[#6C757D] hover:bg-[#E7F2E0] hover:text-[#68A53B]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-5 h-5 rounded-md mr-2 transition-colors",
                            isActive
                              ? "bg-white/20"
                              : "group-hover:bg-[#68A53B]/10"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 transition-colors",
                              isActive
                                ? "text-white"
                                : "text-[#6C757D] group-hover:text-[#68A53B]"
                            )}
                          />
                        </div>
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#F8F9FA]">
          <div className="flex items-center px-3 py-2 rounded-xl bg-[#F8F9FA]">
            <div className="w-7 h-7 bg-[#68A53B] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">LA</span>
            </div>
            <div className="ml-2 flex-1">
              <p className="text-sm font-medium text-[#2C3E50]">Sistema LOA</p>
              <p className="text-xs text-[#6C757D]">v2.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
