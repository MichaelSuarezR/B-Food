import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Fetch trades from Express API
async function getTrades(filters?: { limit?: number; category?: string; offset?: number }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';
    const params = new URLSearchParams();
    params.append('limit', String(filters?.limit || 6));
    params.append('accepted', 'false');
    if (filters?.category) params.append('category', filters.category);
    if (filters?.offset) params.append('offset', String(filters.offset));
    
    const res = await fetch(`${apiUrl}/api/trades?${params.toString()}`, {
      cache: 'no-store'
    });
    if (!res.ok) return { trades: [] };
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch trades:', error);
    return { trades: [] };
  }
}

export default async function Home() {
  // Fetch different sections of trades
  const [newTrades, recommendedTrades, allTrades] = await Promise.all([
    getTrades({ limit: 6, offset: 0 }), // New trades
    getTrades({ limit: 6 }), // Recommended (same as featured for now)
    getTrades({ limit: 20 }) // All trades for categories
  ]);

  // Get unique categories from all trades
  const categories = Array.from(new Set(
    allTrades.trades
      .map((t: any) => t.category)
      .filter((cat: any) => cat)
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{" "}
              <span className="text-indigo-600">BT:WN</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              BT:WN is a trading marketplace for UCLA students to trade goods and services with each other.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Projects
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Section */}
      {newTrades.trades && newTrades.trades.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">New</h2>
                <p className="text-lg text-gray-600">Latest listings from the community</p>
              </div>
              <Link href="/browse">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newTrades.trades.map((trade: any) => (
                <div key={trade.id} className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {trade.title || 'Untitled Listing'}
                    </h3>
                    {trade.category && (
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                        {trade.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {trade.description || 'No description'}
                  </p>
                  <div className="space-y-2">
                    {trade.skill_offered && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Skill:</span> {trade.skill_offered}
                      </p>
                    )}
                    {trade.price !== null && trade.price !== undefined && (
                      <p className="text-sm font-semibold text-indigo-600">
                        ${parseFloat(trade.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Link href={`/browse?id=${trade.id}`} className="mt-4 inline-block">
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended For You Section */}
      {recommendedTrades.trades && recommendedTrades.trades.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommended For You</h2>
                <p className="text-lg text-gray-600">Tailored listings just for you</p>
              </div>
              <Link href="/browse">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedTrades.trades.map((trade: any) => (
                <div key={trade.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {trade.title || 'Untitled Listing'}
                    </h3>
                    {trade.category && (
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                        {trade.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {trade.description || 'No description'}
                  </p>
                  <div className="space-y-2">
                    {trade.skill_offered && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Skill:</span> {trade.skill_offered}
                      </p>
                    )}
                    {trade.price !== null && trade.price !== undefined && (
                      <p className="text-sm font-semibold text-indigo-600">
                        ${parseFloat(trade.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Link href={`/browse?id=${trade.id}`} className="mt-4 inline-block">
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-lg text-gray-600">Explore listings organized by category</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category: string) => {
                const categoryTrades = allTrades.trades.filter((t: any) => t.category === category);
                return (
                  <Link key={category} href={`/browse?category=${encodeURIComponent(category)}`}>
                    <div className="bg-gray-50 rounded-lg p-6 text-center hover:bg-indigo-50 transition-colors cursor-pointer">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category}</h3>
                      <p className="text-sm text-gray-600">{categoryTrades.length} listings</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose BT:WN?
            </h2>
            <p className="text-lg text-gray-600">
              Connect with fellow Bruins and discover amazing opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Community</h3>
              <p className="text-gray-600">Connect with fellow UCLA students in a trusted, secure environment.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Users</h3>
              <p className="text-gray-600">All users are verified UCLA students, ensuring safe and reliable transactions.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick & Easy</h3>
              <p className="text-gray-600">List items, browse projects, and connect with others in just a few clicks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join the UCLA trading community today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-indigo-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
