import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function LeaderboardSection() {
  const { user: currentUser } = useAuth();

  const { data: leaderboard, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5 text-teal-400" />
          Leaderboard
        </CardTitle>
        <CardDescription className="text-white/70">See how you rank among your peers</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading skeletons
          Array(3)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg transition-colors bg-slate-50/5 first:bg-gradient-to-r first:from-yellow-50/50 first:to-orange-50/50 border border-yellow-200/20"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-[50px]" />
                  <Skeleton className="h-3 w-[40px]" />
                </div>
              </div>
            ))
        ) : leaderboard && leaderboard.length > 0 ? (
          // Leaderboard items
          leaderboard.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                index < 3
                  ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
                  : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user.avatar || `https://avatar.vercel.sh/${user.email}.png`}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      <span className="material-icons text-[10px]">emoji_events</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-white/70">@{user.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-teal-400">
                  {user.score || 0} pts
                </p>
                <p className="text-sm text-white/60">#{index + 1}</p>
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="p-4 text-center text-white/70">
            No data available
          </div>
        )}
      </CardContent>
      {/* <CardFooter>
        <Link href="/leaderboard">
          <Button variant="secondary" className="w-full">
            View full leaderboard
          </Button>
        </Link>
      </CardFooter> */}
    </Card>
  );
}