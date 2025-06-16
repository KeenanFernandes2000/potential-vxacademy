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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl text-slate-700">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-teal-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">VX Academy</h1>
          </div>
          <p className="text-sm text-slate-500 mt-2 font-medium">Administration Portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      location === item.path
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    <span className={`transition-transform group-hover:scale-110 ${location === item.path ? 'text-white' : 'text-slate-500'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t border-slate-200/50 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center text-lg shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="ghost"
              className="flex-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100/80 transition-all duration-200"
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
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100/80 transition-all duration-200"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg text-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-teal-600" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">VX Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100/80"
              >
                <Link href="/">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100/80"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <nav className="overflow-x-auto py-3 mt-3">
            <ul className="flex space-x-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all duration-300 ${
                        location === item.path
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                          : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-teal-50/50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}