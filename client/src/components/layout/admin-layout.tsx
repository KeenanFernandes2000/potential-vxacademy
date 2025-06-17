
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart,
  PuzzleIcon,
  GraduationCap,
  LogOut,
  FileText,
  ClipboardCheck,
  Award,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect unauthorized users (should already be handled by ProtectedRoute)
  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Admin Access Required</h1>
          <p className="text-lg text-white/80 mb-8">
            You need administrator privileges to access this page.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Training Areas",
      path: "/admin/training-areas",
      icon: <PuzzleIcon className="h-5 w-5" />,
    },
    {
      name: "Modules",
      path: "/admin/modules",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      name: "Courses",
      path: "/admin/course-management",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Units",
      path: "/admin/units",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Learning Blocks",
      path: "/admin/learning-blocks",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Assessments",
      path: "/admin/assessments",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      name: "SCORM Packages",
      path: "/admin/scorm",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Badges",
      path: "/admin/badges",
      icon: <Award className="h-5 w-5" />,
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-slate-900/95 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-teal-400" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">VX Academy</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-grow">
              <nav className="mt-6">
                <div className="px-6 py-2 text-slate-400 uppercase text-xs font-semibold tracking-wider">Admin</div>
                
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div 
                      className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                        location === item.path
                          ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg"
                          : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span className="font-medium ml-3">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900/95 backdrop-blur-xl text-white border-r border-white/10">
        <div className="p-6 flex items-center justify-center border-b border-white/10">
          <GraduationCap className="h-8 w-8 text-teal-400 mr-3" />
          <span className="font-bold text-xl bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">VX Academy</span>
        </div>
        <div className="overflow-y-auto flex-grow">
          <nav className="mt-6">
            <div className="px-6 py-2 text-slate-400 uppercase text-xs font-semibold tracking-wider">Admin</div>
            
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  location === item.path
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg"
                    : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
                }`}>
                  {item.icon}
                  <span className="font-medium ml-3">{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-lg font-bold mr-4 shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-white">{user.name}</div>
              <div className="text-xs text-slate-400">
                {user.role === "admin" ? "Administrator" : 
                 user.role === "supervisor" ? "Supervisor" : 
                 user.role === "content_creator" ? "Content Creator" : 
                 "Healthcare Staff"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="ghost"
              className="flex-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <Link href="/">
                <div className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Main Site</span>
                </div>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-slate-900/95 backdrop-blur-xl text-white p-4 shadow-lg border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-teal-400" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">VX Academy</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-white/10"
              >
                <Link href="/">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-white/10"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          {children}
        </main>
      </div>
    </div>
  );
}
