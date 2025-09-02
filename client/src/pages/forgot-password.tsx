import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle } from "lucide-react";
import Icon from "@/components/ui/icon";
import MenuIcon from "@mui/icons-material/Menu";
import { Input } from "@/components/ui/input";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function ForgotPasswordPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [, setLocation] = useLocation();

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEmail(data.email);
    setCurrentStep("password");
    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    setLocation("/auth");
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
              <a
                href="/"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src="/images/vx-academy-logo.svg"
                  alt="VX Academy Logo"
                  className="h-full"
                />
              </a>
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

      {/* Forgot Password Form */}
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 flex-1">
        <div className="w-full max-w-md lg:max-w-lg">
          <Card className="shadow-2xl bg-[#00d8cc]/10 backdrop-blur-sm  border-[#00d8cc]/20 overflow-hidden rounded-none">
            <CardHeader className="pb-8 px-8 pt-10 lg:px-10">
              <CardTitle className="text-white text-3xl lg:text-4xl font-bold text-center mb-3">
                {currentStep === "email" ? "Forgot Password" : "Reset Password"}
              </CardTitle>
              <CardDescription className="text-white/80 text-center text-lg leading-relaxed">
                {currentStep === "email"
                  ? "Enter your email address to receive a password reset link"
                  : `Enter your new password for ${email}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 lg:px-10 pb-10">
              {currentStep === "email" ? (
                <Form {...emailForm}>
                  <form
                    onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={emailForm.control}
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

                    <div className="pt-4 space-y-4">
                      <Button
                        type="submit"
                        className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black py-5 lg:py-6 font-bold text-lg lg:text-xl shadow-xl backdrop-blur-sm border-2 border-[#00d8cc]/20 transition-all duration-300 hover:scale-105 hover:shadow-[#00d8cc]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl rounded-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleBackToLogin}
                        className="w-full text-[#00d8cc] hover:text-[#00b8b0] hover:bg-[#00d8cc]/10 py-4 font-medium transition-all duration-300 rounded-full"
                      >
                        Back to Login
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-white font-semibold text-base tracking-wide pl-2">
                      New Password
                    </label>
                    <input
                      placeholder="Enter your new password"
                      className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full w-full px-4 outline-none"
                      type="password"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-white font-semibold text-base tracking-wide pl-2">
                      Confirm New Password
                    </label>
                    <input
                      placeholder="Confirm your new password"
                      className="bg-[#00d8cc]/20 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full w-full px-4 outline-none"
                      type="password"
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <Button
                      type="button"
                      onClick={() => setShowSuccessDialog(true)}
                      className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black py-5 lg:py-6 font-bold text-lg lg:text-xl shadow-xl backdrop-blur-sm border-2 border-[#00d8cc]/20 transition-all duration-300 hover:scale-105 hover:shadow-[#00d8cc]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl rounded-full"
                    >
                      Update Password
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrentStep("email")}
                      className="w-full text-[#00d8cc] hover:text-[#00b8b0] hover:bg-[#00d8cc]/10 py-4 font-medium transition-all duration-300 rounded-full"
                    >
                      Back to Email
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-[#003451] border-[#00d8cc]/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#00d8cc]">
              Password Updated Successfully!
            </DialogTitle>
            <DialogDescription className="text-white/80 text-center text-lg mt-4">
              Your password has been reset. You can now log in with your new
              password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <CheckCircle className="h-16 w-16 text-[#00d8cc]" />
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                setLocation("/auth");
              }}
              className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black px-8 py-3 font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 rounded-full"
            >
              Continue to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
