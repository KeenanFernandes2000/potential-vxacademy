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
    <div className="hidden md:flex flex-col w-64 bg-gradient-to-b from-abu-charcoal via-abu-charcoal to-abu-charcoal/95 text-white shadow-2xl">
      <div className="p-6 flex items-center justify-center border-b border-abu-gold/20 bg-gradient-to-r from-abu-charcoal to-abu-charcoal/90">
        <span className="material-icons text-3xl mr-3 text-abu-gold">school</span>
        <span className="font-heading font-bold text-xl bg-gradient-to-r from-abu-gold to-abu-gold/80 bg-clip-text text-transparent">VX Academy</span>
      </div>
      <div className="overflow-y-auto flex-grow">
        <nav className="mt-6 px-2">
          <div className="px-4 py-3 text-abu-gold/70 uppercase text-xs font-semibold tracking-wider">Main</div>
          <Link href="/dashboard">
            <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/dashboard") ? "sidebar-active" : "sidebar-hover"}`}>
              <span className="material-icons mr-3 text-lg">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </div>
          </Link>
          <Link href="/courses">
            <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/courses") ? "sidebar-active" : "sidebar-hover"}`}>
              <span className="material-icons mr-3 text-lg">school</span>
              <span className="font-medium">My Courses</span>
            </div>
          </Link>
          <Link href="/achievements">
            <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/achievements") ? "sidebar-active" : "sidebar-hover"}`}>
              <span className="material-icons mr-3 text-lg">military_tech</span>
              <span className="font-medium">Achievements</span>
            </div>
          </Link>
          <Link href="/leaderboard">
            <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/leaderboard") ? "sidebar-active" : "sidebar-hover"}`}>
              <span className="material-icons mr-3 text-lg">leaderboard</span>
              <span className="font-medium">Leaderboard</span>
            </div>
          </Link>
          <Link href="/ai-tutor">
            <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/ai-tutor") ? "sidebar-active" : "sidebar-hover"}`}>
              <span className="material-icons mr-3 text-lg">forum</span>
              <span className="font-medium">AI Tutor</span>
            </div>
          </Link>
          
          {/* Admin-specific menu items */}
          {user?.role === "admin" && (
            <>
              <div className="px-4 py-3 mt-8 text-abu-gold/70 uppercase text-xs font-semibold tracking-wider border-t border-abu-gold/10 pt-6">Admin</div>
              <Link href="/admin/users">
                <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/admin/users") ? "sidebar-active" : "sidebar-hover"}`}>
                  <span className="material-icons mr-3 text-lg">verified_user</span>
                  <span className="font-medium">User Management</span>
                </div>
              </Link>
              <Link href="/admin/roles">
                <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/admin/roles") ? "sidebar-active" : "sidebar-hover"}`}>
                  <span className="material-icons mr-3 text-lg">admin_panel_settings</span>
                  <span className="font-medium">Role Management</span>
                </div>
              </Link>
              <Link href="/admin/course-management">
                <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/admin/course-management") ? "sidebar-active" : "sidebar-hover"}`}>
                  <span className="material-icons mr-3 text-lg">category</span>
                  <span className="font-medium">Content Management</span>
                </div>
              </Link>
              <Link href="/admin/analytics">
                <div className={`flex items-center px-4 py-3 mx-2 cursor-pointer transition-all duration-300 ${isActive("/admin/analytics") ? "sidebar-active" : "sidebar-hover"}`}>
                  <span className="material-icons mr-3 text-lg">analytics</span>
                  <span className="font-medium">Analytics</span>
                </div>
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="p-6 border-t border-abu-gold/20 bg-gradient-to-r from-abu-charcoal/90 to-abu-charcoal">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-abu-gold to-abu-gold/80 flex items-center justify-center text-lg font-bold mr-4 text-abu-charcoal shadow-lg">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="font-semibold text-white">{user?.name || "User"}</div>
            <div className="text-xs text-abu-gold/80 font-medium">
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
