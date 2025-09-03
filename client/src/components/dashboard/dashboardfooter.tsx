import React from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

interface DashboardFooterProps {
  scrollToSection?: (sectionId: string) => void;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({
  scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  },
}) => {
  return (
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
            <div className="grid grid-cols-2 gap-6">
              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-left">Quick Links</h3>
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
                <h3 className="text-base font-bold text-left">Contact Us</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3 group">
                    <div className="w-5 h-5 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                      <LocationOnIcon
                        style={{ fontSize: 12, color: "#00d8cc" }}
                      />
                    </div>
                    <span className="text-white text-xs leading-relaxed text-left">
                      Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi, UAE
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 group">
                    <div className="w-5 h-5 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                      <EmailIcon style={{ fontSize: 12, color: "#00d8cc" }} />
                    </div>
                    <span className="text-white text-xs text-left">
                      info@vxacademy.ae
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 group">
                    <div className="w-5 h-5 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                      <PhoneIcon style={{ fontSize: 12, color: "#00d8cc" }} />
                    </div>
                    <span className="text-white text-xs text-left">
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
                  <LocationOnIcon style={{ fontSize: 16, color: "#00d8cc" }} />
                </div>
                <span className="text-white text-sm leading-relaxed">
                  Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi, UAE
                </span>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                  <EmailIcon style={{ fontSize: 16, color: "#00d8cc" }} />
                </div>
                <span className="text-white text-sm">info@vxacademy.ae</span>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-[#00d8cc]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d8cc]/40 transition-colors">
                  <PhoneIcon style={{ fontSize: 16, color: "#00d8cc" }} />
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
  );
};

export default DashboardFooter;
