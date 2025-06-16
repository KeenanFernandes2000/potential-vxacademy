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
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-abu-charcoal to-abu-charcoal/80 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Monitor and manage your VX Academy platform</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-abu-primary" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="fade-in">
                <SummaryCard
                  title="Total Users"
                  value={stats?.users.total || 0}
                  description="Registered platform users"
                  icon={<Users className="h-10 w-10 text-abu-primary" />}
                />
              </div>
              <div className="fade-in" style={{ animationDelay: '0.1s' }}>
                <SummaryCard
                  title="Total Courses"
                  value={stats?.courses.total || 0}
                  description="Available training courses"
                  icon={<BookOpen className="h-10 w-10 text-abu-primary" />}
                />
              </div>
              <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                <SummaryCard
                  title="Completions"
                  value={stats?.progress.totalCompletions || 0}
                  description="Course completions"
                  icon={<GraduationCap className="h-10 w-10 text-abu-primary" />}
                />
              </div>
              <div className="fade-in" style={{ animationDelay: '0.3s' }}>
                <SummaryCard
                  title="Badges Awarded"
                  value={stats?.badges.totalAwarded || 0}
                  description="Achievement badges earned"
                  icon={<Award className="h-10 w-10 text-abu-primary" />}
                />
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="fade-in" style={{ animationDelay: '0.4s' }}>
                <Card className="card-abu-glass glow-hover">
                  <CardHeader>
                    <CardTitle className="text-abu-charcoal">Users by Role</CardTitle>
                    <CardDescription>Distribution of users by role type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.users.byRole || []}
                          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="role" angle={-45} textAnchor="end" />
                          <YAxis />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                          <Bar dataKey="count" fill="url(#primaryGradient)" name="Users" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C8102E" />
                              <stop offset="100%" stopColor="#C8102E80" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="fade-in" style={{ animationDelay: '0.5s' }}>
                <Card className="card-abu-glass glow-hover">
                  <CardHeader>
                    <CardTitle className="text-abu-charcoal">Top Courses</CardTitle>
                    <CardDescription>Most completed courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.progress.topCourses || []}
                          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="courseName" angle={-45} textAnchor="end" />
                          <YAxis />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                          <Bar dataKey="completions" fill="url(#goldGradient)" name="Completions" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C9A16F" />
                              <stop offset="100%" stopColor="#C9A16F80" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="fade-in" style={{ animationDelay: '0.6s' }}>
              <Card className="card-abu-glass glow-hover">
                <CardHeader>
                  <CardTitle className="text-abu-charcoal">Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickActionLink
                      href="/admin/course-management"
                      title="Manage Courses"
                      description="Add, edit, or delete courses"
                    />
                    <QuickActionLink
                      href="/admin/users"
                      title="Manage Users"
                      description="Review and manage user accounts"
                    />
                    <QuickActionLink
                      href="/admin/modules"
                      title="Manage Modules"
                      description="Create and organize training modules"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
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
}

function SummaryCard({ title, value, description, icon }: SummaryCardProps) {
  return (
    <Card className="card-abu-glass glow-hover scale-in">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-abu-charcoal to-abu-primary bg-clip-text text-transparent mb-1">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className="bg-gradient-to-r from-abu-primary/10 to-abu-primary/5 p-3 rounded-xl">
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
}

function QuickActionLink({ href, title, description }: QuickActionLinkProps) {
  return (
    <a
      href={href}
      className="block p-6 rounded-xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/30 hover:border-abu-primary/30 hover:shadow-lg hover:shadow-abu-primary/10 transition-all duration-300 hover:scale-105 glow-hover"
    >
      <h3 className="font-semibold text-abu-charcoal mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}