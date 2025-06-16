import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { ProgressSection } from "@/components/dashboard/progress-section";
import { AchievementsSection } from "@/components/dashboard/achievements-section";
import { LeaderboardSection } from "@/components/dashboard/leaderboard-section";
import { RecommendedCourses } from "@/components/dashboard/recommended-courses";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Mobile sidebar (shown when toggled) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={toggleSidebar}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white/10 backdrop-blur-xl border-r border-white/20" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop sidebar (always visible on md+) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 pb-16 md:pb-4 space-y-6">
          <WelcomeCard />
          <ProgressSection />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AchievementsSection />
            <LeaderboardSection />
          </div>
          
          <RecommendedCourses />
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
