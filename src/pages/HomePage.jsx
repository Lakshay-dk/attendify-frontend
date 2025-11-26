import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">📚 Attendify</h1>
          <p className="text-xl opacity-90 mb-8">
            Efficient QR-based attendance tracking for educational institutions
          </p>
          
          {!user ? (
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-purple-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition border-2 border-white"
              >
                Register
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition inline-block"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Teacher Features */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-bold mb-3">For Teachers</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Create and manage classes</li>
              <li>✓ Generate session-based QR codes</li>
              <li>✓ Real-time attendance tracking</li>
              {/* Reports & analytics removed */}
              <li>✓ Manage student enrollment</li>
              <li>✓ Track attendance history</li>
            </ul>
          </div>

          {/* Student Features */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-4xl mb-4">👨‍🎓</div>
            <h3 className="text-xl font-bold mb-3">For Students</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Quick QR code scanning</li>
              <li>✓ Mark attendance instantly</li>
              <li>✓ View personal attendance record</li>
              <li>✓ Track attendance percentage</li>
              <li>✓ Access attendance history</li>
              <li>✓ Mobile-friendly interface</li>
            </ul>
          </div>

          {/* System Features */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold mb-3">System Benefits</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Secure authentication</li>
              <li>✓ Session-based QR codes</li>
              <li>✓ Prevents duplicate marking</li>
              <li>✓ Real-time updates</li>
              <li>✓ Cloud-based data storage</li>
              {/* Detailed analytics & reports removed */}
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Teacher Creates Class</h3>
              <p className="text-gray-600 text-sm">Teacher sets up a class with students</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">Generate QR Code</h3>
              <p className="text-gray-600 text-sm">Create session-specific QR codes</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Students Scan</h3>
              <p className="text-gray-600 text-sm">Students scan to mark attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90">Join Attendify today</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-purple-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition border-2 border-white"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
