
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import MediaManagement from "@/components/MediaManagement";
import AdminLayout from "@/components/layout/admin-layout";

export default function MediaManagementPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Redirect if not logged in or not an admin
  if (!user) {
    return <Redirect to="/auth" />;
  } else if (user.role !== "admin" && user.role !== "content_creator") {
    return <Redirect to="/" />;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 px-6">
        <MediaManagement />
      </div>
    </AdminLayout>
  );
}
