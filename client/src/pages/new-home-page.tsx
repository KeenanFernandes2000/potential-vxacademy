import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { TrainingArea } from "@shared/schema";

export default function NewHomePage() {
  const { user } = useAuth();
  
  const { data: trainingAreas } = useQuery<TrainingArea[]>({
    queryKey: ["/api/training-areas"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm z-50 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-[#008B8B]">abudhabï</div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-[#008B8B] transition-colors">Home</a>
            <a href="#experiences" className="text-gray-700 hover:text-[#008B8B] transition-colors">Experiences</a>
            <a href="#events" className="text-gray-700 hover:text-[#008B8B] transition-colors">Events</a>
            <a href="#business" className="text-gray-700 hover:text-[#008B8B] transition-colors">Business</a>
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-[#008B8B] hover:bg-[#008B8B]/90 text-white rounded-lg px-6">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="bg-[#008B8B] hover:bg-[#008B8B]/90 text-white rounded-lg px-6">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#008B8B] to-[#006666] text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Elevate Abu Dhabi's Visitor Experience
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Empowering tourism and hospitality professionals with world-class training to deliver exceptional visitor experiences throughout Abu Dhabi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-white text-[#008B8B] hover:bg-gray-100 text-lg py-3 px-8 rounded-lg">
                    View Training Library
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="bg-white text-[#008B8B] hover:bg-gray-100 text-lg py-3 px-8 rounded-lg">
                    View Training Library
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="border-white text-white hover:bg-white/10 text-lg py-3 px-8 rounded-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VX Academy Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                VX Academy - Excellence in Visitor Experiences
              </h2>
              <p className="text-gray-700 mb-6">
                The Visitor Experience (VX) Academy is Abu Dhabi's premier training platform for hospitality and tourism professionals. Our comprehensive learning programs are designed to elevate service standards and create memorable experiences for every visitor.
              </p>
              <p className="text-gray-700 mb-8">
                Through innovative modules featuring immersive experiences, real-world scenarios and expert insights, our academy transforms frontline professionals into hospitality ambassadors who embody Abu Dhabi's values and excellence.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#008B8B] mb-2">500+</div>
                  <div className="text-sm text-gray-600">Online Courses</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#008B8B] mb-2">50k+</div>
                  <div className="text-sm text-gray-600">Learners Trained</div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">Cultural Heritage Training</h3>
                <p className="text-gray-600 text-sm">Understanding Abu Dhabi's rich cultural heritage and traditions</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">Customer Excellence</h3>
                <p className="text-gray-600 text-sm">Delivering world-class service and memorable experiences</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">Immersive Learning</h3>
                <p className="text-gray-600 text-sm">Interactive modules and real-world scenario training</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">Abu Dhabi Knowledge</h3>
                <p className="text-gray-600 text-sm">Comprehensive understanding of attractions and experiences</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Areas Section */}
      <section id="training-areas" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Training Areas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive training covers every aspect of hospitality excellence that creates exceptional visitor experiences in Abu Dhabi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-[#E8F4F8] p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-[#008B8B] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-white">hotel</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Abu Dhabi Tourism Knowledge</h3>
              <p className="text-sm text-gray-600">
                Comprehensive understanding of Abu Dhabi's attractions, culture, and experiences to guide visitors effectively
              </p>
            </div>
            
            <div className="bg-[#E8F4F8] p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-[#008B8B] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-white">groups</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Service At Any Touchpoint</h3>
              <p className="text-sm text-gray-600">
                Delivering consistent excellence across all visitor interaction points, from arrival to departure
              </p>
            </div>
            
            <div className="bg-[#E8F4F8] p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-[#008B8B] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-white">psychology</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Service At Every Moment</h3>
              <p className="text-sm text-gray-600">
                Creating memorable moments through attentive, personalized service throughout the visitor journey
              </p>
            </div>
            
            <div className="bg-[#E8F4F8] p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-[#008B8B] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-white">support_agent</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Hospitality Standards</h3>
              <p className="text-sm text-gray-600">
                Maintaining the highest standards of hospitality that reflect Abu Dhabi's commitment to excellence
              </p>
            </div>
            
            <div className="bg-[#E8F4F8] p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-[#008B8B] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-white">business</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Business Ethics</h3>
              <p className="text-sm text-gray-600">
                Upholding professional ethics and responsible tourism practices in all business interactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join VX Academy Section */}
      <section className="py-16 bg-[#008B8B] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Join VX Academy?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Joining VX Academy positions hospitality professionals with extensive benefits that enhance both personal development and business success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-icons text-white">workspace_premium</span>
              </div>
              <h3 className="font-bold mb-3">Recognized Certification</h3>
              <p className="text-sm opacity-90">
                Earn industry-recognized certificates that validate your expertise in hospitality excellence
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-icons text-white">assessment</span>
              </div>
              <h3 className="font-bold mb-3">Competency Assessment</h3>
              <p className="text-sm opacity-90">
                Comprehensive evaluations to measure and improve your service delivery capabilities
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-icons text-white">trending_up</span>
              </div>
              <h3 className="font-bold mb-3">Assessment Analytics</h3>
              <p className="text-sm opacity-90">
                Detailed insights into your learning progress and areas for continued development
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-icons text-white">leaderboard</span>
              </div>
              <h3 className="font-bold mb-3">Reporting Insights</h3>
              <p className="text-sm opacity-90">
                Comprehensive reporting for organizations to track team development and performance
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-icons text-white">psychology</span>
              </div>
              <h3 className="font-bold mb-3">Experiential Training</h3>
              <p className="text-sm opacity-90">
                Immersive learning experiences that simulate real-world hospitality scenarios
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-icons text-white">quiz</span>
              </div>
              <h3 className="font-bold mb-3">Content Assessment</h3>
              <p className="text-sm opacity-90">
                Regular knowledge checks to ensure comprehension and retention of key concepts
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-icons text-white">school</span>
              </div>
              <h3 className="font-bold mb-3">Blended Training</h3>
              <p className="text-sm opacity-90">
                Flexible learning combining online modules with hands-on practical applications
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-icons text-white">support</span>
              </div>
              <h3 className="font-bold mb-3">Dedicated Learning Support</h3>
              <p className="text-sm opacity-90">
                Expert guidance and support throughout your learning journey to ensure success
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/auth">
              <Button className="bg-white text-[#008B8B] hover:bg-gray-100 text-lg py-3 px-8 rounded-lg">
                Start Learning Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-Life Successes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real-Life Successes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the stories of professionals who have elevated their careers through VX Academy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold text-gray-900">Ahmed A.</h4>
                  <p className="text-sm text-gray-600">Hotel Concierge</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "VX Academy transformed how I interact with guests. The cultural training helped me provide authentic local experiences that guests truly appreciate."
              </p>
              <div className="flex text-yellow-400">
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold text-gray-900">Fatima S.</h4>
                  <p className="text-sm text-gray-600">Tour Guide</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The hospitality standards module elevated my service delivery. I now confidently share Abu Dhabi's heritage while ensuring exceptional visitor experiences."
              </p>
              <div className="flex text-yellow-400">
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold text-gray-900">Omar T.</h4>
                  <p className="text-sm text-gray-600">Restaurant Manager</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The business ethics and service excellence training improved our team's performance significantly. Guest satisfaction scores increased by 40%."
              </p>
              <div className="flex text-yellow-400">
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#008B8B] to-[#006666] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Elevate Visitor Experiences in Abu Dhabi?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of hospitality professionals who are creating exceptional visitor experiences through VX Academy training programs.
          </p>
          <Link href="/auth">
            <Button className="bg-white text-[#008B8B] hover:bg-gray-100 text-lg py-3 px-8 rounded-lg">
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">VX Academy</h3>
              <p className="text-gray-400 mb-4">
                Elevating hospitality standards and visitor experiences across Abu Dhabi.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="material-icons">facebook</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="material-icons">twitter</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="material-icons">instagram</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="material-icons">linkedin</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Training Areas</a></li>
                <li><a href="#" className="hover:text-white">Certifications</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Learning Library</a></li>
                <li><a href="#" className="hover:text-white">Support Center</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
                <li><a href="#" className="hover:text-white">Best Practices</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <div className="text-gray-400 space-y-2">
                <p>Email: support@vxacademy.ae</p>
                <p>Phone: +971 2 123 4567</p>
                <p>Address: Abu Dhabi, UAE</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VX Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}