import { ArrowLeft, DollarSign, MapPin, Tag, AlertCircle, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import type { ProfileData, CartItem } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { uploadListingImage } from '../../services/storage/imageService';
import { createListing } from '../../services/listings/listingService';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';
import { rateLimiter, RATE_LIMITS } from '../../utils/rateLimiter';

interface CreateListingProps {
  profileData: ProfileData;
  cart: CartItem[];
  userMode: 'buyer' | 'seller';
  onBackToDashboard: () => void;
  onCreateListing?: () => void | Promise<void>;
  onModeChange: (mode: 'buyer' | 'seller') => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onSellerDashboardClick: () => void;
  onLogoClick?: () => void;
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
  onSellerDashboardClick,
  onLogoClick
}: CreateListingProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

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

  const isFormValid =
    name.trim() !== '' &&
    description.trim() !== '' &&
    price !== '' &&
    parseFloat(price) > 0 &&
    imageFile !== null &&
    location !== '' &&
    category !== '';

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!isFormValid || !user || !imageFile) {
      setError('Please fill out all required fields');
      return;
    }

    // Rate limiting check
    const rateLimit = rateLimiter.checkLimit(
      `listing_creation_${user.uid}`,
      RATE_LIMITS.LISTING_CREATION
    );
    if (!rateLimit.allowed) {
      setError(rateLimit.message || 'Too many listings created. Please try again later.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      setUploading(true);
      const imageURL = await uploadListingImage(user.uid, imageFile);
      setUploading(false);

      logger.general('[CreateListing] Creating listing in Firestore...');
      await createListing({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        imageURL: imageURL,
        location: location,
        sellerId: user.uid,
        sellerName: `${profileData.firstName} ${profileData.lastName}`,
        isAvailable: true,
        category: category,
      });
      logger.general('[CreateListing] Listing created successfully');

      if (onCreateListing) {
        logger.general('[CreateListing] Calling onCreateListing callback...');
        await onCreateListing();
        logger.general('[CreateListing] onCreateListing callback complete');
      } else {
        logger.general('[CreateListing] No onCreateListing callback, navigating to dashboard');
        onBackToDashboard();
      }
    } catch (err) {
      logger.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setCreating(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
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
        onLogoClick={onLogoClick}
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

        <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border-2 border-[#3A3A3A] p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#CC0000] mb-2">Create New Listing</h1>
            <p className="text-[#A0A0A0]">Post a new food item for sale on Night Market</p>
          </div>

          {error && (
            <div className="flex gap-3 p-4 rounded-xl mb-6 bg-[#2A0A0A] border-2 border-[#4A1A1A]">
              <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
              <p className="text-sm text-[#FFB0B0]">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                Food Name <span className="text-[#CC0000]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all bg-[#1E1E1E]"
                placeholder="e.g., Homemade Ramen"
                maxLength={50}
              />
              <p className="text-xs text-[#888888] mt-1">{name.length}/50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                Description <span className="text-[#CC0000]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all resize-none bg-[#1E1E1E] min-h-[100px]"
                placeholder="Describe your food item..."
                maxLength={200}
              />
              <p className="text-xs text-[#888888] mt-1">{description.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                Price <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <DollarSign size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#888888]" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all bg-[#1E1E1E]"
                  placeholder="5.00"
                />
              </div>
              {price && parseFloat(price) <= 0 && (
                <p className="text-xs text-[#CC0000] mt-1">Price must be greater than $0</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                Food Image <span className="text-[#CC0000]">*</span>
              </label>

              {imagePreview ? (
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-[#3A3A3A]">
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-2">Image selected</p>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="text-sm text-[#CC0000] font-semibold hover:underline"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="w-full p-8 border-2 border-dashed border-[#3A3A3A] rounded-xl hover:border-[#CC0000] hover:bg-[#2A0A0A] transition-all flex flex-col items-center gap-3"
                >
                  <Upload size={40} className="text-[#A0A0A0]" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white mb-1">
                      Click to upload food image
                    </p>
                    <p className="text-xs text-[#888888]">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Upload food image"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                Pickup Location <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <MapPin size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#888888]" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all bg-[#1E1E1E] appearance-none"
                  title="Select a location"
                >
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                Category <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <Tag size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#888888]" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all bg-[#1E1E1E] appearance-none"
                  title="Select a category"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-[#0A1A2A] border-2 border-[#1A3A4A]">
              <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">Listing Tips</p>
                <ul className="text-sm text-[#90A0C0] space-y-1">
                  <li>• Be clear and descriptive in your food name</li>
                  <li>• Include ingredients or dietary info in the description</li>
                  <li>• Price fairly based on portion size and ingredients</li>
                  <li>• Choose the location where buyers can pick up</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || creating || uploading}
              className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 disabled:transform-none disabled:hover:shadow-lg ${
                isFormValid && !creating && !uploading ? 'bg-[#CC0000] cursor-pointer' : 'bg-[#999999] cursor-not-allowed'
              }`}
            >
              {uploading ? 'Uploading Image...' : creating ? 'Creating Listing...' : isFormValid ? 'Create Listing →' : 'Fill Required Fields'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateListing;