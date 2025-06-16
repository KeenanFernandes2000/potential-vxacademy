import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Auth Form */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="flex justify-center mb-8 lg:mb-12">
            <div className="flex items-center">
              <img
                src="/images/vx-academy-logo.svg"
                alt="VX Academy Logo"
                className="h-12 lg:h-16 filter brightness-125 drop-shadow-lg"
              />
            </div>
          </div>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 lg:mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-2 shadow-2xl">
              <TabsTrigger
                value="login"
                className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300 py-3 font-medium"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300 py-3 font-medium"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="fade-in">
              <Card className="border-0 shadow-2xl rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <CardHeader className="pb-6 px-6 pt-8 lg:px-8">
                  <CardTitle className="text-white text-2xl lg:text-3xl font-bold text-center">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-white/80 text-center text-base lg:text-lg">
                    Enter your credentials to access your VX Academy dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 lg:px-8">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium text-base">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your email"
                                {...field}
                                className="rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 py-3 lg:py-4 text-base"
                                type="email"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium text-base">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                                className="rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 py-3 lg:py-4 text-base"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl py-4 lg:py-6 font-semibold text-base lg:text-lg shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center pb-8 px-6 lg:px-8">
                  <p className="text-white/80 text-base">
                    Don't have an account?{" "}
                    <button
                      className="text-teal-400 font-semibold hover:text-teal-300 transition-colors duration-300 hover:underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Create Account
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="fade-in">
              <Card className="border-0 shadow-2xl rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <CardHeader className="pb-6 px-6 pt-8 lg:px-8">
                  <CardTitle className="text-white text-2xl lg:text-3xl font-bold text-center">
                    Join VX Academy
                  </CardTitle>
                  <CardDescription className="text-white/80 text-center text-base lg:text-lg">
                    Create your account to start your learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 lg:px-8">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-5"
                    >
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium text-base">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                                className="rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 py-3 lg:py-4 text-base"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium text-base">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                                className="rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 py-3 lg:py-4 text-base"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium text-base">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                {...field}
                                className="rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 py-3 lg:py-4 text-base"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium text-base">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                                className="rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 py-3 lg:py-4 text-base"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl py-4 lg:py-6 font-semibold text-base lg:text-lg shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center pb-8 px-6 lg:px-8">
                  <p className="text-white/80 text-base">
                    Already have an account?{" "}
                    <button
                      className="text-teal-400 font-semibold hover:text-teal-300 transition-colors duration-300 hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign In
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section with Enhanced Glassmorphism */}
      <div className="hidden lg:flex lg:w-1/2 text-white p-8 xl:p-12 flex-col justify-center relative z-10">
        <div className="max-w-xl relative">
          {/* Glassmorphism card for hero content */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 xl:p-10 shadow-2xl">
            <h1 className="text-3xl xl:text-5xl font-bold mb-6 xl:mb-8 tracking-wide leading-tight">
              Live the Vision.{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Shape the Future.
              </span>
            </h1>
            <p className="text-lg xl:text-xl opacity-90 mb-8 xl:mb-10 leading-relaxed">
              VX Academy equips learners with the skills, knowledge, and
              practical expertise needed to thrive in dynamic industries and
              drive meaningful impact across their communities.
            </p>
            <div className="space-y-6">
              <div className="flex items-start group">
                <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full p-2 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-lg">
                    check_circle
                  </span>
                </div>
                <p className="text-base xl:text-lg leading-relaxed">
                  Master clinical excellence and patient-centered care
                </p>
              </div>
              <div className="flex items-start group">
                <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full p-2 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-lg">
                    check_circle
                  </span>
                </div>
                <p className="text-base xl:text-lg leading-relaxed">
                  Develop essential healthcare skills for exceptional patient
                  service
                </p>
              </div>
              <div className="flex items-start group">
                <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full p-2 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-lg">
                    check_circle
                  </span>
                </div>
                <p className="text-base xl:text-lg leading-relaxed">
                  Earn badges, track progress, and rise in the leaderboard
                  rankings
                </p>
              </div>
              <div className="flex items-start group">
                <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full p-2 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-lg">
                    check_circle
                  </span>
                </div>
                <p className="text-base xl:text-lg leading-relaxed">
                  Access AI-powered assistance to enhance your learning journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
