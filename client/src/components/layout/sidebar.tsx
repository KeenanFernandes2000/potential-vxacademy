
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { GraduationCap, Home, BookOpen, Award, Trophy, MessageSquare, Users, Settings, BarChart3, UserCheck } from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    // Special case for dashboard
    if (path === "/dashboard" && (location === "/dashboard" || location === "/")) {
      return true;
    }
    // For other routes, check if the location starts with the path
    return location.startsWith(path);
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900/95 backdrop-blur-xl text-white shadow-2xl border-r border-white/10">
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <GraduationCap className="h-8 w-8 text-teal-400 mr-3" />
        <span className="font-bold text-xl bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">VX Academy</span>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        <nav className="mt-6">
          <div className="px-6 py-2 text-slate-400 uppercase text-xs font-semibold tracking-wider">Main</div>
          
          <Link href="/dashboard">
            <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
              isActive("/dashboard") 
                ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
            }`}>
              <Home className="h-5 w-5 mr-3" />
              <span className="font-medium">Dashboard</span>
            </div>
          </Link>
          
          <Link href="/courses">
            <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
              isActive("/courses") 
                ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
            }`}>
              <BookOpen className="h-5 w-5 mr-3" />
              <span className="font-medium">My Courses</span>
            </div>
          </Link>
          
          <Link href="/achievements">
            <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
              isActive("/achievements") 
                ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
            }`}>
              <Award className="h-5 w-5 mr-3" />
              <span className="font-medium">Achievements</span>
            </div>
          </Link>
          
          <Link href="/leaderboard">
            <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
              isActive("/leaderboard") 
                ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
            }`}>
              <Trophy className="h-5 w-5 mr-3" />
              <span className="font-medium">Leaderboard</span>
            </div>
          </Link>
          
          <Link href="/ai-tutor">
            <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
              isActive("/ai-tutor") 
                ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
            }`}>
              <MessageSquare className="h-5 w-5 mr-3" />
              <span className="font-medium">AI Tutor</span>
            </div>
          </Link>
          
          {/* Admin-specific menu items */}
          {user?.role === "admin" && (
            <>
              <div className="px-6 py-2 mt-6 text-slate-400 uppercase text-xs font-semibold tracking-wider">Admin</div>
              
              <Link href="/admin/dashboard">
                <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
                  isActive("/admin/dashboard") 
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                    : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
                }`}>
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <span className="font-medium">Admin Portal</span>
                </div>
              </Link>
              
              <Link href="/admin/users">
                <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
                  isActive("/admin/users") 
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                    : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
                }`}>
                  <Users className="h-5 w-5 mr-3" />
                  <span className="font-medium">User Management</span>
                </div>
              </Link>
              
              <Link href="/admin/roles">
                <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
                  isActive("/admin/roles") 
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                    : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
                }`}>
                  <UserCheck className="h-5 w-5 mr-3" />
                  <span className="font-medium">Role Management</span>
                </div>
              </Link>
              
              <Link href="/admin/course-management">
                <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
                  isActive("/admin/course-management") 
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                    : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
                }`}>
                  <Settings className="h-5 w-5 mr-3" />
                  <span className="font-medium">Content Management</span>
                </div>
              </Link>
              
              <Link href="/admin/analytics">
                <div className={`flex items-center mx-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 sidebar-link ${
                  isActive("/admin/analytics") 
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg" 
                    : "hover:bg-white/10 text-slate-300 hover:text-white hover:shadow-md"
                }`}>
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <span className="font-medium">Analytics</span>
                </div>
              </Link>
            </>
          )}
        </nav>
      </div>
      
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-lg font-bold mr-4 shadow-lg">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="font-medium text-white">{user?.name || "User"}</div>
            <div className="text-xs text-slate-400">
              {user?.role === "admin" ? "Administrator" : 
               user?.role === "supervisor" ? "Supervisor" : 
               user?.role === "content_creator" ? "Content Creator" : 
               "Healthcare Staff"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
