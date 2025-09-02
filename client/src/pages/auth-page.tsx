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
import { Loader2 } from "lucide-react";
import Icon from "@/components/ui/icon";
import MenuIcon from "@mui/icons-material/Menu";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
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

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#003451] relative overflow-hidden"
      style={{ backgroundColor: "#003451" }}
    >
      {/* Navigation Bar with Glassmorphism */}
      <nav className="backdrop-blur-xl border-b border-white/10 z-50 sticky top-0 shadow-2xl">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-12 w-auto">
              <img
                src="/images/vx-academy-logo.svg"
                alt="VX Academy Logo"
                className="h-full"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              className="text-white/90 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icon Component={MenuIcon} size={24} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Mobile Menu with Glassmorphism */}
        {isMobileMenuOpen && (
          <div className="lg:hidden backdrop-blur-xl border-[#00d8cc]/20">
            <div className="px-4 py-4 space-y-3">
              {/* Mobile menu is empty as requested */}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Form */}
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 flex-1">
        <div className="w-full max-w-md lg:max-w-lg">
          {/* Logo Section */}

          <Card className="shadow-2xl bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 overflow-hidden">
            <CardHeader className="pb-8 px-8 pt-10 lg:px-10">
              <CardTitle className="text-white text-3xl lg:text-4xl font-bold text-center mb-3">
                Login
              </CardTitle>
              <CardDescription className="text-white/80 text-center text-lg leading-relaxed">
                Enter your credentials to access your VX Academy dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 lg:px-10 pb-10">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-white font-semibold text-base tracking-wide pl-2">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email address"
                            {...field}
                            className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                            type="email"
                          />
                        </FormControl>
                        <FormMessage className="text-red-300 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-white font-semibold text-base tracking-wide pl-2">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                            className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                          />
                        </FormControl>
                        <FormMessage className="text-red-300 text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black py-5 lg:py-6 font-bold text-lg lg:text-xl shadow-xl backdrop-blur-sm border-2 border-[#00d8cc]/20 transition-all duration-300 hover:scale-105 hover:shadow-[#00d8cc]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl rounded-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
