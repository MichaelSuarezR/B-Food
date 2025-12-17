export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">Browse Projects</h1>
          <p className="mt-2 text-gray-600">
            Discover and support innovative projects on BruinCoin
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>All Categories</option>
                <option>Technology</option>
                <option>Education</option>
                <option>Community</option>
                <option>Environment</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Sort by</option>
                <option>Newest</option>
                <option>Most Popular</option>
                <option>Most Funded</option>
                <option>Ending Soon</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Card Placeholder 1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Sample Project 1
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                A revolutionary blockchain-based solution for sustainable energy tracking.
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">$7,500</span>
                <span className="text-sm text-gray-500">raised of $10,000</span>
              </div>
            </div>
          </div>

          {/* Project Card Placeholder 2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Sample Project 2
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Ending Soon
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Educational platform for teaching blockchain technology to students.
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>45%</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">$2,250</span>
                <span className="text-sm text-gray-500">raised of $5,000</span>
              </div>
            </div>
          </div>

          {/* Project Card Placeholder 3 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Sample Project 3
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Community garden initiative using blockchain for resource tracking.
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>90%</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">$9,000</span>
                <span className="text-sm text-gray-500">raised of $10,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
