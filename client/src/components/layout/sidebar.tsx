import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

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
    <div className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl text-slate-700">
      <div className="p-6 flex items-center justify-center border-b border-slate-200/50">
        <span className="material-icons text-3xl mr-3 text-teal-600">school</span>
        <span className="font-heading font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">VX Academy</span>
      </div>
      <div className="overflow-y-auto flex-grow">
        <nav className="mt-6 px-4">
          <div className="px-2 py-3 text-slate-500 uppercase text-xs font-semibold tracking-wider">Main</div>
          <Link href="/dashboard">
            <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group ${
              isActive("/dashboard") 
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25" 
                : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            }`}>
              <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </div>
          </Link>
          <Link href="/courses">
            <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group mt-1 ${
              isActive("/courses") 
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25" 
                : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            }`}>
              <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">school</span>
              <span className="font-medium">My Courses</span>
            </div>
          </Link>
          <Link href="/achievements">
            <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group mt-1 ${
              isActive("/achievements") 
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25" 
                : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            }`}>
              <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">military_tech</span>
              <span className="font-medium">Achievements</span>
            </div>
          </Link>
          <Link href="/leaderboard">
            <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group mt-1 ${
              isActive("/leaderboard") 
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25" 
                : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            }`}>
              <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">leaderboard</span>
              <span className="font-medium">Leaderboard</span>
            </div>
          </Link>
          <Link href="/ai-tutor">
            <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group mt-1 ${
              isActive("/ai-tutor") 
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25" 
                : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            }`}>
              <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">forum</span>
              <span className="font-medium">AI Tutor</span>
            </div>
          </Link>
          
          {/* Admin-specific menu items */}
          {user?.role === "admin" && (
            <>
              <div className="px-2 py-3 mt-8 text-slate-500 uppercase text-xs font-semibold tracking-wider">Admin</div>
              <Link href="/admin/users">
                <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                  isActive("/admin/users") 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25" 
                    : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                }`}>
                  <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">verified_user</span>
                  <span className="font-medium">User Management</span>
                </div>
              </Link>
              <Link href="/admin/roles">
                <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group mt-1 ${
                  isActive("/admin/roles") 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25" 
                    : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                }`}>
                  <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">admin_panel_settings</span>
                  <span className="font-medium">Role Management</span>
                </div>
              </Link>
              <Link href="/admin/course-management">
                <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group mt-1 ${
                  isActive("/admin/course-management") 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25" 
                    : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                }`}>
                  <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">category</span>
                  <span className="font-medium">Content Management</span>
                </div>
              </Link>
              <Link href="/admin/analytics">
                <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group mt-1 ${
                  isActive("/admin/analytics") 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25" 
                    : "hover:bg-slate-100/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                }`}>
                  <span className="material-icons mr-3 text-lg group-hover:scale-110 transition-transform">analytics</span>
                  <span className="font-medium">Analytics</span>
                </div>
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="p-6 border-t border-slate-200/50 bg-white/40 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-lg font-bold text-white mr-4 shadow-lg">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="font-semibold text-slate-800">{user?.name || "User"}</div>
            <div className="text-sm text-slate-500">
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
