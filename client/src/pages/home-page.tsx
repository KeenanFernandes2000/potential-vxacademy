import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const potChatHost = document.getElementById("potChatHost");
    if (potChatHost) {
      potChatHost.remove();
    }
    // @ts-ignore
    chatbotembed({
      botId: "687d2feed500b7283933ad2c",
      botIcon:
        "https://ai.potential.com/static/mentors/AbuDhabiExperience-1753076809518-abudhabi.png",
      botColor: "#d64444",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a2540] relative overflow-hidden">
      {/* Supergraphic SVG Background in Experience Abu Dhabi Style */}
      <svg
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        viewBox="0 0 1920 2000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ minHeight: "60%", minWidth: "100%" }}
      >
        {/* Large, flowing peach shape */}
        <path d="M0,0 Q1200,400 1920,100 Q1600,600 0,600 Z" fill="#00d8cc" />
      </svg>
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
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl px-6 py-2 font-semibold shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105">
                  My Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl px-6 py-2 font-semibold shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105">
                  Sign In / Register
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
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
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
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl py-3 font-semibold shadow-lg backdrop-blur-sm border border-white/20 mt-4">
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl py-3 font-semibold shadow-lg backdrop-blur-sm border border-white/20 mt-4">
                    Sign In / Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Enhanced Glassmorphism */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-16 relative z-10">
          <div className="max-w-4xl text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-cyan-100 to-teal-100 bg-clip-text text-transparent">
              Elevate Abu Dhabi's Visitor Experience
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-10 text-white leading-relaxed max-w-3xl">
              Empowering frontliners with exceptional skills to create memorable
              experiences for every visitor to Abu Dhabi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/auth">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white text-lg py-4 px-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 font-semibold">
                  Start Your Learning Journey
                </Button>
              </Link>
              <a href="#about">
                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white text-teal-600 hover:bg-white/20 text-lg py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 font-semibold"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Glassmorphism Cards */}
      <section
        id="about"
        className="py-16 md:py-24 relative overflow-hidden bg-slate-800/40"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    VX Academy
                  </span>{" "}
                  - Excellence in Visitor Experiences
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
              </div>

              <div className="space-y-6 text-lg leading-relaxed text-white">
                <p className="text-xl text-white">
                  The Visitor Experience (VX) Academy is Abu Dhabi's premier
                  training platform designed specifically for frontline staff.
                  Our comprehensive curriculum combines cultural knowledge,
                  hospitality excellence, and practical skills to ensure every
                  visitor to Abu Dhabi receives an exceptional experience.
                </p>
                <p>
                  Through interactive modules, engaging assessments, and
                  real-world scenarios, learners gain the confidence and
                  expertise to become true ambassadors of Abu Dhabi's
                  hospitality and cultural heritage.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 h-24 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mb-2">
                    <svg
                      className="w-4 h-4 text-teal-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm text-center">
                    Certified Training
                  </p>
                </div>

                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 h-24 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mb-2">
                    <svg
                      className="w-4 h-4 text-teal-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm text-center">
                    Expert Instructors
                  </p>
                </div>

                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 h-24 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mb-2">
                    <svg
                      className="w-4 h-4 text-teal-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm text-center">
                    Community Support
                  </p>
                </div>

                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 h-24 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mb-2">
                    <svg
                      className="w-4 h-4 text-teal-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm text-center">
                    Progress Tracking
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Cultural Heritage Training",
                    description:
                      "Learn about Abu Dhabi's rich cultural traditions",
                    icon: (
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    ),
                  },
                  {
                    title: "Customer Service Excellence",
                    description: "Master world-class hospitality techniques",
                    icon: (
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    ),
                  },
                  {
                    title: "Interactive Learning",
                    description: "Engage through immersive experiences",
                    icon: (
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    ),
                  },
                  {
                    title: "Abu Dhabi Landmarks",
                    description: "Become an expert on local attractions",
                    icon: (
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v4h4V6H4zm6 0v4h4V6h-4zM4 12v4h4v-4H4zm6 0v4h4v-4h-4z"
                        clipRule="evenodd"
                      />
                    ),
                  },
                ].map((item, index) => (
                  <div key={index} className="group">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 lg:p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 h-80 flex flex-col">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <svg
                          className="w-8 h-8 text-teal-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {item.icon}
                        </svg>
                      </div>
                      <div className="flex-grow flex flex-col">
                        <h4 className="text-white font-bold text-xl mb-3 flex-shrink-0">
                          {item.title}
                        </h4>
                        <p className="text-white/70 text-sm leading-relaxed flex-grow">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Areas Section */}
      <section
        id="training-areas"
        className="py-16 md:py-24 relative overflow-hidden bg-slate-700"
      >
        {/* Background decoration */}
        {/* <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div> */}

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Training Areas
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-white leading-relaxed">
                Our comprehensive training modules cover every aspect of
                creating exceptional visitor experiences in Abu Dhabi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
            {[
              {
                title: "Abu Dhabi Information",
                description:
                  "Discover the heart of Abu Dhabi. This training area immerses frontline professionals in the emirate's rich cultural heritage, tourism strategy, and infrastructure.",
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v4h4V6H4zm6 0v4h4V6h-4zM4 12v4h4v-4H4zm6 0v4h4v-4h-4z"
                    clipRule="evenodd"
                  />
                ),
              },
              {
                title: "General VX Soft Skills",
                description:
                  "Master the art of human connection. This track builds communication, empathy, and service delivery skills that ensure every guest feels welcomed and valued.",
                icon: (
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                ),
              },
              {
                title: "General VX Hard Skills",
                description:
                  "Operational excellence starts here. This training sharpens the technical and procedural capabilities needed to manage visitor flows and uphold safety standards.",
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                ),
              },
              {
                title: "Managerial Competencies",
                description:
                  "Lead with purpose. Designed for supervisors and team leaders, this area builds leadership, strategic planning, and performance management skills.",
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                ),
              },
              {
                title: "Specialized Tracks",
                description:
                  "Tailored for your role. These advanced, sector-specific programs provide deep expertise for specialized frontline positions across Abu Dhabi's visitor landscape.",
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                ),
              },
            ].map((area, index) => (
              <div key={index} className="group">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 lg:p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 h-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <svg
                      className="w-10 h-10 text-teal-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {area.icon}
                    </svg>
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors duration-300">
                      {area.title}
                    </h3>
                    <p className="text-white text-sm leading-relaxed">
                      {area.description}
                    </p>
                    <div className="pt-4">
                      <a
                        href="#"
                        className="inline-flex items-center text-teal-400 font-semibold text-sm hover:text-cyan-400 transition-colors group-hover:translate-x-1 transform duration-300"
                      >
                        Learn More
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-16 md:py-24 relative overflow-hidden bg-[#003451]"
      >
        {/* Supergraphic SVG Background for Benefits Section, flowing into Testimonials */}
        <svg
          className="absolute inset-0 w-full h-[200%] z-0"
          viewBox="0 0 900 1400"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMinYMin slice"
          style={{ top: 0, left: 0 }}
        >
          <path
            d="M400,300 C400,100 200,100 200,300 C200,500 400,500 400,300 Z M320,200 C360,200 380,260 380,300 C380,340 360,400 320,400 C280,400 260,340 260,300 C260,260 280,200 320,200 Z"
            fill="#009086"
            transform="translate(-1300, -2100) scale(6)"
          />
        </svg>

        {/* Removed old blurred and previous SVG backgrounds */}

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Why Join VX Academy?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-white to-cyan-400 rounded-full mx-auto"></div>
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
                  "Earn a prestigious certification recognized by VX Academy and Abu Dhabi's frontline hospitality and tourism sector.",
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ),
              },
              {
                title: "Career Advancement",
                description:
                  "Enhance your resume and open doors to new career opportunities in the growing hospitality sector.",
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                ),
              },
              {
                title: "Achievement Badges",
                description:
                  "Earn digital badges to recognize your skills and showcase your hospitality expertise to employers and colleagues.",
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ),
              },
              {
                title: "Networking Opportunities",
                description:
                  "Connect with fellow professionals across Abu Dhabi's hospitality and tourism Cluster's network of facilities.",
                icon: (
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                ),
              },
              {
                title: "Mobile Learning",
                description:
                  "Access courses anytime, anywhere through our mobile-friendly platform with online and offline capabilities.",
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                    clipRule="evenodd"
                  />
                ),
              },
              {
                title: "AI-Powered Assistance",
                description:
                  "Get personalized help from our AI tutor to enhance your learning experience and address questions.",
                icon: (
                  <path
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                ),
              },
              {
                title: "Progress Tracking",
                description:
                  "Monitor your learning journey with detailed analytics and personalized progress reports.",
                icon: <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />,
              },
              {
                title: "Interactive Learning",
                description:
                  "Engage with immersive content, simulations, and real-world scenarios for a dynamic learning experience.",
                icon: (
                  <path
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                ),
              },
            ].map((benefit, index) => (
              <div key={index} className="group">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 lg:p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {benefit.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-white leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-white to-cyan-100 text-slate-900 hover:from-cyan-100 hover:to-white text-lg py-4 px-12 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 font-semibold">
                Join VX Academy Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-16 md:py-24 relative overflow-hidden bg-slate-700/20"
      >
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Real-Life Successes
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-white leading-relaxed">
                Explore the stories of individuals who have elevated their
                careers through the VX Academy experience.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: "Ahmed K.",
                role: "Hotel Concierge",
                testimonial:
                  "VX Academy transformed how I assist guests at our hotel. The cultural knowledge modules helped me provide authentic recommendations that guests truly appreciate.",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                name: "Fatima S.",
                role: "Tour Guide",
                testimonial:
                  "The destination knowledge courses were incredibly detailed. I now confidently share hidden gems and fascinating stories about Abu Dhabi that my tour groups love.",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              },
              {
                name: "Rahim J.",
                role: "Retail Assistant",
                testimonial:
                  "The communication skills modules helped me connect better with international customers. My sales have increased, and I've received recognition from management.",
                avatar: "https://randomuser.me/api/portraits/men/67.jpg",
              },
            ].map((testimonial, index) => (
              <div key={index} className="group">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 lg:p-10 hover:bg-white/20 transition-all duration-500 hover:scale-105 h-full">
                  <div className="flex items-center mb-8">
                    <div className="relative mr-6">
                      <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-teal-400/20 group-hover:ring-teal-400/40 transition-all duration-300">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors duration-300">
                        {testimonial.name}
                      </h3>
                      <p className="text-teal-400 font-medium">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="text-3xl text-teal-400 leading-none">"</div>
                    <p className="text-white leading-relaxed -mt-4">
                      {testimonial.testimonial}
                    </p>
                    <div className="flex text-yellow-400 space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-[#003451]">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 lg:p-16 text-white text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-cyan-400 rounded-full blur-lg"></div>
              <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full blur-md"></div>
            </div>

            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Ready to Elevate Visitor Experiences in Abu Dhabi?
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto text-white leading-relaxed">
                Join VX Academy today and become part of Abu Dhabi's world-class
                hospitality community. Start your journey toward becoming a
                certified frontline professional.
              </p>
              <div className="pt-4">
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-white to-cyan-100 text-slate-900 hover:from-cyan-100 hover:to-white text-lg py-4 px-12 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 font-semibold">
                    Begin Your Training Journey
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Horizontal Layout on Mobile */}
      <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 text-white py-12 lg:py-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          {/* Mobile: Single row layout, Desktop: Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 lg:mb-12">
            {/* VX Academy Section */}
            <div className="space-y-6">
              <h3 className="text-xl lg:text-2xl font-bold">VX Academy</h3>
              <p className="text-white leading-relaxed text-sm lg:text-base">
                The premier training platform for Abu Dhabi's frontline
                hospitality and tourism professionals.
              </p>
              <div className="flex space-x-4">
                {[
                  {
                    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                  },
                  {
                    icon: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z",
                  },
                  {
                    icon: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z",
                  },
                  {
                    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                  },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 flex items-center justify-center transition-all duration-300 hover:scale-110 group backdrop-blur-sm border border-white/20"
                  >
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile: Horizontal layout for these sections */}
            <div className="lg:hidden">
              <div className="grid grid-cols-3 gap-6 text-center">
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

                {/* Resources */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold">Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        Contact Support
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block"
                      >
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact Us */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold">Contact Us</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                        <svg
                          className="w-3 h-3 text-cyan-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-white text-xs leading-relaxed text-center">
                        Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi,
                        UAE
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                        <svg
                          className="w-3 h-3 text-cyan-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs">
                        info@vxacademy.ae
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 group">
                      <div className="w-5 h-5 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                        <svg
                          className="w-3 h-3 text-cyan-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs">
                        +971 2 123 4567
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Regular layout */}
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
              <h3 className="text-lg font-bold">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    Contact Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 transform inline-block"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden lg:block space-y-6">
              <h3 className="text-lg font-bold">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                    <svg
                      className="w-4 h-4 text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-sm leading-relaxed">
                    Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi, UAE
                  </span>
                </div>
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                    <svg
                      className="w-4 h-4 text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">info@vxacademy.ae</span>
                </div>
                <div className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-400/40 transition-colors">
                    <svg
                      className="w-4 h-4 text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
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
