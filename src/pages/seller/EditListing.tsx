import {
  ArrowLeft,
  DollarSign,
  MapPin,
  Tag,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { ProfileData, CartItem } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { uploadListingImage } from '../../services/storage/imageService';
import { getListing, updateListing } from '../../services/listings/listingService';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';

interface EditListingProps {
  listingId: string;
  profileData: ProfileData;
  cart: CartItem[];
  userMode: 'buyer' | 'seller';
  onBackToListings: () => void;
  onUpdateListing?: () => void | Promise<void>;
  onModeChange: (mode: 'buyer' | 'seller') => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onSellerDashboardClick: () => void;
  onLogoClick?: () => void;
  pendingOrdersCount?: number;
}

const EditListing = ({
  listingId,
  profileData,
  cart,
  userMode,
  onBackToListings,
  onUpdateListing,
  onModeChange,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onSellerDashboardClick,
  onLogoClick,
  pendingOrdersCount = 0,
}: EditListingProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImageURL, setCurrentImageURL] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
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

  const categories = ['Meals', 'Snacks', 'Desserts', 'Drinks', 'Other'];

  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        setError('');
        const listing = await getListing(listingId);

        if (!listing) {
          setError('Listing not found');
          return;
        }

        setName(listing.name);
        setDescription(listing.description);
        setPrice(listing.price.toString());
        setLocation(listing.location);
        setCategory(listing.category);
        setCurrentImageURL(listing.imageURL);
        setImagePreview(listing.imageURL);
        setIsActive(listing.isActive);
        setIsAvailable(listing.isAvailable);
      } catch (err) {
        logger.error('Error loading listing:', err);
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId]);

  const isFormValid =
    name.trim() !== '' &&
    description.trim() !== '' &&
    price !== '' &&
    parseFloat(price) > 0 &&
    (imagePreview !== '' || imageFile !== null) &&
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
    if (!isFormValid || !user) {
      setError('Please fill out all required fields');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      let imageURL = currentImageURL;

      if (imageFile) {
        setUploading(true);
        imageURL = await uploadListingImage(user.uid, imageFile);
        setUploading(false);
      }

      logger.general('[EditListing] Updating listing in Firestore...');
      await updateListing(listingId, {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        imageURL: imageURL,
        location: location,
        category: category,
        isActive: isActive,
        isAvailable: isAvailable,
      });
      logger.general('[EditListing] Listing updated successfully');

      if (onUpdateListing) {
        logger.general('[EditListing] Calling onUpdateListing callback...');
        await onUpdateListing();
        logger.general('[EditListing] onUpdateListing callback complete');
      } else {
        logger.general('[EditListing] No onUpdateListing callback, navigating back');
        onBackToListings();
      }
    } catch (err) {
      logger.error('Error updating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setUpdating(false);
      setUploading(false);
    }
  };

  if (loading) {
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
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">⏳</div>
            <p className="text-xl font-semibold text-white">Loading listing...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            onClick={onBackToListings}
            className="flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Listings
          </button>
        </div>

        <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#CC0000]">Edit Listing</h1>
            <p className="text-[#A0A0A0]">Update your food item details</p>
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
                    <p className="mb-2 text-sm font-semibold text-white">
                      {imageFile ? 'New image selected' : 'Current image'}
                    </p>
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                Listing Visibility
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-base font-semibold transition-all ${
                  isActive
                    ? 'border-blue-600 bg-[#0A1A2A] text-blue-400 hover:bg-[#1A2A3A]'
                    : 'border-[#3A3A3A] bg-[#1E1E1E] text-[#A0A0A0] hover:border-[#4A4A4A]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isActive ? (
                    <>
                      <Eye size={20} />
                      Active - Shows in marketplace
                    </>
                  ) : (
                    <>
                      <EyeOff size={20} />
                      Inactive - Hidden from marketplace
                    </>
                  )}
                </span>
                <span className="text-sm">Click to toggle</span>
              </button>
              <p className="mt-1 text-xs text-[#888888]">
                {isActive
                  ? 'Listing appears in Browse page for buyers'
                  : 'Listing is completely hidden from buyers'}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                Supply Status
              </label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-base font-semibold transition-all ${
                  isAvailable
                    ? 'border-green-600 bg-[#0A2A0A] text-green-500 hover:bg-[#1A3A1A]'
                    : 'border-red-600 bg-[#2A0A0A] text-red-400 hover:bg-[#3A1A1A]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isAvailable ? (
                    <>
                      <CheckCircle size={20} />
                      Available - In stock
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      Unavailable - Sold out
                    </>
                  )}
                </span>
                <span className="text-sm">Click to toggle</span>
              </button>
              <p className="mt-1 text-xs text-[#888888]">
                {isAvailable
                  ? 'Shows "✓ AVAILABLE" badge on listing card'
                  : 'Shows "✕ SOLD OUT" badge on listing card'}
              </p>
            </div>

            <div className="flex gap-3 rounded-xl border-2 border-[#1A3A4A] bg-[#0A1A2A] p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-blue-400" />
              <div>
                <p className="mb-1 text-sm font-semibold text-white">Update Tips</p>
                <ul className="space-y-1 text-sm text-[#90A0C0]">
                  <li>• Update any field to make changes</li>
                  <li>• Active listings appear in Browse, inactive are hidden</li>
                  <li>• Available shows in-stock badge, unavailable shows sold out</li>
                  <li>• You can have active listings that are unavailable (out of stock)</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || updating || uploading}
              className={`w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98 disabled:transform-none disabled:hover:shadow-lg ${
                isFormValid && !updating && !uploading
                  ? 'cursor-pointer bg-[#CC0000]'
                  : 'cursor-not-allowed bg-[#999999]'
              }`}
            >
              {uploading
                ? 'Uploading Image...'
                : updating
                  ? 'Updating Listing...'
                  : isFormValid
                    ? 'Update Listing →'
                    : 'Fill Required Fields'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;
