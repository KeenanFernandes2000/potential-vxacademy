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
    <div className="hidden md:flex flex-col w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 text-white shadow-2xl relative">
      {/* Header */}
      <div className="p-6 flex items-center justify-center border-b border-white/20 bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
        <span className="material-icons text-3xl mr-3 text-teal-400">school</span>
        <span className="font-bold text-xl bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">VX Academy</span>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        <nav className="mt-6 px-3">
          <div className="px-3 py-2 text-white/60 uppercase text-xs font-semibold tracking-wider">Main</div>
          <div className="space-y-1">
            <Link href="/dashboard">
              <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                isActive("/dashboard") 
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                  : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              }`}>
                <span className="material-icons mr-3 text-current">dashboard</span>
                <span className="font-medium">Dashboard</span>
              </div>
            </Link>
            <Link href="/courses">
              <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                isActive("/courses") 
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                  : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              }`}>
                <span className="material-icons mr-3 text-current">school</span>
                <span className="font-medium">My Courses</span>
              </div>
            </Link>
            <Link href="/achievements">
              <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                isActive("/achievements") 
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                  : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              }`}>
                <span className="material-icons mr-3 text-current">military_tech</span>
                <span className="font-medium">Achievements</span>
              </div>
            </Link>
            <Link href="/leaderboard">
              <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                isActive("/leaderboard") 
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                  : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              }`}>
                <span className="material-icons mr-3 text-current">leaderboard</span>
                <span className="font-medium">Leaderboard</span>
              </div>
            </Link>
            <Link href="/ai-tutor">
              <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                isActive("/ai-tutor") 
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                  : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              }`}>
                <span className="material-icons mr-3 text-current">forum</span>
                <span className="font-medium">AI Tutor</span>
              </div>
            </Link>
          </div>
          
          {/* Admin-specific menu items */}
          {user?.role === "admin" && (
            <>
              <div className="px-3 py-2 mt-8 text-white/60 uppercase text-xs font-semibold tracking-wider">Admin</div>
              <div className="space-y-1">
                <Link href="/admin/users">
                  <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                    isActive("/admin/users") 
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                      : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                  }`}>
                    <span className="material-icons mr-3 text-current">verified_user</span>
                    <span className="font-medium">User Management</span>
                  </div>
                </Link>
                <Link href="/admin/roles">
                  <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                    isActive("/admin/roles") 
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                      : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                  }`}>
                    <span className="material-icons mr-3 text-current">admin_panel_settings</span>
                    <span className="font-medium">Role Management</span>
                  </div>
                </Link>
                <Link href="/admin/course-management">
                  <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                    isActive("/admin/course-management") 
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                      : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                  }`}>
                    <span className="material-icons mr-3 text-current">category</span>
                    <span className="font-medium">Content Management</span>
                  </div>
                </Link>
                <Link href="/admin/analytics">
                  <div className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                    isActive("/admin/analytics") 
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105" 
                      : "hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                  }`}>
                    <span className="material-icons mr-3 text-current">analytics</span>
                    <span className="font-medium">Analytics</span>
                  </div>
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10">
        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all duration-300">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center text-lg font-bold mr-3 text-white shadow-lg">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1">
            <div className="font-medium text-white">{user?.name || "User"}</div>
            <div className="text-xs text-white/70">
              {user?.role === "admin" ? "Administrator" : 
               user?.role === "supervisor" ? "Supervisor" : 
               user?.role === "content_creator" ? "Content Creator" : 
               "VX Staff"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
