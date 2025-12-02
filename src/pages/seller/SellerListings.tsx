import {
  ArrowLeft,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  DollarSign,
  MapPin,
  Tag,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import type { ProfileData, CartItem, ListingWithFirebaseId } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { logger } from '../../utils/logger';

interface SellerListingsProps {
  profileData: ProfileData;
  cart: CartItem[];
  listings: ListingWithFirebaseId[];
  userMode: 'buyer' | 'seller';
  onBackToDashboard: () => void;
  onToggleAvailability: (listingId: number) => void | Promise<void>;
  onDeleteListing: (listingId: number | string) => void | Promise<void>;
  onEditListing: (listingId: number | string) => void;
  onModeChange: (mode: 'buyer' | 'seller') => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onSellerDashboardClick: () => void;
  onLogoClick?: () => void;
  pendingOrdersCount?: number;
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
  onLogoClick,
  pendingOrdersCount = 0,
}: SellerListingsProps) => {
  const [activeTab, setActiveTab] = useState<ListingTab>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeListings = listings.filter((l) => l.isAvailable);
  const inactiveListings = listings.filter((l) => !l.isAvailable);

  const displayListings =
    activeTab === 'active'
      ? activeListings
      : activeTab === 'inactive'
        ? inactiveListings
        : listings;

  logger.general(
    '[SellerListings] Rendering with listings:',
    listings.map((l) => ({ id: l.id, name: l.name }))
  );

  const handleDeleteClick = (listing: ListingWithFirebaseId) => {
    const firebaseId = listing.firebaseId;
    logger.general(
      '[SellerListings] Delete button clicked for listing:',
      listing.name,
      'firebaseId:',
      firebaseId
    );
    setDeleteConfirmId(firebaseId);
  };

  const handleConfirmDelete = (listing: ListingWithFirebaseId) => {
    const firebaseId = listing.firebaseId;
    logger.general(
      '[SellerListings] Confirming delete for:',
      listing.name,
      'firebaseId:',
      firebaseId
    );
    onDeleteListing(firebaseId || listing.id);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">My Listings</h1>
          <p className="text-[#A0A0A0]">Manage your food items and availability</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#A0A0A0]">Total Listings</p>
              <Tag size={20} className="text-[#A0A0A0]" />
            </div>
            <p className="text-3xl font-bold text-[#E0E0E0]">{listings.length}</p>
          </div>

          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#A0A0A0]">Active Listings</p>
              <Eye size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{activeListings.length}</p>
          </div>

          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#A0A0A0]">Inactive Listings</p>
              <EyeOff size={20} className="text-[#A0A0A0]" />
            </div>
            <p className="text-3xl font-bold text-[#A0A0A0]">{inactiveListings.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b-2 border-[#3A3A3A]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'all'
                ? '-mb-0.5 border-b-4 border-[#CC0000] text-[#CC0000]'
                : 'text-[#A0A0A0] hover:text-[#E0E0E0]'
            }`}
          >
            All ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'active'
                ? '-mb-0.5 border-b-4 border-[#CC0000] text-[#CC0000]'
                : 'text-[#A0A0A0] hover:text-[#E0E0E0]'
            }`}
          >
            Active ({activeListings.length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'inactive'
                ? '-mb-0.5 border-b-4 border-[#CC0000] text-[#CC0000]'
                : 'text-[#A0A0A0] hover:text-[#E0E0E0]'
            }`}
          >
            Inactive ({inactiveListings.length})
          </button>
        </div>

        {/* Listings Grid */}
        {displayListings.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] py-16 text-center shadow-md">
            <div className="mb-4 text-7xl">📦</div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              {activeTab === 'all'
                ? 'No listings yet'
                : activeTab === 'active'
                  ? 'No active listings'
                  : 'No inactive listings'}
            </h2>
            <p className="mb-6 text-[#A0A0A0]">
              {activeTab === 'all'
                ? 'Create your first listing to start selling!'
                : activeTab === 'active'
                  ? 'Enable some listings to make them active'
                  : 'All your listings are currently active'}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={onBackToDashboard}
                className="transform rounded-xl bg-[#CC0000] px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                Create Listing
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayListings.map((listing) => (
              <div
                key={listing.firebaseId || listing.id}
                className={`overflow-hidden rounded-2xl border-2 bg-[#1E1E1E] shadow-md transition-all hover:shadow-lg ${
                  listing.isAvailable ? 'border-[#3A3A3A]' : 'border-[#3A3A3A] opacity-75'
                }`}
              >
                {/* Listing Image */}
                <div
                  className={`relative ${listing.isAvailable ? 'bg-[#252525]' : 'bg-[#252525]'}`}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={listing.image}
                      alt={listing.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {listing.isAvailable ? (
                      <span className="flex items-center gap-1 rounded-full border-2 border-green-300 bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                        <Eye size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full border-2 border-[#3A3A3A] bg-neutral-700 px-3 py-1 text-xs font-bold text-[#A0A0A0]">
                        <EyeOff size={12} />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Listing Details */}
                <div className="p-4">
                  <h3 className="mb-1 text-lg font-bold text-[#E0E0E0]">{listing.name}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-[#A0A0A0]">{listing.description}</p>

                  {/* Info Grid */}
                  <div className="mb-4 space-y-2 border-b-2 border-[#3A3A3A] pb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-[#CC0000]" />
                      <span className="text-sm font-semibold text-[#E0E0E0]">
                        ${listing.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#888888]" />
                      <span className="text-xs text-[#A0A0A0]">{listing.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-[#888888]" />
                      <span className="text-xs text-[#A0A0A0]">{listing.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#888888]" />
                      <span className="text-xs text-[#A0A0A0]">Posted {listing.datePosted}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {deleteConfirmId === listing.firebaseId ? (
                    <div className="space-y-2">
                      <p className="mb-2 text-sm font-semibold text-white">Delete this listing?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmDelete(listing);
                          }}
                          className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white transition-all hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelDelete();
                          }}
                          className="flex-1 rounded-lg bg-[#3A3A3A] py-2 text-sm font-bold text-gray-300 transition-all hover:bg-[#4A4A4A]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleAvailability(listing.id);
                        }}
                        className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                          listing.isAvailable
                            ? 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]'
                            : 'bg-[#0A2A0A] text-[#88FF88] hover:bg-[#1A3A1A]'
                        }`}
                        title={listing.isAvailable ? 'Disable' : 'Enable'}
                      >
                        {listing.isAvailable ? (
                          <EyeOff size={16} className="mx-auto" />
                        ) : (
                          <Eye size={16} className="mx-auto" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const firebaseId = listing.firebaseId;
                          logger.general(
                            '[SellerListings] Edit button clicked for listing:',
                            listing.name,
                            'firebaseId:',
                            firebaseId
                          );
                          onEditListing(firebaseId || listing.id);
                        }}
                        className="rounded-lg bg-[#0A1A2A] py-2 text-sm font-semibold text-[#88CCFF] transition-all hover:bg-[#1A2A3A]"
                        title="Edit"
                      >
                        <Edit size={16} className="mx-auto" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          logger.general(
                            '[SellerListings] Delete button onClick fired, listing.id:',
                            listing.id
                          );
                          handleDeleteClick(listing);
                        }}
                        className="rounded-lg bg-[#2A0A0A] py-2 text-sm font-semibold text-[#FF8888] transition-all hover:bg-[#3A1A1A]"
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
