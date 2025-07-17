import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download } from "lucide-react";

const CHART_COLORS = ["#008B8B", "#006666", "#004444", "#E8F4F8", "#B0E0E6"];

interface AnalyticsData {
  summary: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    courseCompletions: number;
    avgCompletionRate: number;
    assessmentAttempts: number;
    avgAssessmentScore: number;
    passRate: number;
  };
  roleDistribution: Array<{ name: string; value: number }>;
  courseCompletion: Array<{
    name: string;
    completionRate: number;
    totalEnrolled: number;
    completedCount: number;
  }>;
  xpDistribution: Array<{ name: string; value: number }>;
  timeRange: {
    start: string;
    end: string;
    period: string;
  };
  enrollments: number;
}

interface TimeSeriesData {
  data: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
    enrollments: number;
    completions: number;
  }>;
  timeRange: string;
}

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const { user } = useAuth();

  // Redirect if not admin
  if (user && user.role !== "admin") {
    return <Redirect to="/" />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    refetch: refetchAnalytics,
  } = useQuery<AnalyticsData>({
    queryKey: [`/api/admin/analytics?timeRange=${timeRange}`],
    enabled: !!user && user.role === "admin",
  });

  // Fetch time series data
  const {
    data: timeSeriesData,
    isLoading: isLoadingTimeSeries,
    refetch: refetchTimeSeries,
  } = useQuery<TimeSeriesData>({
    queryKey: [`/api/admin/analytics/timeseries?timeRange=${timeRange}`],
    enabled: !!user && user.role === "admin",
  });

  // Loading state
  const isLoading = isLoadingAnalytics || isLoadingTimeSeries;

  // Export dashboard data
  const exportDashboardData = async () => {
    try {
      const exportData = {
        generatedAt: new Date().toISOString(),
        timeRange,
        analytics: analyticsData,
        timeSeries: timeSeriesData,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `vx-academy-analytics-${timeRange}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar (shown when toggled) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-64 bg-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop sidebar (always visible on md+) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-neutrals-100 py-8 px-8 pb-16 md:pb-4">
          <div className="analytics-dashboard bg-white p-6 rounded-xl shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="font-heading text-2xl font-semibold text-neutrals-800 mb-4 md:mb-0">
                Analytics Dashboard
              </h1>

              <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={async () => {
                    await Promise.all([
                      refetchAnalytics(),
                      refetchTimeSeries(),
                    ]);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="animate-spin mr-2">⏳</span>
                  ) : null}
                  Refresh
                </Button>

                <Button variant="outline" onClick={() => exportDashboardData()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Dashboard
                </Button>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <CardDescription>Active platform users</CardDescription>
                  </div>
                  <div className="w-10 h-10 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="material-icons text-primary">people</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalytics ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">
                      {analyticsData?.summary.totalUsers}
                    </div>
                  )}
                  {/* <p className="text-xs text-neutrals-500 mt-1">
                    <span className="text-success">↑ 12%</span> from last month
                  </p> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Course Completion
                    </CardTitle>
                    <CardDescription>Average completion rate</CardDescription>
                  </div>
                  <div className="w-10 h-10 bg-secondary-light bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="material-icons text-secondary">
                      school
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalytics ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">
                      {analyticsData?.summary.avgCompletionRate}%
                    </div>
                  )}
                  {/* <p className="text-xs text-neutrals-500 mt-1">
                    <span className="text-success">↑ 5%</span> from last month
                  </p> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Total Courses
                    </CardTitle>
                    <CardDescription>Available courses</CardDescription>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="material-icons text-accent">
                      menu_book
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalytics ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">
                      {analyticsData?.enrollments}
                    </div>
                  )}
                  {/* <p className="text-xs text-neutrals-500 mt-1">
                    <span className="text-success">↑ 3</span> new courses added
                  </p> */}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">User Analytics</TabsTrigger>
                <TabsTrigger value="courses">Course Analytics</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 1. User Activity Graph */}
                  <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                    <CardHeader>
                      <CardTitle>User Activity Over Time</CardTitle>
                      <CardDescription>
                        Daily user activity trends for the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      {isLoadingTimeSeries ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[300px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={timeSeriesData?.data}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip
                              labelStyle={{ color: "#333" }}
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="activeUsers"
                              stroke="#008B8B"
                              strokeWidth={3}
                              name="Active Users"
                              dot={{ fill: "#008B8B", strokeWidth: 2 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="newUsers"
                              stroke="#006666"
                              strokeWidth={2}
                              name="New Users"
                              dot={{ fill: "#006666", strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* 2. User Growth Graph */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>
                        Cumulative user registrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingTimeSeries ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={timeSeriesData?.data}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip
                              labelStyle={{ color: "#333" }}
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="activeUsers"
                              stroke="#008B8B"
                              strokeWidth={3}
                              name="Total Users"
                              dot={{ fill: "#008B8B", strokeWidth: 2 }}
                              fill="url(#colorGradient)"
                            />
                            <defs>
                              <linearGradient
                                id="colorGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#008B8B"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#008B8B"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* 3. Course Enrollment Graph */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Enrollment</CardTitle>
                      <CardDescription>
                        New course enrollments over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timeSeriesData?.data}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip
                              labelStyle={{ color: "#333" }}
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                              }}
                            />
                            <Bar
                              dataKey="enrollments"
                              fill="#006666"
                              name="New Enrollments"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* 4. Daily Active Users Graph */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Active Users</CardTitle>
                      <CardDescription>Users active each day</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingTimeSeries ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timeSeriesData?.data}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip
                              labelStyle={{ color: "#333" }}
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                              }}
                            />
                            <Bar
                              dataKey="activeUsers"
                              fill="#008B8B"
                              name="Daily Active Users"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* 5. Assessment Completion Graph */}
                  <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                      <CardTitle>Assessment Completion</CardTitle>
                      <CardDescription>
                        Average assessment scores and performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                name: "Average Score",
                                value:
                                  analyticsData?.summary.avgAssessmentScore ||
                                  0,
                              },
                              {
                                name: "Pass Rate",
                                value: analyticsData?.summary.passRate || 0,
                              },
                            ]}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                              formatter={(value) => [`${value}%`, "Percentage"]}
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill="#4ECDC4"
                              name="Performance"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* User Role Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Role Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of users by role
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData?.roleDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) =>
                                percent > 0.05
                                  ? `${name} (${(percent * 100).toFixed(0)}%)`
                                  : ""
                              }
                            >
                              {analyticsData?.roleDistribution.map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [`${value} users`, "Count"]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* User Activity Over Time */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Activity</CardTitle>
                      <CardDescription>Active users over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={timeSeriesData?.data}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="activeUsers"
                            stroke="#1B365D"
                            activeDot={{ r: 8 }}
                            name="Active Users"
                          />
                          <Line
                            type="monotone"
                            dataKey="newUsers"
                            stroke="#D4AF37"
                            name="New Users"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* XP Distribution */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>XP Distribution</CardTitle>
                      <CardDescription>
                        Users grouped by XP levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData?.xpDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                percent > 0.05
                                  ? `${name} (${(percent * 100).toFixed(0)}%)`
                                  : ""
                              }
                            >
                              {analyticsData?.xpDistribution.map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [`${value} users`, "Count"]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* User Analytics Tab */}
              <TabsContent value="users" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>
                        New user signups over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={timeSeriesData?.data}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="newUsers"
                            fill="#1B365D"
                            name="New Users"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Roles</CardTitle>
                      <CardDescription>
                        Detailed breakdown by role
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analyticsData?.roleDistribution}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#D4AF37" name="Users" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>XP Distribution</CardTitle>
                      <CardDescription>User achievement levels</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analyticsData?.xpDistribution}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#4ECDC4" name="Users" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Course Analytics Tab */}
              <TabsContent value="courses" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Course Enrollment</CardTitle>
                      <CardDescription>
                        Course enrollments over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={timeSeriesData?.data}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="enrollments"
                            stroke="#1B365D"
                            activeDot={{ r: 8 }}
                            name="Course Enrollments"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Completion Rates</CardTitle>
                      <CardDescription>
                        Completion percentages by course
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analyticsData?.courseCompletion}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                              formatter={(value) => [
                                `${value}%`,
                                "Completion Rate",
                              ]}
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill="#4ECDC4"
                              name="Completion Rate"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Courses by Difficulty</CardTitle>
                      <CardDescription>
                        Distribution of course levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={calculateCourseDifficultyDistribution(
                                analyticsData?.courseCompletion
                              )}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) =>
                                percent > 0.05
                                  ? `${name} (${(percent * 100).toFixed(0)}%)`
                                  : ""
                              }
                            >
                              {calculateCourseDifficultyDistribution(
                                analyticsData?.courseCompletion
                              ).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [
                                `${value} courses`,
                                "Count",
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Engagement Tab */}
              <TabsContent value="engagement" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Daily Active Users</CardTitle>
                      <CardDescription>User activity over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={timeSeriesData?.data}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="activeUsers"
                            stroke="#1B365D"
                            activeDot={{ r: 8 }}
                            name="Active Users"
                          />
                          <Line
                            type="monotone"
                            dataKey="returningUsers"
                            stroke="#D4AF37"
                            name="Returning Users"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment Completion</CardTitle>
                      <CardDescription>
                        Average assessment scores and performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                name: "Average Score",
                                value:
                                  analyticsData?.summary.avgAssessmentScore ||
                                  0,
                              },
                              {
                                name: "Pass Rate",
                                value: analyticsData?.summary.passRate || 0,
                              },
                            ]}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                              formatter={(value) => [`${value}%`, "Percentage"]}
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill="#4ECDC4"
                              name="Performance"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Activity Overview</CardTitle>
                      <CardDescription>
                        Recent user activity trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingTimeSeries ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={timeSeriesData?.data}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="activeUsers"
                              stroke="#1B365D"
                              name="Active Users"
                            />
                            <Line
                              type="monotone"
                              dataKey="newUsers"
                              stroke="#D4AF37"
                              name="New Users"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Engagement Metrics</CardTitle>
                      <CardDescription>
                        Key engagement statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                name: "Active Users",
                                value: analyticsData?.summary.activeUsers || 0,
                              },
                              {
                                name: "New Users",
                                value: analyticsData?.summary.newUsers || 0,
                              },
                              {
                                name: "Course Completions",
                                value:
                                  analyticsData?.summary.courseCompletions || 0,
                              },
                              {
                                name: "Assessment Attempts",
                                value:
                                  analyticsData?.summary.assessmentAttempts ||
                                  0,
                              },
                            ]}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#1B365D" name="Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}

// Helper function to calculate course difficulty distribution (simplified for now)
function calculateCourseDifficultyDistribution(courseData: any) {
  if (!courseData || !Array.isArray(courseData)) return [];

  // For now, return a simple distribution - this could be enhanced based on actual course data
  return [
    { name: "Beginner", value: Math.floor(courseData.length * 0.4) },
    { name: "Intermediate", value: Math.floor(courseData.length * 0.4) },
    { name: "Advanced", value: Math.floor(courseData.length * 0.2) },
  ];
}
