import { Package, DollarSign, Clock, Plus, List, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';
import type { ProfileData, CartItem, Order, Listing } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface SellerDashboardProps {
  profileData: ProfileData;
  cart: CartItem[];
  listings: Listing[];
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
  onLogoClick
}: SellerDashboardProps) => {
  const activeListings = listings.filter(l => l.isAvailable).length;
  const pendingOrders = incomingOrders.filter(o => o.status === 'pending').length;
  const totalEarnings = incomingOrders
    .filter(o => o.status === 'completed')
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

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E0E0E0] mb-2">Seller Dashboard</h1>
          <p className="text-[#A0A0A0]">Manage your food listings and incoming orders</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1E1E1E] rounded-2xl shadow-md border-2 border-[#3A3A3A] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-[#0A1A2A]">
                <Package size={24} className="text-[#88CCFF]" />
              </div>
              <TrendingUp size={20} className="text-[#88FF88]" />
            </div>
            <p className="text-sm font-semibold text-[#A0A0A0] mb-1">Active Listings</p>
            <p className="text-3xl font-bold text-[#E0E0E0]">{activeListings}</p>
            <p className="text-xs text-[#888888] mt-2">Total: {listings.length} listings</p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl shadow-md border-2 border-[#3A3A3A] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-[#2A2A0A]">
                <Clock size={24} className="text-[#FFD700]" />
              </div>
              {pendingOrders > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#2A2A0A] text-[#FFD700] border-2 border-[#4A4A1A]">
                  Action Needed
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-[#A0A0A0] mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-[#E0E0E0]">{pendingOrders}</p>
            <p className="text-xs text-[#888888] mt-2">Total: {incomingOrders.length} orders</p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl shadow-md border-2 border-[#3A3A3A] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-[#0A2A0A]">
                <DollarSign size={24} className="text-[#88FF88]" />
              </div>
              <TrendingUp size={20} className="text-[#88FF88]" />
            </div>
            <p className="text-sm font-semibold text-[#A0A0A0] mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-[#E0E0E0]">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-[#888888] mt-2">Completed orders only</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={onCreateListing}
            className="flex items-center gap-3 p-6 bg-[#CC0000] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102"
          >
            <div className="p-3 rounded-xl bg-[#1E1E1E] bg-opacity-50">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Create Listing</p>
              <p className="text-sm opacity-90">Post a new food item</p>
            </div>
          </button>

          <button
            onClick={onViewListings}
            className="flex items-center gap-3 p-6 bg-[#1E1E1E] rounded-2xl shadow-md border-2 border-[#3A3A3A] hover:shadow-lg transition-all"
          >
            <div className="p-3 rounded-xl bg-[#0A1A2A]">
              <List size={24} className="text-[#88CCFF]" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg text-[#E0E0E0]">My Listings</p>
              <p className="text-sm text-[#A0A0A0]">Manage your menu</p>
            </div>
          </button>

          <button
            onClick={onViewOrders}
            className="flex items-center gap-3 p-6 bg-[#1E1E1E] rounded-2xl shadow-md border-2 border-[#3A3A3A] hover:shadow-lg transition-all"
          >
            <div className="p-3 rounded-xl bg-[#2A2A0A]">
              <ShoppingBag size={24} className="text-[#FFD700]" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg text-[#E0E0E0]">Incoming Orders</p>
              <p className="text-sm text-[#A0A0A0]">View & manage orders</p>
            </div>
          </button>
        </div>

        <div className="bg-[#1E1E1E] rounded-2xl shadow-md border-2 border-[#3A3A3A] p-6">
          <h2 className="text-xl font-bold text-[#E0E0E0] mb-4">Recent Orders</h2>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-[#E0E0E0] mb-2">No orders yet</h3>
              <p className="text-[#A0A0A0] mb-6">
                Start by creating your first listing!
              </p>
              <button
                onClick={onCreateListing}
                className="px-6 py-3 bg-[#CC0000] text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-[#252525] rounded-xl hover:bg-[#2A2A2A] transition-all cursor-pointer border-2 border-[#3A3A3A]"
                  onClick={onViewOrders}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 rounded-full bg-[#1E1E1E] border-2 border-[#3A3A3A] flex items-center justify-center overflow-hidden"
                        >
                          {item.image.startsWith('http') ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">{item.image}</span>
                          )}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="w-10 h-10 rounded-full bg-[#252525] border-2 border-[#3A3A3A] flex items-center justify-center">
                          <span className="text-xs font-bold text-[#B0B0B0]">
                            +{order.items.length - 2}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#E0E0E0]">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-[#A0A0A0]">
                        {order.buyerName || 'Anonymous'} · {order.pickupTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="font-bold text-[#CC0000] text-lg">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!hasPaymentInfo && (
          <div className="mt-8 flex gap-3 p-6 rounded-2xl bg-[#2A1A0A] border-2 border-[#4A3A1A]">
            <AlertCircle size={24} className="text-[#FFB088] shrink-0" />
            <div>
              <p className="text-lg font-bold text-[#E0E0E0] mb-2">Complete Your Seller Profile</p>
              <p className="text-sm text-[#D0B0A0] mb-4">
                Add your payment information to make it easier for buyers to pay you. Go to your profile settings to add CashApp, Venmo, or Zelle details.
              </p>
              <button
                onClick={onProfileClick}
                className="px-4 py-2 bg-[#CC0000] text-white font-bold rounded-lg hover:bg-[#AA0000] hover:shadow-lg transition-all"
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