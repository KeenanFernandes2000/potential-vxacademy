import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function WelcomeCard() {
  const { user } = useAuth();

  const firstName = user?.firstName || 'User';

  // Determine if user is new (has no XP points)
  const isNewUser = !user?.xpPoints || user.xpPoints === 0;

  return (
    <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-xl p-6 mb-8 shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            {isNewUser ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}!`}
          </h1>
          <p className="opacity-90 mb-4">
            {isNewUser 
              ? "Start your journey in becoming an exceptional healthcare professional." 
              : "Continue your journey in becoming an exceptional healthcare professional."}
          </p>
          <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-3 py-2 w-fit">
            <span className="material-icons text-secondary mr-2">stars</span>
            <span><span className="font-bold">{user?.xpPoints?.toLocaleString() || 0}</span> XP Points</span>
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <Link href="/courses">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 px-6 py-2 rounded-lg font-medium transition-colors">
              <span className="material-icons mr-2">play_circle</span>
              <span>{isNewUser ? "Start Learning" : "Resume Learning"}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}