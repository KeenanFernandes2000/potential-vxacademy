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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Auth Form */}
      <div className="w-full md:w-1/2 p-4 flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <img
                src="/images/vx-academy-logo.svg"
                alt="experience abu dhabi logo"
                className="h-12 mr-3 filter brightness-125"
              />
            </div>
          </div>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl bg-abu-sand">
              <TabsTrigger value="login" className="rounded-xl">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="fade-in">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-abu-charcoal text-xl">
                    Login to your account
                  </CardTitle>
                  <CardDescription className="text-neutral-600">
                    Enter your credentials to access your VX Academy dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-5"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-abu-charcoal">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your email"
                                {...field}
                                className="rounded-xl"
                                type="email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-abu-charcoal">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-[#007BC3] hover:bg-[#007BC3]/90 text-white rounded-xl py-6"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center pb-6">
                  <p className="text-sm text-neutral-600">
                    Don't have an account?{" "}
                    <button
                      className="text-[#007BC3] font-medium hover:underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="fade-in">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-abu-charcoal text-xl">
                    Create an account
                  </CardTitle>
                  <CardDescription className="text-neutral-600">
                    Join VX Academy to start your journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-abu-charcoal">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-abu-charcoal">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-abu-charcoal">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                {...field}
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-abu-charcoal">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-[#007BC3] hover:bg-[#007BC3]/90 text-white rounded-xl py-6 mt-2"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center pb-6">
                  <p className="text-sm text-neutral-600">
                    Already have an account?{" "}
                    <button
                      className="text-[#007BC3] font-medium hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section with EHC branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#007BC3] to-[#003D5B] text-white p-12 flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="font-heading text-4xl font-bold mb-6 tracking-wide leading-tight">
            Live the Vision.{" "}
            <span className="text-[#1AAFB6]">Shape the Future.</span>
          </h1>
          <p className="text-lg opacity-90 mb-8">
            VX Academy equips learners with the skills, knowledge, and practical
            expertise needed to thrive in dynamic industries and drive
            meaningful impact across their communities.
          </p>
          <div className="space-y-5">
            <div className="flex items-start">
              <span className="material-icons text-[#1AAFB6] mr-3">
                check_circle
              </span>
              <p>Master clinical excellence and patient-centered care</p>
            </div>
            <div className="flex items-start">
              <span className="material-icons text-[#1AAFB6] mr-3">
                check_circle
              </span>
              <p>
                Develop essential healthcare skills for exceptional patient
                service
              </p>
            </div>
            <div className="flex items-start">
              <span className="material-icons text-[#1AAFB6] mr-3">
                check_circle
              </span>
              <p>
                Earn badges, track progress, and rise in the leaderboard
                rankings
              </p>
            </div>
            <div className="flex items-start">
              <span className="material-icons text-[#1AAFB6] mr-3">
                check_circle
              </span>
              <p>
                Access AI-powered assistance to enhance your learning journey
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
