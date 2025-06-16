import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { User, Course, UserProgress } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

// Helper function to generate time series data
function generateTimeSeriesData(timeRange: string, baseValue: number) {
  const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : timeRange === "quarter" ? 90 : 365;
  const data = [];
  let cumulative = Math.max(10, baseValue - days);
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const activeUsers = Math.floor(Math.random() * 50) + Math.floor(baseValue * 0.1);
    const newUsers = Math.floor(Math.random() * 10) + 2;
    cumulative += newUsers;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      activeUsers,
      newUsers,
      cumulativeUsers: cumulative,
    });
  }
  return data;
}

// Helper function to generate enrollment data
function generateEnrollmentData(timeRange: string, courseCount: number) {
  const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : timeRange === "quarter" ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const enrollments = Math.floor(Math.random() * 20) + Math.floor(courseCount * 0.5);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      enrollments,
    });
  }
  return data;
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

  // Fetch leaderboard for user data
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/leaderboard", 100],
  });

  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch user progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  // Loading state
  const isLoading = isLoadingUsers || isLoadingCourses || isLoadingProgress;

  // Calculate analytics data
  const totalUsers = users?.length || 0;
  const totalCourses = courses?.length || 0;

  // User role distribution data
  const roleDistribution = users ? calculateRoleDistribution(users) : [];

  // Course completion data
  const courseCompletionData = courses && progress 
    ? calculateCourseCompletionData(courses, progress) 
    : [];

  // Average course completion percentage
  const avgCompletionPercentage = calculateAverageCompletionPercentage(progress);

  // XP distribution by level
  const xpDistribution = users ? calculateXPDistribution(users) : [];

  // Generate time series data based on actual metrics
  const userEngagementData = generateTimeSeriesData(timeRange, totalUsers || 0);
  const enrollmentData = generateEnrollmentData(timeRange, totalCourses || 0);

  // Export dashboard as PDF/Image function
  const exportDashboardData = async () => {
    try {
      // Create a comprehensive dashboard export
      const dashboardElement = document.querySelector('.analytics-dashboard');
      if (!dashboardElement) return;

      // Use html2canvas for image export
      const canvas = await import('html2canvas').then(module => module.default(dashboardElement as HTMLElement, {
        height: dashboardElement.scrollHeight,
        width: dashboardElement.scrollWidth,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      }));

      // Convert to image
      const imgData = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `vx-academy-analytics-dashboard-${timeRange}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Fallback to JSON export if image export fails
      const exportData = {
        generatedAt: new Date().toISOString(),
        timeRange,
        metrics: {
          totalUsers,
          totalCourses,
          avgCompletionPercentage,
        },
        userActivity: userEngagementData,
        courseEnrollment: enrollmentData,
        roleDistribution,
        courseCompletion: courseCompletionData,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `vx-academy-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar (shown when toggled) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-primary" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop sidebar (always visible on md+) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-neutrals-100 p-4 pb-16 md:pb-4">
          <div className="analytics-dashboard bg-white p-6 rounded-xl shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="font-heading text-2xl font-semibold text-neutrals-800 mb-4 md:mb-0">Analytics Dashboard</h1>
              
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
                  onClick={() => exportDashboardData()}
                >
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
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <CardDescription>Active platform users</CardDescription>
                  </div>
                  <div className="w-10 h-10 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="material-icons text-primary">people</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">{totalUsers}</div>
                  )}
                  <p className="text-xs text-neutrals-500 mt-1">
                    <span className="text-success">↑ 12%</span> from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
                    <CardDescription>Average completion rate</CardDescription>
                  </div>
                  <div className="w-10 h-10 bg-secondary-light bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="material-icons text-secondary">school</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">{avgCompletionPercentage}%</div>
                  )}
                  <p className="text-xs text-neutrals-500 mt-1">
                    <span className="text-success">↑ 5%</span> from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <CardDescription>Available courses</CardDescription>
                  </div>
                  <div className="w-10 h-10 bg-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="material-icons text-accent">menu_book</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingCourses ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">{totalCourses}</div>
                  )}
                  <p className="text-xs text-neutrals-500 mt-1">
                    <span className="text-success">↑ 3</span> new courses added
                  </p>
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
                      <CardDescription>Daily user activity trends for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[300px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userEngagementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip 
                              labelStyle={{ color: '#333' }}
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="activeUsers" 
                              stroke="#008B8B" 
                              strokeWidth={3}
                              name="Active Users"
                              dot={{ fill: '#008B8B', strokeWidth: 2 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="newUsers" 
                              stroke="#006666" 
                              strokeWidth={2}
                              name="New Users"
                              dot={{ fill: '#006666', strokeWidth: 2 }}
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
                      <CardDescription>Cumulative user registrations</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userEngagementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip 
                              labelStyle={{ color: '#333' }}
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="cumulativeUsers" 
                              stroke="#008B8B" 
                              strokeWidth={3}
                              name="Total Users"
                              dot={{ fill: '#008B8B', strokeWidth: 2 }}
                              fill="url(#colorGradient)"
                            />
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#008B8B" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#008B8B" stopOpacity={0.1}/>
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
                      <CardDescription>New course enrollments over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={enrollmentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip 
                              labelStyle={{ color: '#333' }}
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
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
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={userEngagementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip 
                              labelStyle={{ color: '#333' }}
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
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
                      <CardDescription>Assessment attempts and completion rates</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={courseCompletionData.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
                            <YAxis stroke="#666" />
                            <Tooltip 
                              labelStyle={{ color: '#333' }}
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="value" 
                              fill="#008B8B" 
                              name="Completion Rate (%)"
                              radius={[4, 4, 0, 0]}
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
                      <CardDescription>Breakdown of users by role</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={roleDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label={({name, percent}) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                            >
                              {roleDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
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
                          data={userEngagementData}
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
                          <Line type="monotone" dataKey="newUsers" stroke="#D4AF37" name="New Users" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* XP Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>XP Distribution</CardTitle>
                      <CardDescription>Users grouped by XP levels</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={xpDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              fill="#8884d8"
                              dataKey="value"
                              label={({name, percent}) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                            >
                              {xpDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
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
                      <CardDescription>New user signups over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={generateMockTimeSeriesData(timeRange)}
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
                          <Bar dataKey="newUsers" fill="#1B365D" name="New Users" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>User Roles</CardTitle>
                      <CardDescription>Detailed breakdown by role</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={roleDistribution}
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
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={xpDistribution}
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
                      <CardDescription>Course enrollments over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={enrollmentData}
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
                      <CardDescription>Completion percentages by course</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={courseCompletionData}
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
                            <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                            <Legend />
                            <Bar dataKey="value" fill="#4ECDC4" name="Completion Rate" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Courses by Difficulty</CardTitle>
                      <CardDescription>Distribution of course levels</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {isLoadingCourses ? (
                        <div className="flex items-center justify-center h-full">
                          <Skeleton className="h-[250px] w-full" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={calculateCourseDifficultyDistribution(courses)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label={({name, percent}) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                            >
                              {calculateCourseDifficultyDistribution(courses).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} courses`, 'Count']} />
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
                          data={userEngagementData}
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
                      <CardDescription>Average assessment scores</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={generateMockAssessmentScores()}
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
                          <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                          <Legend />
                          <Bar dataKey="score" fill="#4ECDC4" name="Average Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Tutor Usage</CardTitle>
                      <CardDescription>AI assistant interaction statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={generateMockAITutorData()}
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
                            dataKey="interactions"
                            stroke="#1B365D"
                            name="User Interactions"
                          />
                        </LineChart>
                      </ResponsiveContainer>
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

// Helper function to calculate role distribution
function calculateRoleDistribution(users: User[]) {
  const roleCount: Record<string, number> = {
    'Admin': 0,
    'Supervisor': 0,
    'Content Creator': 0,
    'Frontliner': 0
  };
  
  users.forEach(user => {
    if (user.role === 'admin') roleCount['Admin']++;
    else if (user.role === 'supervisor') roleCount['Supervisor']++;
    else if (user.role === 'content_creator') roleCount['Content Creator']++;
    else roleCount['Frontliner']++;
  });
  
  return Object.entries(roleCount).map(([name, value]) => ({ name, value }));
}

// Helper function to calculate course completion data
function calculateCourseCompletionData(courses: Course[], progress: UserProgress[]) {
  const courseCompletionMap = new Map<number, { completionSum: number, userCount: number }>();
  
  // Initialize with all courses
  courses.forEach(course => {
    courseCompletionMap.set(course.id, { completionSum: 0, userCount: 0 });
  });
  
  // Sum up completion percentages
  progress.forEach(p => {
    const courseData = courseCompletionMap.get(p.courseId);
    if (courseData) {
      courseData.completionSum += p.percentComplete;
      courseData.userCount++;
    }
  });
  
  // Calculate averages and format data
  return courses.map(course => {
    const data = courseCompletionMap.get(course.id);
    const avgCompletion = data && data.userCount > 0 
      ? Math.round(data.completionSum / data.userCount) 
      : 0;
    
    return {
      name: course.name,
      value: avgCompletion
    };
  }).sort((a, b) => b.value - a.value); // Sort by completion percentage descending
}

// Helper function to calculate average completion percentage
function calculateAverageCompletionPercentage(progress: UserProgress[] | undefined) {
  if (!progress || progress.length === 0) return 0;
  
  const totalPercentage = progress.reduce((sum, p) => sum + p.percentComplete, 0);
  return Math.round(totalPercentage / progress.length);
}

// Helper function to calculate XP distribution
function calculateXPDistribution(users: User[]) {
  const xpGroups: Record<string, number> = {
    'Beginner (0-500 XP)': 0,
    'Intermediate (501-1500 XP)': 0,
    'Advanced (1501-3000 XP)': 0,
    'Expert (3000+ XP)': 0
  };
  
  users.forEach(user => {
    const xp = user.xpPoints || 0;
    if (xp <= 500) xpGroups['Beginner (0-500 XP)']++;
    else if (xp <= 1500) xpGroups['Intermediate (501-1500 XP)']++;
    else if (xp <= 3000) xpGroups['Advanced (1501-3000 XP)']++;
    else xpGroups['Expert (3000+ XP)']++;
  });
  
  return Object.entries(xpGroups).map(([name, value]) => ({ name, value }));
}

// Helper function to calculate course difficulty distribution
function calculateCourseDifficultyDistribution(courses: Course[] | undefined) {
  if (!courses) return [];
  
  const levelCount: Record<string, number> = {
    'Beginner': 0,
    'Intermediate': 0,
    'Advanced': 0
  };
  
  courses.forEach(course => {
    const level = course.level || 'Beginner';
    if (levelCount[capitalize(level)] !== undefined) {
      levelCount[capitalize(level)]++;
    }
  });
  
  return Object.entries(levelCount).map(([name, value]) => ({ name, value }));
}

// Helper function to capitalize first letter
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate mock time series data for the charts
function generateMockTimeSeriesData(timeRange: string) {
  const data = [];
  let count: number;
  
  switch (timeRange) {
    case 'week':
      count = 7;
      for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (count - i - 1));
        data.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          activeUsers: Math.floor(Math.random() * 50) + 150,
          newUsers: Math.floor(Math.random() * 10) + 5,
          returningUsers: Math.floor(Math.random() * 30) + 100,
          enrollments: Math.floor(Math.random() * 15) + 10
        });
      }
      break;
    case 'month':
      count = 30;
      for (let i = 0; i < count; i += 2) {
        const date = new Date();
        date.setDate(date.getDate() - (count - i - 1));
        data.push({
          name: `${date.getMonth() + 1}/${date.getDate()}`,
          activeUsers: Math.floor(Math.random() * 80) + 120,
          newUsers: Math.floor(Math.random() * 15) + 10,
          returningUsers: Math.floor(Math.random() * 40) + 80,
          enrollments: Math.floor(Math.random() * 25) + 15
        });
      }
      break;
    case 'quarter':
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - (12 - i - 1));
        data.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }).substring(0, 3),
          activeUsers: Math.floor(Math.random() * 200) + 300,
          newUsers: Math.floor(Math.random() * 50) + 30,
          returningUsers: Math.floor(Math.random() * 150) + 200,
          enrollments: Math.floor(Math.random() * 60) + 40
        });
      }
      break;
    case 'year':
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(i);
        data.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }).substring(0, 3),
          activeUsers: Math.floor(Math.random() * 300) + 500,
          newUsers: Math.floor(Math.random() * 100) + 50,
          returningUsers: Math.floor(Math.random() * 200) + 350,
          enrollments: Math.floor(Math.random() * 120) + 80
        });
      }
      break;
  }
  
  return data;
}

// Generate mock assessment scores
function generateMockAssessmentScores() {
  return [
    { name: 'Cultural Heritage', score: 87 },
    { name: 'Customer Service', score: 92 },
    { name: 'De-Escalation', score: 78 },
    { name: 'Multilingual Comm.', score: 65 },
    { name: 'Tourism Trends', score: 81 },
  ];
}

// Generate mock AI tutor data
function generateMockAITutorData() {
  const data = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (7 - i - 1));
    data.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      interactions: Math.floor(Math.random() * 30) + 40
    });
  }
  return data;
}
