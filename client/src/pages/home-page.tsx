import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Autoplay from "embla-carousel-autoplay";

import { Button } from "../components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import Icon from "../components/ui/icon";

// MUI Icons
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SchoolIcon from "@mui/icons-material/School";
import MenuIcon from "@mui/icons-material/Menu";
import BuildIcon from "@mui/icons-material/Build";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import PinterestIcon from "@mui/icons-material/Pinterest";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InfoIcon from "@mui/icons-material/Info";
import GroupsIcon from "@mui/icons-material/Groups";

// Layout Primitives
interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

const Section = ({
  id,
  className = "",
  children,
  "aria-label": ariaLabel,
}: SectionProps) => (
  <section id={id} className={className} aria-label={ariaLabel}>
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

const TwoCol = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 ${className}`}
  >
    {children}
  </div>
);

const ThreeCol = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 ${className}`}
  >
    {children}
  </div>
);

const FourCol = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 ${className}`}
  >
    {children}
  </div>
);

const MediaBox = ({
  className = "",
  imageSrc = "",
  alt = "Media placeholder",
}: {
  className?: string;
  imageSrc?: string;
  alt?: string;
}) => (
  <div
    className={`aspect-[16/10] rounded-xl bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 overflow-hidden ${className}`}
  >
    {imageSrc ? (
      <img src={imageSrc} alt={alt} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/30 text-sm">Image Placeholder</div>
      </div>
    )}
  </div>
);

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // Add user state

  // Smooth scrolling function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: false,
      mirror: true,
    });

    const potChatHost = (globalThis as any).document?.getElementById(
      "potChatHost"
    );
    if (potChatHost) {
      potChatHost.remove();
    }
    // // @ts-ignore
    // chatbotembed({
    //   botId: "687d2feed500b7283933ad2c",
    //   botIcon:
    //     "https://ai.potential.com/static/mentors/AbuDhabiExperience-1753076809518-abudhabi.png",
    //   botColor: "#d64444",
    // });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#003451] relative overflow-hidden">
      {/* Supergraphic SVG Background in Experience Abu Dhabi Style */}

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

          {/* Desktop Navigation */}
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
                  <Button className="w-full bg-[#00d8cc] hover:bg-[#00b8cc] text-black rounded-xl py-3 font-semibold shadow-lg backdrop-blur-sm border border-[#00d8cc]/20 mt-4 rounded-full">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Full Background Image */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden -mt-20 pt-20"
        // data-aos="fade-up"
      >
        {/* Full Background Image */}
        <div className="absolute inset-0 -top-20">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
            alt="VX Academy Hero Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40"></div>
          {/* Subtle animated background elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00d8cc]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00d8cc]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#00d8cc]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-white space-y-8">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-abu-bold leading-tight text-white"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                Elevate Abu Dhabi's Visitor Experience
              </h1>
              <p
                className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed max-w-3xl mx-auto"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                Welcome to VX Academy — your gateway to becoming part of Abu
                Dhabi’s story.
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                data-aos="fade-up"
                data-aos-delay="600"
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-16 md:py-24 relative overflow-hidden bg-[#003451] border-b border-white/10 mb-8"
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Column */}
            <div className="text-white">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                data-aos="fade-up"
              >
                About VX Academy
              </h2>
              <div className="w-24 h-1 bg-[#00d8cc] rounded-full mb-8"></div>
              <div
                className="space-y-4 text-lg leading-relaxed mb-8"
                data-aos="fade-up"
              >
                <p>
                  At VX Academy, we believe every frontliner is more than just a
                  service provider. You are the warm welcome that sets the tone,
                  the trusted guide who shares our culture, and the lasting
                  memory every visitor takes home.
                </p>
                <p>
                  Abu Dhabi is a place of discovery, tradition, and world-class
                  hospitality. To every visitor, it should feel consistent,
                  seamless, and extraordinary — and VX Academy was created to
                  ensure that, by equipping you with the knowledge, skills, and
                  confidence to deliver exceptional service across every
                  touchpoint.
                </p>
                <p>
                  This is more than training. It's an invitation to become an
                  ambassador of Abu Dhabi, to share the spirit of our home with
                  the world, and to make every interaction truly unforgettable.
                </p>
              </div>
              <Link href="/auth">
                <Button
                  className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black px-8 py-3 font-semibold transition-colors rounded-full shadow-lg backdrop-blur-sm border border-[#00d8cc]/20 hover:scale-105"
                  data-aos="fade-up"
                >
                  Login
                </Button>
              </Link>
            </div>

            {/* Image Column */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full h-full overflow-hidden" data-aos="fade-up">
                <img
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                  alt="Woman working on laptop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-16 md:py-24 relative overflow-hidden bg-[#003451] border-b border-white/10 mb-8 shadow-lg"
        // data-aos="fade-up"
      >
        {/* Removed old blurred and previous SVG backgrounds */}

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20" data-aos="fade-up">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                Why Join VX Academy?
              </h2>
              <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-white leading-relaxed">
                Joining the VX Academy provides frontliners with numerous
                benefits that enhance both professional development and personal
                growth.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {[
              {
                title: "Recognized Certification",
                description:
                  "Earn official certifications and digital badges that highlight your expertise and commitment to excellence. Showcase your achievements with credentials recognized across Abu Dhabi's tourism and hospitality ecosystem.",
                icon: WorkspacePremiumIcon,
              },
              {
                title: "Career Advancement",
                description:
                  "Stand out in your field and open doors to new opportunities. With enhanced skills and proven knowledge, you'll be better equipped for promotions, leadership roles, and long-term career growth.",
                icon: TrendingUpIcon,
              },
              {
                title: "AI-Powered Assistance",
                description:
                  "Get access to smart, AI-driven tools that guide you through training and provide instant support when you need it most — helping you learn faster and apply knowledge on the job.",
                icon: SmartToyIcon,
              },
              {
                title: "Self-Paced Training",
                description:
                  "Learn anytime, anywhere, at your own pace. Whether you're at work, home, or on the go, VX Academy adapts to your schedule so you can grow without limits.",
                icon: SchoolIcon,
              },
            ].map((benefit, index) => (
              <div key={index} className="group">
                <div
                  className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 p-6 lg:p-8 hover:bg-[#00d8cc]/20 transition-all duration-500 hover:scale-105 h-full relative overflow-hidden"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <div className="relative z-10">
                    <div className="w-20 h-20 flex items-center justify-center mb-6 transition-transform duration-300">
                      <Icon
                        Component={benefit.icon}
                        color="#00d8cc"
                        size={58}
                      />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold mb-4 text-white group-hover:text-[#00d8cc] transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-white/90 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Areas Section */}
      <section
        id="training-areas"
        className="py-16 md:py-24 relative overflow-hidden bg-[#003451] border-b border-white/10 mb-8"
        // data-aos="fade-up"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(45deg, white 1px, transparent 1px), linear-gradient(-45deg, white 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20" data-aos="fade-up">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                Training Areas
              </h2>
              <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-white leading-relaxed">
                Our comprehensive training system follows a structured approach
                through five interconnected areas, building from foundational
                knowledge to advanced competencies for exceptional visitor
                experiences in Abu Dhabi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "ABU DHABI INFORMATION",
                description:
                  "Immerse yourself in Abu Dhabi's rich cultural heritage, tourism strategy, and infrastructure knowledge essential for frontline professionals.",
                icon: InfoIcon,
                imageSrc:
                  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                imageAlt: "Abu Dhabi skyline and cultural landmarks",
              },
              {
                title: "VX SOFT SKILLS",
                description:
                  "Master communication, empathy, and service delivery skills that ensure every guest feels welcomed and valued.",
                icon: GroupsIcon,
                imageSrc:
                  "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                imageAlt: "Professional hospitality training session",
              },
              {
                title: "VX HARD SKILLS",
                description:
                  "Develop technical expertise and operational knowledge for specialized frontline positions across Abu Dhabi's visitor landscape.",
                icon: BuildIcon,
                imageSrc:
                  "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
                imageAlt: "Specialized training and skill development",
              },
              {
                title: "MANAGERIAL COMPETENCIES",
                description:
                  "Build leadership skills, team management, and strategic thinking capabilities for supervisory and management roles.",
                icon: TrendingUpIcon,
                imageSrc:
                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
                imageAlt: "Leadership and management training",
              },
              {
                title: "AL MIDHYAF CODE OF CONDUCT",
                description:
                  "Learn the essential standards, regulations, and ethical guidelines that define excellence in Abu Dhabi's hospitality sector.",
                icon: VerifiedIcon,
                imageSrc:
                  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                imageAlt: "Code of conduct and regulations",
              },
            ].map((area, index) => (
              <div
                key={index}
                className="group"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="bg-[#00d8cc]/10 backdrop-blur-sm   hover:bg-[#00d8cc]/20 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                  {/* Image Placeholder */}
                  <div className="aspect-[4/3] bg-[#00d8cc]/5 mb-6  overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={area.imageSrc}
                      alt={area.imageAlt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>

                  {/* Body - flex-1 for consistent height */}
                  <div className="text-center space-y-4 flex-1 flex flex-col border-l-2 border-[#00d8cc] p-8">
                    <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-[#00d8cc] transition-colors duration-300">
                      {area.title}
                    </h3>
                    <p className="text-white text-sm leading-relaxed flex-1">
                      {area.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for Section */}
      <section
        id="for"
        className="py-16 md:py-24 relative overflow-hidden bg-[#003451] border-b border-white/10 mb-8 shadow-lg"
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Who Is VX Academy For?
            </h2>
            <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto mb-8"></div>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              If you play a role in shaping Abu Dhabi's visitor journey, VX
              Academy is for you.
            </p>
          </div>

          <div className="w-full max-w-none">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 2000,
                }),
              ]}
              className="w-full"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {[
                  {
                    title: "Museums & Cultural Sites",
                    image:
                      "https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  },
                  {
                    title: "Events & Entertainment Venues",
                    image:
                      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  },
                  {
                    title: "Mobility Operators & Airports",
                    image:
                      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  },
                  {
                    title: "Cruise Terminals",
                    image:
                      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  },
                  {
                    title: "Hotels & Hospitality",
                    image:
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  },
                  {
                    title: "Malls & Retail",
                    image:
                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  },
                  {
                    title: "Tour Guides & Operators",
                    image:
                      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  },
                  {
                    title: "Visitor Information Centers",
                    image:
                      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  },
                  {
                    title: "Attractions & Theme Parks",
                    image:
                      "https://images.unsplash.com/photo-1613058502382-f2c4656638ff?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  },
                ].map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
                      <div className="relative aspect-[4/3] overflow-hidden shadow-2xl">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                        />
                        {/* Gradient overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        {/* Text overlay positioned at bottom left */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl lg:text-3xl font-bold text-white group-hover:text-[#00d8cc] transition-colors duration-300">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-[#00d8cc]" />
              <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-[#00d8cc]" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Your Impact Section */}
      <section
        id="impact"
        className="py-16 md:py-24 relative overflow-hidden bg-[#003451] mb-8"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="w-full h-full overflow-hidden" data-aos="fade-up">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Team collaboration and impact"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content Column */}
            <div className="text-white order-1 lg:order-2">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                data-aos="fade-up"
              >
                Your Impact
              </h2>
              <div className="w-24 h-1 bg-[#00d8cc] rounded-full mb-8"></div>
              <div
                className="space-y-4 text-lg leading-relaxed mb-8"
                data-aos="fade-up"
              >
                <p>
                  Every smile, every story, every act of service becomes part of
                  the memory a visitor carries home. By joining VX Academy,
                  you're not just learning — you're shaping the way the world
                  experiences Abu Dhabi. Together, we'll make every visit
                  unforgettable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="join"
        className="py-24 md:py-32 lg:py-40 relative overflow-hidden bg-[#003451] min-h-[80vh] shadow-lg"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="VX Academy Join Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/90"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-5xl mx-auto" data-aos="fade-up">
            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-12 leading-tight"
              data-aos="fade-up"
            >
              VX Academy - Excellence in Visitor Experiences
            </h2>
            <div className="pt-8">
              <Link href="/auth">
                <Button
                  className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-xl py-6 px-16 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold rounded-full backdrop-blur-sm border border-[#00d8cc]/20"
                  data-aos="fade-up"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Horizontal Layout on Mobile */}
      <footer className="bg-[#003451]/90 backdrop-blur-xl border-t border-[#00d8cc]/20 text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d8cc]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00d8cc]/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          {/* Mobile: Single row layout, Desktop: Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-8 lg:mb-12">
            {/* VX Academy Section */}
            <div className="space-y-6">
              <h3 className="text-xl lg:text-2xl font-bold">VX Academy</h3>
              <p className="text-white leading-relaxed text-sm lg:text-base">
                The premier training platform for Abu Dhabi's frontline
                hospitality and tourism professionals.
              </p>
            </div>

            {/* Mobile: Compact layout for Links and Contact */}
            <div className="lg:hidden">
              <div className="grid grid-cols-2 gap-6 text-center">
                {/* Quick Links */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <button
                        onClick={() => scrollToSection("about")}
                        className="text-white/70 hover:text-[#00d8cc] transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                      >
                        About Us
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("training-areas")}
                        className="text-white/70 hover:text-[#00d8cc] transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                      >
                        Training Areas
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("benefits")}
                        className="text-white/70 hover:text-[#00d8cc] transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                      >
                        Benefits
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("for")}
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                      >
                        Who is it for
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("about")}
                        className="text-white/70 hover:text-[#00d8cc] transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                      >
                        FAQ
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Contact Us */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold">Contact Us</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                        <Icon
                          Component={LocationOnIcon}
                          size={12}
                          color="#00d8cc"
                        />
                      </div>
                      <span className="text-white text-xs leading-relaxed text-center">
                        Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi,
                        UAE
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                        <Icon Component={EmailIcon} size={12} color="#00d8cc" />
                      </div>
                      <span className="text-white text-xs">
                        info@vxacademy.ae
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                        <Icon Component={PhoneIcon} size={12} color="#00d8cc" />
                      </div>
                      <span className="text-white text-xs">
                        +971 2 123 4567
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: 3-column layout (About / Links / Contact) */}
            <div className="hidden lg:block space-y-6">
              <h3 className="text-lg font-bold">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="text-white/70 hover:text-[#00d8cc] transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("training-areas")}
                    className="text-white/70 hover:text-[#00d8cc] transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                  >
                    Training Areas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("benefits")}
                    className="text-white/70 hover:text-[#00d8cc] transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                  >
                    Benefits
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("for")}
                    className="text-white/70 hover:text-[#00d8cc] transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full"
                  >
                    Who is it for
                  </button>
                </li>
              </ul>
            </div>

            <div className="hidden lg:block space-y-6">
              <h3 className="text-lg font-bold">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                    <Icon
                      Component={LocationOnIcon}
                      size={16}
                      color="#00d8cc"
                    />
                  </div>
                  <span className="text-white text-sm leading-relaxed">
                    Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi, UAE
                  </span>
                </div>
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                    <Icon Component={EmailIcon} size={16} color="#00d8cc" />
                  </div>
                  <span className="text-white text-sm">info@vxacademy.ae</span>
                </div>
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                    <Icon Component={PhoneIcon} size={16} color="#00d8cc" />
                  </div>
                  <span className="text-white text-sm">+971 2 123 4567</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white text-sm">
              © {new Date().getFullYear()} VX Academy. All rights reserved.
            </p>
            <p className="text-white/60 text-xs mt-2">
              Powered by{" "}
              <a
                href="https://potential.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00d8cc] transition-colors"
              >
                Potential.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
