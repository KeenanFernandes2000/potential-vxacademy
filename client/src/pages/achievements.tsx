import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserBadge, Badge } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CertificateSection } from "@/components/certificates/certificate-section";

type UserBadgeWithDetails = UserBadge & { badge?: Badge };

export default function Achievements() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const { data: userBadges, isLoading } = useQuery<UserBadgeWithDetails[]>({
    queryKey: ["/api/user/badges"],
  });

  const { data: allBadges, isLoading: isLoadingAllBadges } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  // Group badges by category for better organization
  const groupedBadges = {
    earned: [] as UserBadgeWithDetails[],
    locked: [] as Badge[],
  };

  if (userBadges && allBadges) {
    // Map badge IDs that the user has earned
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);

    // For earned badges, ensure badge data is properly nested
    groupedBadges.earned = userBadges.map(userBadge => {
      // Find the full badge details based on the badgeId
      const fullBadge = allBadges.find(b => b.id === userBadge.badgeId);

      // Combine user badge with the full badge details
      return {
        ...userBadge,
        badge: fullBadge || undefined
      };
    });

    // Filter out badges that haven't been earned yet
    groupedBadges.locked = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));
  }

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
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h1 className="font-heading text-2xl font-semibold text-neutrals-800 mb-6">My Achievements</h1>

            {/* Achievements Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Badges</CardTitle>
                  <CardDescription>Your collection progress</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading || isLoadingAllBadges ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-primary">{groupedBadges.earned.length}</span>
                      <span className="text-neutrals-500 ml-2">/ {(allBadges?.length || 0)} total</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Achievement Level</CardTitle>
                  <CardDescription>Based on your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-10 w-32" />
                  ) : (
                    <div className="flex items-center">
                      {userBadges && userBadges.length >= 10 ? (
                        <>
                          <span className="material-icons text-teal-600 mr-2">workspace_premium</span>
                          <span className="text-xl font-bold">Expert</span>
                        </>
                      ) : userBadges && userBadges.length >= 5 ? (
                        <>
                          <span className="material-icons text-secondary mr-2">emoji_events</span>
                          <span className="text-xl font-bold">Advanced</span>
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-secondary mr-2">military_tech</span>
                          <span className="text-xl font-bold">Beginner</span>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total XP from Badges</CardTitle>
                  <CardDescription>Experience points earned</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <div className="flex items-center">
                      <span className="material-icons text-accent mr-2">stars</span>
                      <span className="text-3xl font-bold text-primary">
                        {userBadges?.reduce((total, ub) => total + (ub.badge?.xpPoints || 0), 0)}
                      </span>
                      <span className="text-neutrals-500 ml-2">XP</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Certificates Section */}
            <CertificateSection />

            {/* Earned Badges */}
            <div className="mb-10">
              <div className="flex items-center mb-4">
                <h2 className="font-heading text-xl font-semibold text-neutrals-800">Earned Badges</h2>
                <div className="ml-3 px-2 py-1 bg-success bg-opacity-10 text-success text-xs font-medium rounded-md">
                  {isLoading ? (
                    <Skeleton className="h-4 w-8 inline-block" />
                  ) : (
                    <>{groupedBadges.earned.length} badges</>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Skeleton className="h-24 w-24 rounded-full mb-3" />
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : groupedBadges.earned.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {groupedBadges.earned.map((userBadge) => (
                    <div key={userBadge.id} className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-secondary-light bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                        {userBadge.badge?.imageUrl && userBadge.badge.imageUrl.includes('http') ? (
                          <img 
                            src={userBadge.badge.imageUrl} 
                            alt={userBadge.badge?.name || "Badge"} 
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <span className="material-icons text-4xl text-secondary">
                            emoji_events
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-center mb-1">{userBadge.badge?.name || "Achievement"}</h3>
                      <p className="text-xs text-neutrals-600 text-center mb-2 px-2">{userBadge.badge?.description || "You earned this achievement"}</p>
                      <div className="flex items-center text-accent text-sm">
                        <span className="material-icons text-xs mr-1">stars</span>
                        <span>{userBadge.badge?.xpPoints || 0} XP</span>
                      </div>
                      <div className="text-xs text-neutrals-500 mt-1">
                        Earned {userBadge.earnedAt ? new Date(userBadge.earnedAt).toLocaleDateString() : 'recently'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-neutrals-50 p-6 rounded-lg text-center">
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-4xl text-neutrals-400 mb-2">emoji_events</span>
                    <h3 className="text-lg font-semibold mb-2">No badges earned yet</h3>
                    <p className="text-neutrals-600 max-w-md mx-auto">Complete courses and assessments to earn badges and showcase your achievements.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Available Badges */}
            <div>
              <div className="flex items-center mb-4">
                <h2 className="font-heading text-xl font-semibold text-neutrals-800">Available Badges</h2>
                <div className="ml-3 px-2 py-1 bg-neutrals-200 text-neutrals-700 text-xs font-medium rounded-md">
                  {isLoadingAllBadges ? (
                    <Skeleton className="h-4 w-8 inline-block" />
                  ) : (
                    <>{groupedBadges.locked.length} badges</>
                  )}
                </div>
              </div>

              {isLoadingAllBadges ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Skeleton className="h-24 w-24 rounded-full mb-3" />
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : groupedBadges.locked.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {groupedBadges.locked.map((badge) => (
                    <TooltipProvider key={badge.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center cursor-help">
                            <div className="w-24 h-24 bg-neutrals-200 rounded-full flex items-center justify-center mb-3 opacity-60">
                              {badge.imageUrl && badge.imageUrl.includes('http') ? (
                                <img 
                                  src={badge.imageUrl} 
                                  alt={badge.name} 
                                  className="w-12 h-12 object-contain opacity-60" 
                                />
                              ) : (
                                <span className="material-icons text-4xl text-neutrals-500">
                                  {badge.imageUrl || "lock"}
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-center mb-1 text-neutrals-500">{badge.name}</h3>
                            <p className="text-xs text-neutrals-500 text-center mb-2 px-2">Locked</p>
                            <div className="flex items-center text-neutrals-500 text-sm">
                              <span className="material-icons text-xs mr-1">stars</span>
                              <span>{badge.xpPoints} XP</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-xs">{badge.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ) : (
                <div className="bg-neutrals-50 p-6 rounded-lg text-center">
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-4xl text-neutrals-400 mb-2">check_circle</span>
                    <h3 className="text-lg font-semibold mb-2">All badges earned!</h3>
                    <p className="text-neutrals-600">Congratulations! You've earned all available badges.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}