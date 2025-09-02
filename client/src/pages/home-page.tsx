import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Button } from "../components/ui/button";
import { TestimonialCard } from "../components/ui/testimonialCard";
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
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SchoolIcon from "@mui/icons-material/School";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
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
import BoltIcon from "@mui/icons-material/Bolt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";

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
    className={`aspect-[16/10] rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden ${className}`}
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

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
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
    <div className="min-h-screen flex flex-col bg-[#0a2540] relative overflow-hidden">
      {/* Supergraphic SVG Background in Experience Abu Dhabi Style */}

      {/* Navigation Bar with Glassmorphism */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 z-50 sticky top-0">
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
            <a
              href="#about"
              className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
            >
              About
            </a>
            <a
              href="#training-areas"
              className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
            >
              Training Areas
            </a>
            <a
              href="#benefits"
              className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
            >
              Benefits
            </a>
            <a
              href="#testimonials"
              className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
            >
              Testimonials
            </a>
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-6 py-2 font-semibold shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105">
                  My Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-6 py-2 font-semibold shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105">
                  Get Started
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
          <div className="lg:hidden bg-white/10 backdrop-blur-xl border-t border-white/20">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#about"
                className="block py-3 text-white/90 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#training-areas"
                className="block py-3 text-white/90 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Training Areas
              </a>
              <a
                href="#benefits"
                className="block py-3 text-white/90 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <a
                href="#testimonials"
                className="block py-3 text-white/90 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              {user ? (
                <Link href="/dashboard">
                  <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3 font-semibold shadow-lg backdrop-blur-sm border border-white/20 mt-4">
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3 font-semibold shadow-lg backdrop-blur-sm border border-white/20 mt-4">
                    Sign In / Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Full Background Image */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        // data-aos="fade-up"
      >
        {/* Full Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
            alt="VX Academy Hero Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40"></div>
          {/* Subtle animated background elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-white space-y-8">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white"
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
                Empowering frontliners with exceptional skills to create
                memorable experiences for every visitor to Abu Dhabi.
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <Link href="/auth">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white text-lg py-4 px-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 font-semibold">
                    Get Started
                  </Button>
                </Link>
                <a href="#about">
                  <Button
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 text-lg py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-16 md:py-24 relative overflow-hidden bg-[#003451]"
        // data-aos="fade-up"
      >
        {/* Removed old blurred and previous SVG backgrounds */}

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20" data-aos="fade-up">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Why Join VX Academy?
              </h2>
              <div className="w-24 h-1 bg-white rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-white leading-relaxed">
                Joining the VX Academy provides frontliners with numerous
                benefits that enhance both professional development and personal
                growth.
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {[
              {
                title: "Recognized Certification",
                description:
                  "Earn a prestigious certification recognized by VX Academy and Abu Dhabi's frontline hospitality and tourism sector.",
                icon: WorkspacePremiumIcon,
                bgImage:
                  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              },
              {
                title: "Career Advancement",
                description:
                  "Enhance your resume and open doors to new career opportunities in the growing hospitality sector.",
                icon: TrendingUpIcon,
                bgImage:
                  "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              },
              {
                title: "Achievement Badges",
                description:
                  "Earn digital badges to recognize your skills and showcase your hospitality expertise to employers and colleagues.",
                icon: EmojiEventsIcon,
                bgImage:
                  "https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              },
              {
                title: "Networking Opportunities",
                description:
                  "Connect with fellow professionals across Abu Dhabi's hospitality and tourism Cluster's network of facilities.",
                icon: PeopleIcon,
                bgImage:
                  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              },
              {
                title: "Mobile Learning",
                description:
                  "Access courses anytime, anywhere through our mobile-friendly platform with online and offline capabilities.",
                icon: PhoneAndroidIcon,
                bgImage:
                  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              },
              {
                title: "AI-Powered Assistance",
                description:
                  "Get personalized help from our AI tutor to enhance your learning experience and address questions.",
                icon: SmartToyIcon,
                bgImage:
                  "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              },
              {
                title: "Progress Tracking",
                description:
                  "Monitor your learning journey with detailed analytics and personalized progress reports.",
                icon: AnalyticsIcon,
                bgImage:
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              },
              {
                title: "Interactive Learning",
                description:
                  "Engage with immersive content, simulations, and real-world scenarios for a dynamic learning experience.",
                icon: SchoolIcon,
                bgImage:
                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              },
            ].map((benefit, index) => (
              <div key={index} className="group">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 lg:p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 h-full relative overflow-hidden">
                  {/* Background image with overlay */}
                  <div className="absolute inset-0">
                    <img
                      src={benefit.bgImage}
                      alt={benefit.title}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#003451]/80 to-[#003451]/60"></div>
                  </div>

                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400 to-cyan-400 rounded-full blur-2xl"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                      <Icon Component={benefit.icon} color="#67e8f9" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-300">
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

          <div className="text-center" data-aos="fade-up" data-aos-delay="400">
            <Link href="/auth">
              <Button className="bg-white text-slate-900 hover:from-cyan-100 hover:to-white text-lg py-4 px-12 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section with Glassmorphism Cards */}
      <section
        id="about"
        className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-slate-800/40"
        // data-aos="fade-up"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl"></div>
        {/* Background image */}
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Abu Dhabi background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          {/* Header */}
          <div
            className="text-center max-w-4xl mx-auto mb-20"
            data-aos="fade-up"
          >
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                <span className="text-teal-400">VX Academy</span> - Excellence
                in Visitor Experiences
              </h2>
              <div className="w-24 h-1 bg-teal-400 rounded-full mx-auto"></div>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Abu Dhabi's premier training platform designed specifically for
                frontline staff, combining cultural knowledge, hospitality
                excellence, and practical skills.
              </p>
            </div>
          </div>

          {/* Our Comprehensive System - Three Stage Process */}
          <div className="mb-20">
            <h3
              className="text-2xl md:text-3xl font-bold text-white text-center mb-16"
              data-aos="fade-up"
            >
              Our comprehensive system
            </h3>

            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {/* Stage 1: Assess */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon Component={PersonIcon} size={48} color="#67e8f9" />
                  </div>
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 hidden lg:block">
                    <Icon
                      Component={ArrowForwardIcon}
                      size={32}
                      color="#67e8f9"
                    />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Assess</h4>
                <p className="text-white/80 leading-relaxed">
                  Our AI-powered assessments identify hidden potential in
                  frontline staff, looking beyond experience to uncover the
                  markers of exceptional visitor service.
                </p>
              </div>

              {/* Stage 2: Learn */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon Component={SchoolIcon} size={48} color="#67e8f9" />
                  </div>
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 hidden lg:block">
                    <Icon
                      Component={ArrowForwardIcon}
                      size={32}
                      color="#67e8f9"
                    />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Learn</h4>
                <p className="text-white/80 leading-relaxed">
                  We design immersive, job-focused training programs tailored to
                  Abu Dhabi's unique needs, rapidly upskilling talent in
                  cultural knowledge and hospitality excellence.
                </p>
              </div>

              {/* Stage 3: Apply */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon Component={BoltIcon} size={48} color="#67e8f9" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Apply</h4>
                <p className="text-white/80 leading-relaxed">
                  Our comprehensive onboarding, coaching, and mentoring support
                  ensures successful role transitions, accelerating
                  time-to-competency and boosting retention.
                </p>
              </div>
            </div>
          </div>

          {/* Key Results */}
          <div className="text-center" data-aos="fade-up" data-aos-delay="400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 rounded-2xl p-6">
                <p className="text-4xl font-bold text-teal-400 mb-2">100%</p>
                <p className="text-white/70">Top performer rating</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <p className="text-4xl font-bold text-teal-400 mb-2">100%</p>
                <p className="text-white/70">Retention year 1</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <p className="text-4xl font-bold text-teal-400 mb-2">100%</p>
                <p className="text-white/70">Successfull Trained Students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Areas Section */}
      <section
        id="training-areas"
        className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-slate-700"
        // data-aos="fade-up"
      >
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20" data-aos="fade-up">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Training Areas
              </h2>
              <div className="w-24 h-1 bg-teal-400 rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-white leading-relaxed">
                Our comprehensive training system follows a structured approach
                through five interconnected areas, building from foundational
                knowledge to advanced competencies for exceptional visitor
                experiences in Abu Dhabi.
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            data-aos="fade-up"
            data-aos-delay="200"
          >
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
              <div key={index} className="group">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 lg:p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                  {/* Image Placeholder */}
                  <div className="aspect-[4/3] bg-white/5 rounded-lg mb-6 overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={area.imageSrc}
                      alt={area.imageAlt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>

                  {/* Body - flex-1 for consistent height */}
                  <div className="text-center space-y-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors duration-300">
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

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-slate-700/20"
        // data-aos="fade-up"
      >
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20" data-aos="fade-up">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Real-Life Successes
              </h2>
              <div className="w-24 h-1 bg-teal-400 rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-white leading-relaxed">
                Explore the stories of individuals who have elevated their
                careers through the VX Academy experience.
              </p>
            </div>
          </div>

          {/* Testimonials Carousel (Embla) */}
          <Carousel
            className="max-w-6xl mx-auto"
            opts={{ loop: true }}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <CarouselContent>
              {[
                {
                  name: "Ahmed K.",
                  role: "Hotel Concierge",
                  rating: 4.2,
                  testimonial:
                    "VX Academy transformed how I assist guests at our hotel. The cultural knowledge modules helped me provide authentic recommendations that guests truly appreciate.",
                  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                },
                {
                  name: "Fatima S.",
                  role: "Tour Guide",
                  rating: 4.8,
                  testimonial:
                    "The destination knowledge courses were incredibly detailed. I now confidently share hidden gems and fascinating stories about Abu Dhabi that my tour groups love.",
                  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                },
                {
                  name: "Rahim J.",
                  role: "Retail Assistant",
                  rating: 4.5,
                  testimonial:
                    "The communication skills modules helped me connect better with international customers. My sales have increased, and I've received recognition from management.",
                  avatar: "https://randomuser.me/api/portraits/men/67.jpg",
                },
                {
                  name: "Layla M.",
                  role: "Restaurant Server",
                  rating: 3.5,
                  testimonial:
                    "The cultural sensitivity training helped me better understand and serve guests from different backgrounds. My customer satisfaction scores have never been higher.",
                  avatar: "https://randomuser.me/api/portraits/women/28.jpg",
                },
              ].map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <TestimonialCard data={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        id="cta"
        className="py-16 sm:py-20 lg:py-24 relative overflow-hidden"
        // data-aos="fade-up"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="VX Academy CTA Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 lg:p-16 text-white text-center relative overflow-hidden"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Background pattern */}

            <div className="relative z-10 text-center mx-auto max-w-2xl space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Ready to Elevate Visitor Experiences in Abu Dhabi?
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed">
                Join VX Academy today and become part of Abu Dhabi's world-class
                hospitality community. Start your journey toward becoming a
                certified frontline professional.
              </p>
              <div className="pt-4">
                <a href="#">
                  <Button className="bg-white hover:bg-gray-100 text-slate-900 text-lg py-4 px-12 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 font-semibold">
                    Get Started
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Horizontal Layout on Mobile */}
      <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>

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
              <div className="flex space-x-4">
                {[
                  { icon: FacebookIcon },
                  { icon: TwitterIcon },
                  { icon: PinterestIcon },
                  { icon: LinkedInIcon },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-teal-500 flex items-center justify-center transition-all duration-300 hover:scale-110 group backdrop-blur-sm border border-white/20"
                  >
                    <Icon
                      Component={social.icon}
                      size={20}
                      color="currentColor"
                      className="group-hover:scale-110 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile: Compact layout for Links and Contact */}
            <div className="lg:hidden">
              <div className="grid grid-cols-2 gap-6 text-center">
                {/* Quick Links */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        Training Areas
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        Benefits
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        Testimonials
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact Us */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold">Contact Us</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                        <Icon
                          Component={LocationOnIcon}
                          size={12}
                          color="#67e8f9"
                        />
                      </div>
                      <span className="text-white text-xs leading-relaxed text-center">
                        Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi,
                        UAE
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                        <Icon Component={EmailIcon} size={12} color="#67e8f9" />
                      </div>
                      <span className="text-white text-xs">
                        info@vxacademy.ae
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                        <Icon Component={PhoneIcon} size={12} color="#67e8f9" />
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
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    Training Areas
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    Benefits
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden lg:block space-y-6">
              <h3 className="text-lg font-bold">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                    <Icon
                      Component={LocationOnIcon}
                      size={16}
                      color="#67e8f9"
                    />
                  </div>
                  <span className="text-white text-sm leading-relaxed">
                    Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi, UAE
                  </span>
                </div>
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                    <Icon Component={EmailIcon} size={16} color="#67e8f9" />
                  </div>
                  <span className="text-white text-sm">info@vxacademy.ae</span>
                </div>
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                    <Icon Component={PhoneIcon} size={16} color="#67e8f9" />
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
          </div>
        </div>
      </footer>
    </div>
  );
}
