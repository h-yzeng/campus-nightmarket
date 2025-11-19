import { ArrowLeft, DollarSign, MapPin, Tag, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { ProfileData, CartItem, Listing } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface CreateListingProps {
  profileData: ProfileData;
  cart: CartItem[];
  userMode: 'buyer' | 'seller';
  onBackToDashboard: () => void;
  onCreateListing: (listing: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'datePosted'>) => void;
  onModeChange: (mode: 'buyer' | 'seller') => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onSellerDashboardClick: () => void;
}

const CreateListing = ({
  profileData,
  cart,
  userMode,
  onBackToDashboard,
  onCreateListing,
  onModeChange,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onSellerDashboardClick
}: CreateListingProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const locations = [
    'Cunningham Hall',
    'Kacek Hall',
    'Carmen Hall',
    'MSV',
    'Rowe North',
    'Rowe Middle',
    'Rowe South',
    'The Quad'
  ];

  const categories = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Desserts',
    'Drinks',
    'Other'
  ];

  const foodEmojis = [
    '🍕', '🍔', '🌮', '🌯', '🥙', '🥗', '🍝', '🍜', '🍲', '🍛',
    '🍣', '🍱', '🥘', '🍿', '🥟', '🥠', '🥡', '🍦', '🍰', '🎂',
    '🍪', '🍩', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🥤', '🧃',
    '☕', '🍵', '🧋', '🥛', '🍺', '🍕', '🥨', '🥯', '🧇', '🥞'
  ];

  const isFormValid = 
    name.trim() !== '' &&
    description.trim() !== '' &&
    price !== '' &&
    parseFloat(price) > 0 &&
    image !== '' &&
    location !== '' &&
    category !== '';

  const handleSubmit = () => {
    if (!isFormValid) {
      alert('Please fill out all required fields');
      return;
    }

    const newListing: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'datePosted'> = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image: image,
      location: location,
      category: category,
      isAvailable: true
    };

    onCreateListing(newListing);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        cartItems={cart} 
        profileData={profileData}
        userMode={userMode}
        onCartClick={onCartClick}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onOrdersClick={onOrdersClick}
        onModeChange={onModeChange}
        onSellerDashboardClick={onSellerDashboardClick}
        showCart={true}
      />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onBackToDashboard}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#CC0000] mb-2">Create New Listing</h1>
            <p className="text-gray-600">Post a new food item for sale on Night Market</p>
          </div>

          <div className="space-y-6">
            {/* Food Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Food Name <span className="text-[#CC0000]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white"
                placeholder="e.g., Homemade Ramen"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{name.length}/50 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Description <span className="text-[#CC0000]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all resize-none bg-white min-h-[100px]"
                placeholder="Describe your food item..."
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/200 characters</p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Price <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <DollarSign size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white"
                  placeholder="5.00"
                />
              </div>
              {price && parseFloat(price) <= 0 && (
                <p className="text-xs text-[#CC0000] mt-1">Price must be greater than $0</p>
              )}
            </div>

            {/* Food Emoji */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Food Emoji <span className="text-[#CC0000]">*</span>
              </label>
              <div className="mb-3">
                {image && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-20 h-20 rounded-xl bg-[#FAFAFA] border-2 border-gray-200 flex items-center justify-center">
                      <span className="text-5xl">{image}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Selected: {image}</p>
                      <button
                        onClick={() => setImage('')}
                        className="text-xs text-[#CC0000] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-10 gap-2 p-4 bg-[#FAFAFA] rounded-xl border-2 border-gray-200 max-h-48 overflow-y-auto">
                {foodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setImage(emoji)}
                    className={`w-10 h-10 text-2xl rounded-lg transition-all hover:scale-110 ${
                      image === emoji
                        ? 'bg-[#CC0000] bg-opacity-10 ring-2 ring-[#CC0000]'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Or paste any emoji: 
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value.slice(0, 2))}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded text-lg w-16"
                  placeholder="🍕"
                  maxLength={2}
                />
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Pickup Location <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <MapPin size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white appearance-none"
                  title="Select a location"
                >
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Category <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <Tag size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white appearance-none"
                  title="Select a category"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
              <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Listing Tips</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Be clear and descriptive in your food name</li>
                  <li>• Include ingredients or dietary info in the description</li>
                  <li>• Price fairly based on portion size and ingredients</li>
                  <li>• Choose the location where buyers can pick up</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 disabled:transform-none disabled:hover:shadow-lg ${
                isFormValid ? 'bg-[#CC0000] cursor-pointer' : 'bg-[#D0D0D0] cursor-not-allowed'
              }`}
            >
              {isFormValid ? 'Create Listing →' : 'Fill Required Fields'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateListing;