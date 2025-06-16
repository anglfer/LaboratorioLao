import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileText, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Panel de Control", href: "/", icon: BarChart3 },
  { name: "Presupuestos", href: "/budgets", icon: FileText },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <SidebarContent location={location} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          <SidebarContent location={location} />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-slate-50 dark:bg-slate-900">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ location }: { location: string }) {
  return (
    <>
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-600 dark:bg-blue-700">
        <h1 className="text-xl font-semibold text-white">
          Laboratorio LOA
        </h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                )}>
                  <item.icon className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                  )} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}