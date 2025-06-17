import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardSection() {
  const { user: currentUser } = useAuth();

  const { data: leaderboard, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-lg font-semibold text-neutrals-800">Leaderboard</h2>
        <div className="flex items-center">
          <span className="text-sm text-neutrals-600 mr-2">This week</span>
          <span className="material-icons text-teal-600 text-sm">arrow_drop_down</span>
        </div>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="flex items-center py-2 border-b border-neutrals-200">
              <div className="w-6 text-center">
                <Skeleton className="h-5 w-5 mx-auto" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full mx-3" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))
        ) : leaderboard && leaderboard.length > 0 ? (
          // Leaderboard items
          leaderboard.slice(0, 4).map((user, index) => {
            const isCurrentUser = user.id === currentUser?.id;
            return (
              <div 
                key={user.id} 
                className={`flex items-center py-2 border-b border-neutrals-200 ${isCurrentUser ? "bg-primary-light bg-opacity-10" : ""}`}
              >
                <div className="w-6 font-medium text-center">{index + 1}</div>
                <div className="relative w-8 h-8 mx-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white flex items-center justify-center text-sm font-semibold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-neutrals-800">
                    {user.name}
                    {isCurrentUser && <span className="text-xs text-teal-600 ml-2">(You)</span>}
                  </span>
                </div>
                <div className="text-teal-600 font-semibold">{user.xpPoints?.toLocaleString() || 0} XP</div>
              </div>
            );
          })
        ) : (
          // Empty state
          <div className="p-4 text-center">
            <p className="text-neutrals-600">No data available</p>
          </div>
        )}

        <div className="pt-2">
          <Link href="/leaderboard">
            <a className="block text-center text-teal-600 font-medium hover:underline">
              View full leaderboard
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}