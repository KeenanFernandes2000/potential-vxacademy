import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../ui/button";

// Icon components (you can replace these with your actual icon imports)
const MenuIcon = ({ size, color }: { size: number; color: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12H21M3 6H21M3 18H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface DashboardNavProps {
  user?: any; // Replace 'any' with your actual user type
  showItems?: boolean; // Controls visibility of navigation items
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
  user,
  showItems = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Navigation Bar with Glassmorphism */}
      <nav className="backdrop-blur-xl border-b border-white/10 z-50 sticky top-0 shadow-2xl">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-12 w-auto">
              <Link href={showItems ? "" : "/"}>
                <img
                  src="/images/vx-academy-logo.svg"
                  alt="VX Academy Logo"
                  className="h-full"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          {showItems && (
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("about")}
                className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105 font-medium cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105 font-medium cursor-pointer"
              >
                Why Join
              </button>
              <button
                onClick={() => scrollToSection("training-areas")}
                className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105 font-medium cursor-pointer"
              >
                Training Areas
              </button>

              <button
                onClick={() => scrollToSection("for")}
                className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105 font-medium cursor-pointer"
              >
                Who is it for
              </button>
              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black rounded-xl px-6 py-2 font-semibold shadow-lg backdrop-blur-sm border border-[#00d8cc]/20 transition-all duration-300 hover:scale-105">
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black rounded-xl px-6 py-2 font-semibold shadow-lg backdrop-blur-sm border border-[#00d8cc]/20 transition-all duration-300 hover:scale-105 rounded-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {showItems && (
            <div className="lg:hidden">
              <button
                className="text-white/90 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <MenuIcon size={24} color="currentColor" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu with Glassmorphism */}
        {showItems && (
          <div
            className={`lg:hidden backdrop-blur-xl border-[#00d8cc]/20 overflow-hidden transition-all duration-500 ease-in-out ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  scrollToSection("about");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-white/90 hover:text-white transition-colors font-medium cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => {
                  scrollToSection("benefits");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-white/90 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Why Join
              </button>
              <button
                onClick={() => {
                  scrollToSection("training-areas");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-white/90 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Training Areas
              </button>
              <button
                onClick={() => {
                  scrollToSection("for");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-white/90 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Who is it for
              </button>
              {user ? (
                <Link href="/dashboard">
                  <Button className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black rounded-xl py-3 font-semibold shadow-lg backdrop-blur-sm border border-[#00d8cc]/20 mt-4 rounded-full">
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="w-full bg-[#00d8cc] hover:bg-[#00b8cc] text-black rounded-xl py-3 font-semibold border border-[#00d8cc]/20 mt-4 rounded-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
