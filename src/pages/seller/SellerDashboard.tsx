import {
  Package,
  DollarSign,
  Clock,
  Plus,
  List,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import type { ProfileData, CartItem, Order, ListingWithFirebaseId } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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
  const activeListings = listings.filter((l) => l.isAvailable).length;
  const pendingOrders = incomingOrders.filter((o) => o.status === 'pending').length;
  const totalEarnings = incomingOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);

  const recentOrders = incomingOrders.slice(0, 5);

  const hasPaymentInfo = Boolean(
    profileData.sellerInfo?.paymentMethods?.cashApp ||
    profileData.sellerInfo?.paymentMethods?.venmo ||
    profileData.sellerInfo?.paymentMethods?.zelle
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#2A2A0A] text-[#FFD700] border-[#4A4A1A]';
      case 'confirmed':
        return 'bg-[#0A1A2A] text-[#88CCFF] border-[#1A3A4A]';
      case 'ready':
        return 'bg-[#1A0A2A] text-[#CC88FF] border-[#3A1A4A]';
      case 'completed':
        return 'bg-[#0A2A0A] text-[#88FF88] border-[#1A4A1A]';
      case 'cancelled':
        return 'bg-[#2A0A0A] text-[#FF8888] border-[#4A1A1A]';
      default:
        return 'bg-[#252525] text-[#B0B0B0] border-[#3A3A3A]';
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
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[#E0E0E0]">Seller Dashboard</h1>
          <p className="text-[#A0A0A0]">Manage your food listings and incoming orders</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-[#0A1A2A] p-3">
                <Package size={24} className="text-[#88CCFF]" />
              </div>
              <TrendingUp size={20} className="text-[#88FF88]" />
            </div>
            <p className="mb-1 text-sm font-semibold text-[#A0A0A0]">Active Listings</p>
            <p className="text-3xl font-bold text-[#E0E0E0]">{activeListings}</p>
            <p className="mt-2 text-xs text-[#888888]">Total: {listings.length} listings</p>
          </div>

          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-[#2A2A0A] p-3">
                <Clock size={24} className="text-[#FFD700]" />
              </div>
              {pendingOrders > 0 && (
                <span className="rounded-full border-2 border-[#4A4A1A] bg-[#2A2A0A] px-2 py-1 text-xs font-bold text-[#FFD700]">
                  Action Needed
                </span>
              )}
            </div>
            <p className="mb-1 text-sm font-semibold text-[#A0A0A0]">Pending Orders</p>
            <p className="text-3xl font-bold text-[#E0E0E0]">{pendingOrders}</p>
            <p className="mt-2 text-xs text-[#888888]">Total: {incomingOrders.length} orders</p>
          </div>

          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-[#0A2A0A] p-3">
                <DollarSign size={24} className="text-[#88FF88]" />
              </div>
              <TrendingUp size={20} className="text-[#88FF88]" />
            </div>
            <p className="mb-1 text-sm font-semibold text-[#A0A0A0]">Total Earnings</p>
            <p className="text-3xl font-bold text-[#E0E0E0]">${totalEarnings.toFixed(2)}</p>
            <p className="mt-2 text-xs text-[#888888]">Completed orders only</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={onCreateListing}
            className="flex transform items-center gap-3 rounded-2xl bg-[#CC0000] p-6 text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl"
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
            onClick={onViewListings}
            className="flex items-center gap-3 rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md transition-all hover:shadow-lg"
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
            onClick={onViewOrders}
            className="flex items-center gap-3 rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md transition-all hover:shadow-lg"
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

        <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-[#E0E0E0]">Recent Orders</h2>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">📦</div>
              <h3 className="mb-2 text-xl font-bold text-[#E0E0E0]">No orders yet</h3>
              <p className="mb-6 text-[#A0A0A0]">Start by creating your first listing!</p>
              <button
                onClick={onCreateListing}
                className="rounded-xl bg-[#CC0000] px-6 py-3 font-bold text-white transition-all hover:shadow-lg"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-[#3A3A3A] bg-[#252525] p-4 transition-all hover:bg-[#2A2A2A]"
                  onClick={onViewOrders}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div
                          key={index}
                          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#3A3A3A] bg-[#1E1E1E]"
                        >
                          {item.image.startsWith('http') ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">{item.image}</span>
                          )}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#3A3A3A] bg-[#252525]">
                          <span className="text-xs font-bold text-[#B0B0B0]">
                            +{order.items.length - 2}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#E0E0E0]">Order #{order.id}</p>
                      <p className="text-sm text-[#A0A0A0]">
                        {order.buyerName || 'Anonymous'} · {order.pickupTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full border-2 px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="text-lg font-bold text-[#CC0000]">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                onClick={onProfileClick}
                className="rounded-lg bg-[#CC0000] px-4 py-2 font-bold text-white transition-all hover:bg-[#AA0000] hover:shadow-lg"
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
