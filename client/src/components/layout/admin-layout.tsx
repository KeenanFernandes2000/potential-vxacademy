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
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Redirect unauthorized users (should already be handled by ProtectedRoute)
  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold text-abu-charcoal mb-6">Admin Access Required</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You need administrator privileges to access this page.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild className="bg-abu-primary text-white hover:bg-abu-primary/90">
            <Link href="/auth">Sign In</Link>
          </Button>
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 text-white shadow-2xl relative z-10">
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-7 w-7 text-teal-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">VX Academy</h1>
          </div>
          <p className="text-sm text-white/70 font-medium">Administration Portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a
                    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-300 group ${
                      location === item.path
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                    }`}
                  >
                    <div className="text-current">{item.icon}</div>
                    <span className="font-medium">{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10">
          <div className="flex items-center gap-3 mb-4 bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-bold flex items-center justify-center uppercase shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-white">{user.name}</p>
              <p className="text-xs text-white/70">{user.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="ghost"
              className="flex-1 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
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
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <header className="md:hidden bg-white/10 backdrop-blur-xl border-b border-white/20 text-white p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-teal-400" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">VX Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <Link href="/">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <nav className="overflow-x-auto py-2 mt-2">
            <ul className="flex space-x-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all duration-300 ${
                        location === item.path
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-transparent">{children}</main>
      </div>
    </div>
  );
}