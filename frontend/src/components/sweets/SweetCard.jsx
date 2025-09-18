import { ShoppingCart, Package } from 'lucide-react';

function SweetCard({ sweet, onPurchase }) {
  const isOutOfStock = sweet.quantity === 0;
  const isLowStock = sweet.quantity <= 5 && sweet.quantity > 0;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-pink-100 to-orange-100 overflow-hidden">
        <img 
          src={`https://via.placeholder.com/400x300/ff9a9e/ffffff?text=${encodeURIComponent(sweet.name)}`}
          alt={sweet.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-3 right-3">
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Only {sweet.quantity} left!
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{sweet.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{sweet.category}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-pink-600">
            ${sweet.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <Package size={16} />
            <span className="text-sm">{sweet.quantity} available</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
          onClick={() => onPurchase(sweet._id)}
          disabled={isOutOfStock}
        >
          <ShoppingCart size={18} />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default SweetCard;