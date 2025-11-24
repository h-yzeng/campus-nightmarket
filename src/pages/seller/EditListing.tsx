import { ArrowLeft, DollarSign, MapPin, Tag, AlertCircle, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { ProfileData, CartItem } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { uploadListingImage } from '../../services/storage/imageService';
import { getListing, updateListing } from '../../services/listings/listingService';
import { useAuth } from '../../hooks/userAuth';

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
  onLogoClick
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
      } catch (err) {
        console.error('Error loading listing:', err);
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

      console.log('[EditListing] Updating listing in Firestore...');
      await updateListing(listingId, {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        imageURL: imageURL,
        location: location,
        category: category,
      });
      console.log('[EditListing] Listing updated successfully');

      if (onUpdateListing) {
        console.log('[EditListing] Calling onUpdateListing callback...');
        await onUpdateListing();
        console.log('[EditListing] onUpdateListing callback complete');
      } else {
        console.log('[EditListing] No onUpdateListing callback, navigating back');
        onBackToListings();
      }
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setUpdating(false);
      setUploading(false);
    }
  };

  if (loading) {
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
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl font-semibold text-white">Loading listing...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            onClick={onBackToListings}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Listings
          </button>
        </div>

        <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border-2 border-[#3A3A3A] p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#CC0000] mb-2">Edit Listing</h1>
            <p className="text-[#A0A0A0]">Update your food item details</p>
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
                    <p className="text-sm font-semibold text-white mb-2">
                      {imageFile ? 'New image selected' : 'Current image'}
                    </p>
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
                <p className="text-sm font-semibold text-white mb-1">Update Tips</p>
                <ul className="text-sm text-[#90A0C0] space-y-1">
                  <li>• Update any field to make changes</li>
                  <li>• Keep the current image or upload a new one</li>
                  <li>• Price changes will be reflected immediately</li>
                  <li>• All fields are required</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || updating || uploading}
              className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 disabled:transform-none disabled:hover:shadow-lg ${
                isFormValid && !updating && !uploading ? 'bg-[#CC0000] cursor-pointer' : 'bg-[#999999] cursor-not-allowed'
              }`}
            >
              {uploading ? 'Uploading Image...' : updating ? 'Updating Listing...' : isFormValid ? 'Update Listing →' : 'Fill Required Fields'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;
