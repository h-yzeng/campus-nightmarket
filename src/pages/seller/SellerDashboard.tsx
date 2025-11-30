import { Plus, List, ShoppingBag, AlertCircle } from 'lucide-react';
import type { ProfileData, CartItem, Order, ListingWithFirebaseId } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentOrdersList from '../../components/dashboard/RecentOrdersList';

interface SellerDashboardProps {
  profileData: ProfileData;
  cart: CartItem[];
  listings: ListingWithFirebaseId[];
  incomingOrders: Order[];
  userMode: 'buyer' | 'seller';
  onModeChange: (mode: 'buyer' | 'seller') => void;
  onCreateListing: () => void;
  onViewListings: () => void;
  onViewOrders: () => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onSellerDashboardClick: () => void;
  onLogoClick?: () => void;
}

const SellerDashboard = ({
  profileData,
  cart,
  listings,
  incomingOrders,
  userMode,
  onModeChange,
  onCreateListing,
  onViewListings,
  onViewOrders,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onSellerDashboardClick,
  onLogoClick,
}: SellerDashboardProps) => {
  const recentOrders = incomingOrders.slice(0, 5);

  const hasPaymentInfo = Boolean(
    profileData.sellerInfo?.paymentMethods?.cashApp ||
    profileData.sellerInfo?.paymentMethods?.venmo ||
    profileData.sellerInfo?.paymentMethods?.zelle
  );

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
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[#E0E0E0]">Seller Dashboard</h1>
          <p className="text-[#A0A0A0]">Manage your food listings and incoming orders</p>
        </div>

        <DashboardStats listings={listings} incomingOrders={incomingOrders} />

        {/* Action Buttons */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={onCreateListing}
            className="flex transform items-center gap-3 rounded-2xl bg-[#CC0000] p-6 text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl"
            aria-label="Create a new listing"
          >
            <div className="bg-opacity-50 rounded-xl bg-[#1E1E1E] p-3">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold">Create Listing</p>
              <p className="text-sm opacity-90">Post a new food item</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onViewListings}
            className="flex items-center gap-3 rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md transition-all hover:shadow-lg"
            aria-label="View and manage your listings"
          >
            <div className="rounded-xl bg-[#0A1A2A] p-3">
              <List size={24} className="text-[#88CCFF]" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-[#E0E0E0]">My Listings</p>
              <p className="text-sm text-[#A0A0A0]">Manage your menu</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onViewOrders}
            className="flex items-center gap-3 rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md transition-all hover:shadow-lg"
            aria-label="View and manage incoming orders"
          >
            <div className="rounded-xl bg-[#2A2A0A] p-3">
              <ShoppingBag size={24} className="text-[#FFD700]" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-[#E0E0E0]">Incoming Orders</p>
              <p className="text-sm text-[#A0A0A0]">View & manage orders</p>
            </div>
          </button>
        </div>

        <RecentOrdersList
          recentOrders={recentOrders}
          onViewOrders={onViewOrders}
          onCreateListing={onCreateListing}
        />

        {/* Payment Info Alert */}
        {!hasPaymentInfo && (
          <div className="mt-8 flex gap-3 rounded-2xl border-2 border-[#4A3A1A] bg-[#2A1A0A] p-6">
            <AlertCircle size={24} className="shrink-0 text-[#FFB088]" />
            <div>
              <p className="mb-2 text-lg font-bold text-[#E0E0E0]">Complete Your Seller Profile</p>
              <p className="mb-4 text-sm text-[#D0B0A0]">
                Add your payment information to make it easier for buyers to pay you. Go to your
                profile settings to add CashApp, Venmo, or Zelle details.
              </p>
              <button
                type="button"
                onClick={onProfileClick}
                className="rounded-lg bg-[#CC0000] px-4 py-2 font-bold text-white transition-all hover:bg-[#AA0000] hover:shadow-lg"
                aria-label="Update your seller profile"
              >
                Update Profile
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
