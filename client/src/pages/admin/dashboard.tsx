import { useQuery } from "@tanstack/react-query";
import { ApiResponse, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, Users, BookOpen, GraduationCap, Award } from "lucide-react";

// Dashboard summary types
type AdminStats = {
  users: {
    total: number;
    byRole: { role: string; count: number }[];
  };
  courses: {
    total: number;
    byModule: { moduleName: string; count: number }[];
  };
  progress: {
    totalCompletions: number;
    completionRate: number;
    topCourses: { courseName: string; completions: number }[];
  };
  badges: {
    totalAwarded: number;
  };
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/stats");
        return await res.json();
      } catch (error) {
        // If the API is not implemented yet, return mock data for UI development
        return {
          users: {
            total: 0,
            byRole: []
          },
          courses: {
            total: 0,
            byModule: []
          },
          progress: {
            totalCompletions: 0,
            completionRate: 0,
            topCourses: []
          },
          badges: {
            totalAwarded: 0
          }
        };
      }
    },
  });

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Welcome to the VX Academy Administration Portal</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SummaryCard
                title="Total Users"
                value={stats?.users.total || 0}
                description="Registered platform users"
                icon={<Users className="h-8 w-8 text-teal-500" />}
                gradient="from-teal-500 to-cyan-500"
              />
              <SummaryCard
                title="Total Courses"
                value={stats?.courses.total || 0}
                description="Available training courses"
                icon={<BookOpen className="h-8 w-8 text-blue-500" />}
                gradient="from-blue-500 to-indigo-500"
              />
              <SummaryCard
                title="Completions"
                value={stats?.progress.totalCompletions || 0}
                description="Course completions"
                icon={<GraduationCap className="h-8 w-8 text-green-500" />}
                gradient="from-green-500 to-emerald-500"
              />
              <SummaryCard
                title="Badges Awarded"
                value={stats?.badges.totalAwarded || 0}
                description="Achievement badges earned"
                icon={<Award className="h-8 w-8 text-orange-500" />}
                gradient="from-orange-500 to-red-500"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800">Users by Role</CardTitle>
                  <CardDescription className="text-slate-600">Distribution of users by role type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats?.users.byRole || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="role" angle={-45} textAnchor="end" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)'
                          }} 
                        />
                        <Bar dataKey="count" fill="url(#tealGradient)" name="Users" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#0891b2" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800">Top Courses</CardTitle>
                  <CardDescription className="text-slate-600">Most completed courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats?.progress.topCourses || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="courseName" angle={-45} textAnchor="end" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)'
                          }} 
                        />
                        <Bar dataKey="completions" fill="url(#orangeGradient)" name="Completions" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Section */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-800">Quick Actions</CardTitle>
                <CardDescription className="text-slate-600">Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <QuickActionLink
                    href="/admin/course-management"
                    title="Manage Courses"
                    description="Add, edit, or delete courses"
                    gradient="from-teal-500 to-cyan-500"
                  />
                  <QuickActionLink
                    href="/admin/users"
                    title="Manage Users"
                    description="Review and manage user accounts"
                    gradient="from-blue-500 to-indigo-500"
                  />
                  <QuickActionLink
                    href="/admin/modules"
                    title="Manage Modules"
                    description="Create and organize training modules"
                    gradient="from-green-500 to-emerald-500"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

function SummaryCard({ title, value, description, icon, gradient }: SummaryCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-slate-600 font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionLinkProps {
  href: string;
  title: string;
  description: string;
  gradient: string;
}

function QuickActionLink({ href, title, description, gradient }: QuickActionLinkProps) {
  return (
    <a
      href={href}
      className="group block p-6 rounded-2xl border border-slate-200/50 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg transition-all duration-300 hover:scale-105"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}></div>
      <h3 className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </a>
  );
}