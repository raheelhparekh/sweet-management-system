import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import SweetCard from '../components/sweets/SweetCard';
import useAuthStore from '../store/authStore';
import useSweetStore from '../store/sweetStore';
import { Search, X } from 'lucide-react';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { sweets, loading, fetchSweets, purchaseSweet, searchSweets } = useSweetStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Debounced search function
  const performSearch = useCallback(async (searchParams) => {
    try {
      if (Object.values(searchParams).some(val => val !== '')) {
        await searchSweets(searchParams);
      } else {
        await fetchSweets();
      }
    } catch {
      toast.error('Failed to search for sweets.');
    }
  }, [searchSweets, fetchSweets]);

  const debouncedSearch = useCallback(
    (searchParams) => {
      const debounced = debounce(performSearch, 500);
      debounced(searchParams);
    },
    [performSearch]
  );

  useEffect(() => {
    fetchSweets();
  }, [fetchSweets]);

  // Trigger search when any filter changes
  useEffect(() => {
    debouncedSearch({
      name: searchQuery,
      category: categoryFilter,
      minPrice,
      maxPrice,
    });
  }, [searchQuery, categoryFilter, minPrice, maxPrice, debouncedSearch]);

  const handlePurchase = async (id) => {
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to purchase a sweet.');
        return;
      }
      await purchaseSweet(id);
      toast.success('Sweet purchased successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to purchase sweet.');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-lg text-gray-600">Loading delicious sweets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
            Sweet Delights
          </h1>
          <p className="text-lg text-gray-600">Discover your favorite treats from our collection</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border--100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Search size={20} />
            Find Your Perfect Sweet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                className="input input-bordered bg-pink-50 text-gray-700  w-full pl-4 pr-10 py-3 rounded-xl border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by category..."
                className="input input-bordered bg-pink-50 text-gray-700  w-full pl-4 pr-10 py-3 rounded-xl border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
              {categoryFilter && (
                <button
                  onClick={() => setCategoryFilter('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <input
              type="number"
              placeholder="Min price ($)"
              className="input input-bordered bg-pink-50 text-gray-700  w-full px-4 py-3 rounded-xl border-gray-200 focus:border-pink-300 focus:ring-pink-200"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max price ($)"
              className="input input-bordered bg-pink-50 text-gray-700  w-full px-4 py-3 rounded-xl border-gray-200 focus:border-pink-300 focus:ring-pink-200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          
          {(searchQuery || categoryFilter || minPrice || maxPrice) && (
            <button 
              type="button" 
              className="btn btn-outline btn-sm rounded-full px-6" 
              onClick={handleClearSearch}
            >
              <X size={16} />
              Clear All Filters
            </button>
          )}
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(sweets) && sweets.length > 0 ? (
            sweets.map((sweet) => (
              <SweetCard key={sweet._id} sweet={sweet} onPurchase={handlePurchase} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <p className="text-xl text-gray-600 font-medium">No sweets found</p>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;