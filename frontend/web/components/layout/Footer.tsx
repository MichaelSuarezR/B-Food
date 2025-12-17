import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              BT:WN
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              BT:WN is a trading marketplace for UCLA students to trade goods and services with each other.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/browse" className="text-sm text-gray-600 hover:text-indigo-600">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-sm text-gray-600 hover:text-indigo-600">
                  Create Project
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-indigo-600">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-indigo-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-indigo-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © 2024 BT:WN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
