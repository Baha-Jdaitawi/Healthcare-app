import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20healthcare%20technology%20background%20with%20medical%20professionals%20using%20digital%20tablets%20and%20computers%20in%20bright%20hospital%20setting%2C%20clean%20medical%20facility%20with%20patients%20and%20doctors%20interacting%2C%20healthcare%20management%20system%20visualization%2C%20professional%20medical%20environment%20with%20blue%20and%20white%20color%20scheme&width=1200&height=800&seq=healthcare-hero&orientation=landscape')`
          }}
        ></div>
        <div className="absolute inset-0 bg-blue-900/70"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: '"Pacifico", serif' }}>
              HealthCare Pro
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto">
              Your Complete Healthcare Management Platform
            </p>
            <p className="text-lg text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
              Streamline patient care, manage appointments, and access medical records securely. 
              Trusted by healthcare professionals and patients worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-900 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap shadow-lg"
              >
                <i className="ri-login-circle-line mr-3 text-xl"></i>
                Sign In to Your Account
              </Link>
              
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors whitespace-nowrap"
              >
                <i className="ri-user-add-line mr-3 text-xl"></i>
                Create New Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Healthcare Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a patient or healthcare provider, our platform offers comprehensive tools 
              to manage your healthcare journey efficiently and securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Patients */}
            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://readdy.ai/api/search-image?query=Happy%20patient%20using%20digital%20healthcare%20app%20on%20tablet%2C%20smiling%20person%20booking%20medical%20appointment%20online%2C%20patient%20portal%20interface%2C%20healthcare%20technology%20for%20patients%2C%20medical%20app%20usage&width=200&height=200&seq=patient-feature&orientation=squarish')`
                }}
              ></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">For Patients</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Book appointments online
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Access medical records
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Upload documents securely
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Find qualified doctors
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Review healthcare providers
                </li>
              </ul>
            </div>

            {/* For Doctors */}
            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://readdy.ai/api/search-image?query=Professional%20doctor%20in%20white%20coat%20using%20medical%20management%20software%20on%20computer%2C%20physician%20reviewing%20patient%20records%20digitally%2C%20healthcare%20provider%20dashboard%2C%20medical%20practice%20management%20technology&width=200&height=200&seq=doctor-feature&orientation=squarish')`
                }}
              ></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">For Healthcare Providers</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Manage patient appointments
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Access patient records
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Upload credentials
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Schedule management
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Patient communication
                </li>
              </ul>
            </div>

            {/* Security */}
            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://readdy.ai/api/search-image?query=Healthcare%20data%20security%20concept%20with%20digital%20lock%20and%20medical%20symbols%2C%20HIPAA%20compliance%20visualization%2C%20secure%20medical%20data%20protection%2C%20healthcare%20cybersecurity%20technology%2C%20encrypted%20patient%20information&width=200&height=200&seq=security-feature&orientation=squarish')`
                }}
              ></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Compliance</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  HIPAA compliant
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  ISO 27001 certified
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Secure data storage
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-green-600 mr-2"></i>
                  Regular security audits
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-blue-200">Active Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-200">Healthcare Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-blue-200">Appointments Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-200">Uptime Reliability</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers who trust HealthCare Pro 
            for their medical management needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
            >
              <i className="ri-user-add-line mr-3 text-xl"></i>
              Get Started Today
            </Link>
            
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-blue-600 text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
            >
              <i className="ri-login-circle-line mr-3 text-xl"></i>
              Sign In
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 pt-8 mt-8 border-t border-gray-200">
            <div className="flex items-center">
              <i className="ri-shield-check-line mr-2 text-lg"></i>
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center">
              <i className="ri-lock-line mr-2 text-lg"></i>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center">
              <i className="ri-verified-badge-line mr-2 text-lg"></i>
              <span>ISO Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}