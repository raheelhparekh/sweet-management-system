import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit, Save, Package, Tag, DollarSign, X } from 'lucide-react';
import useSweetStore from '../../store/sweetStore';

function UpdateSweetForm({ sweet, onSweetUpdated, onCancel }) {
  const [name, setName] = useState(sweet ? sweet.name : '');
  const [category, setCategory] = useState(sweet ? sweet.category : '');
  const [price, setPrice] = useState(sweet ? sweet.price : '');
  const [quantity, setQuantity] = useState(sweet ? sweet.quantity : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateSweet } = useSweetStore();

  useEffect(() => {
    if (sweet) {
      setName(sweet.name || '');
      setCategory(sweet.category || '');
      setPrice(sweet.price || '');
      setQuantity(sweet.quantity || '');
    }
  }, [sweet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !category.trim()) {
      toast.error('Name and category are required.');
      return;
    }
    
    if (!price || Number(price) <= 0) {
      toast.error('Price must be greater than 0.');
      return;
    }
    
    if (!quantity || Number(quantity) < 0) {
      toast.error('Quantity must be non-negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSweet(sweet._id, { 
        name: name.trim(), 
        category: category.trim(), 
        price: Number(price), 
        quantity: Number(quantity) 
      });
      toast.success('Sweet updated successfully!');
      if (onSweetUpdated) onSweetUpdated(); // Callback to refresh the sweet list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update sweet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sweet) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Edit size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Update Sweet</h3>
        <p className="text-gray-500 text-sm mt-1">Edit the details of this sweet item</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sweet Name
          </label>
          <div className="relative">
            <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Enter sweet name"
              className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all duration-200 bg-gray-50 focus:bg-white" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="relative">
            <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Enter category"
              className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all duration-200 bg-gray-50 focus:bg-white" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all duration-200 bg-gray-50 focus:bg-white" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
                min="0" 
                step="0.01" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="relative">
              <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="number" 
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all duration-200 bg-gray-50 focus:bg-white" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                required 
                min="0" 
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Save size={20} />
                Update Sweet
              </div>
            )}
          </button>
          
          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default UpdateSweetForm;