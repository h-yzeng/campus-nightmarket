import { ArrowLeft, Eye, EyeOff, Edit, Trash2, DollarSign, MapPin, Tag, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { ProfileData, CartItem, Listing } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface SellerListingsProps {
  profileData: ProfileData;
  cart: CartItem[];
  listings: Listing[];
  userMode: 'buyer' | 'seller';
  onBackToDashboard: () => void;
  onToggleAvailability: (listingId: number) => void;
  onDeleteListing: (listingId: number) => void;
  onEditListing: (listingId: number) => void;
  onModeChange: (mode: 'buyer' | 'seller') => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onSellerDashboardClick: () => void;
  onLogoClick?: () => void;
}

type ListingTab = 'all' | 'active' | 'inactive';

const SellerListings = ({
  profileData,
  cart,
  listings,
  userMode,
  onBackToDashboard,
  onToggleAvailability,
  onDeleteListing,
  onEditListing,
  onModeChange,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onSellerDashboardClick,
  onLogoClick
}: SellerListingsProps) => {
  const [activeTab, setActiveTab] = useState<ListingTab>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const activeListings = listings.filter(l => l.isAvailable);
  const inactiveListings = listings.filter(l => !l.isAvailable);

  const displayListings = 
    activeTab === 'active' ? activeListings :
    activeTab === 'inactive' ? inactiveListings :
    listings;

  const handleDeleteClick = (listingId: number) => {
    setDeleteConfirmId(listingId);
  };

  const handleConfirmDelete = (listingId: number) => {
    onDeleteListing(listingId);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
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
        onLogoClick={onLogoClick}
        showCart={true}
      />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onBackToDashboard}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
          <p className="text-gray-600">Manage your food items and availability</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600">Total Listings</p>
              <Tag size={20} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600">Active Listings</p>
              <Eye size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{activeListings.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600">Inactive Listings</p>
              <EyeOff size={20} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-400">{inactiveListings.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'all'
                ? 'text-[#CC0000] border-b-4 border-[#CC0000] -mb-0.5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'active'
                ? 'text-[#CC0000] border-b-4 border-[#CC0000] -mb-0.5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({activeListings.length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'inactive'
                ? 'text-[#CC0000] border-b-4 border-[#CC0000] -mb-0.5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inactive ({inactiveListings.length})
          </button>
        </div>

        {/* Listings Grid */}
        {displayListings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border-2 border-gray-100">
            <div className="text-7xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'all' 
                ? 'No listings yet' 
                : activeTab === 'active'
                ? 'No active listings'
                : 'No inactive listings'}
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? 'Create your first listing to start selling!' 
                : activeTab === 'active'
                ? 'Enable some listings to make them active'
                : 'All your listings are currently active'}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={onBackToDashboard}
                className="px-8 py-3 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 bg-[#CC0000]"
              >
                Create Listing
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayListings.map((listing) => (
              <div
                key={listing.id}
                className={`bg-white rounded-2xl shadow-md border-2 overflow-hidden transition-all hover:shadow-lg ${
                  listing.isAvailable ? 'border-gray-100' : 'border-gray-300 opacity-75'
                }`}
              >
                {/* Listing Image/Emoji */}
                <div className={`relative p-6 pb-4 ${listing.isAvailable ? 'bg-[#FAFAFA]' : 'bg-gray-100'}`}>
                  <div className="text-7xl text-center mb-2">{listing.image}</div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {listing.isAvailable ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border-2 border-green-300 flex items-center gap-1">
                        <Eye size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border-2 border-gray-300 flex items-center gap-1">
                        <EyeOff size={12} />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Listing Details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-gray-900">
                    {listing.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Info Grid */}
                  <div className="space-y-2 mb-4 pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-[#CC0000]" />
                      <span className="text-sm font-semibold text-gray-900">${listing.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-600">{listing.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-600">{listing.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-600">Posted {listing.datePosted}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {deleteConfirmId === listing.id ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Delete this listing?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmDelete(listing.id)}
                          className="flex-1 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all"
                        >
                          Delete
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => onToggleAvailability(listing.id)}
                        className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                          listing.isAvailable
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={listing.isAvailable ? 'Disable' : 'Enable'}
                      >
                        {listing.isAvailable ? <EyeOff size={16} className="mx-auto" /> : <Eye size={16} className="mx-auto" />}
                      </button>
                      
                      <button
                        onClick={() => onEditListing(listing.id)}
                        className="py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-all"
                        title="Edit"
                      >
                        <Edit size={16} className="mx-auto" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(listing.id)}
                        className="py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} className="mx-auto" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SellerListings;