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
  pendingOrdersCount?: number;
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
  onLogoClick,
  pendingOrdersCount = 0,
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
    'The Quad',
  ];

  const categories = ['Snacks', 'Desserts', 'Drinks', 'Other'];

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
        isActive: true,
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
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
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
        pendingOrdersCount={pendingOrdersCount}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#CC0000]">Create New Listing</h1>
            <p className="text-[#A0A0A0]">Post a new food item for sale on Night Market</p>
          </div>

          {error && (
            <div className="mb-6 flex gap-3 rounded-xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#CC0000]" />
              <p className="text-sm text-[#FFB0B0]">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                Food Name <span className="text-[#CC0000]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#888888] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                placeholder="e.g., Homemade Ramen"
                maxLength={50}
              />
              <p className="mt-1 text-xs text-[#888888]">{name.length}/50 characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                Description <span className="text-[#CC0000]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] w-full resize-none rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#888888] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                placeholder="Describe your food item..."
                maxLength={200}
              />
              <p className="mt-1 text-xs text-[#888888]">{description.length}/200 characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                Price <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <DollarSign
                  size={20}
                  className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#888888]"
                />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] py-3 pr-4 pl-12 text-base text-[#E0E0E0] placeholder-[#888888] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  placeholder="5.00"
                />
              </div>
              {price && parseFloat(price) <= 0 && (
                <p className="mt-1 text-xs text-[#CC0000]">Price must be greater than $0</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                Food Image <span className="text-[#CC0000]">*</span>
              </label>

              {imagePreview ? (
                <div className="mb-3 flex items-start gap-4">
                  <div className="h-32 w-32 overflow-hidden rounded-xl border-2 border-[#3A3A3A]">
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="mb-2 text-sm font-semibold text-white">Image selected</p>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="text-sm font-semibold text-[#CC0000] hover:underline"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[#3A3A3A] p-8 transition-all hover:border-[#CC0000] hover:bg-[#2A0A0A]"
                >
                  <Upload size={40} className="text-[#A0A0A0]" />
                  <div className="text-center">
                    <p className="mb-1 text-sm font-semibold text-white">
                      Click to upload food image
                    </p>
                    <p className="text-xs text-[#888888]">PNG, JPG up to 5MB</p>
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
              <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                Pickup Location <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <MapPin
                  size={20}
                  className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#888888]"
                />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] py-3 pr-4 pl-12 text-base text-[#E0E0E0] placeholder-[#888888] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  title="Select a location"
                >
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                Category <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <Tag
                  size={20}
                  className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#888888]"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] py-3 pr-4 pl-12 text-base text-[#E0E0E0] placeholder-[#888888] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  title="Select a category"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border-2 border-[#1A3A4A] bg-[#0A1A2A] p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-blue-400" />
              <div>
                <p className="mb-1 text-sm font-semibold text-white">Listing Tips</p>
                <ul className="space-y-1 text-sm text-[#90A0C0]">
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
              className={`w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98 disabled:transform-none disabled:hover:shadow-lg ${
                isFormValid && !creating && !uploading
                  ? 'cursor-pointer bg-[#CC0000]'
                  : 'cursor-not-allowed bg-[#999999]'
              }`}
            >
              {uploading
                ? 'Uploading Image...'
                : creating
                  ? 'Creating Listing...'
                  : isFormValid
                    ? 'Create Listing →'
                    : 'Fill Required Fields'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateListing;
