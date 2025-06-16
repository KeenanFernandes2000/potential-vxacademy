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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-abu-charcoal via-abu-charcoal to-abu-charcoal/95 text-white shadow-2xl">
        <div className="p-6 border-b border-abu-gold/20 bg-gradient-to-r from-abu-charcoal to-abu-charcoal/90">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-abu-gold" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-abu-gold to-abu-gold/80 bg-clip-text text-transparent">VX Academy</h1>
              <p className="text-xs text-abu-gold/70 font-medium tracking-wide">Administration Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location === item.path
                        ? "admin-sidebar-active shadow-lg"
                        : "text-gray-300 hover:text-white admin-sidebar-hover"
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
        <div className="p-6 border-t border-abu-gold/20 bg-gradient-to-r from-abu-charcoal/90 to-abu-charcoal">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-abu-gold to-abu-gold/80 text-abu-charcoal font-bold flex items-center justify-center uppercase text-lg shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-xs text-abu-gold/80 font-medium">{user.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="ghost"
              className="flex-1 text-gray-300 hover:text-white hover:bg-abu-primary/30 rounded-lg transition-all duration-300"
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
              className="text-gray-300 hover:text-white hover:bg-abu-primary/30 rounded-lg transition-all duration-300"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden bg-gradient-to-r from-abu-charcoal to-abu-charcoal/95 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-7 w-7 text-abu-gold" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-abu-gold to-abu-gold/80 bg-clip-text text-transparent">VX Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-abu-primary/30 rounded-lg transition-all duration-300"
              >
                <Link href="/">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-abu-primary/30 rounded-lg transition-all duration-300"
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
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap font-medium transition-all duration-300 ${
                        location === item.path
                          ? "bg-gradient-to-r from-abu-primary to-abu-primary/90 text-white shadow-lg"
                          : "bg-abu-charcoal/60 text-gray-300 hover:bg-abu-primary/20 hover:text-white"
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
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-abu-sand/30 via-abu-soft-gray/50 to-white">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}