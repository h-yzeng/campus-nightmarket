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
  onSellerDashboardClick
}: SellerDashboardProps) => {
  const activeListings = listings.filter(l => l.isAvailable).length;
  const pendingOrders = incomingOrders.filter(o => o.status === 'pending').length;
  const totalEarnings = incomingOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);

  const recentOrders = incomingOrders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
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

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your food listings and incoming orders</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <Package size={24} className="text-blue-600" />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Active Listings</p>
            <p className="text-3xl font-bold text-gray-900">{activeListings}</p>
            <p className="text-xs text-gray-500 mt-2">Total: {listings.length} listings</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-50">
                <Clock size={24} className="text-yellow-600" />
              </div>
              {pendingOrders > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                  Action Needed
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
            <p className="text-xs text-gray-500 mt-2">Total: {incomingOrders.length} orders</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-50">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Completed orders only</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={onCreateListing}
            className="flex items-center gap-3 p-6 bg-[#CC0000] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102"
          >
            <div className="p-3 rounded-xl bg-white bg-opacity-20">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Create Listing</p>
              <p className="text-sm opacity-90">Post a new food item</p>
            </div>
          </button>

          <button
            onClick={onViewListings}
            className="flex items-center gap-3 p-6 bg-white rounded-2xl shadow-md border-2 border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="p-3 rounded-xl bg-blue-50">
              <List size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg text-gray-900">My Listings</p>
              <p className="text-sm text-gray-600">Manage your menu</p>
            </div>
          </button>

          <button
            onClick={onViewOrders}
            className="flex items-center gap-3 p-6 bg-white rounded-2xl shadow-md border-2 border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="p-3 rounded-xl bg-yellow-50">
              <ShoppingBag size={24} className="text-yellow-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg text-gray-900">Incoming Orders</p>
              <p className="text-sm text-gray-600">View & manage orders</p>
            </div>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">
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
                  className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={onViewOrders}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center"
                        >
                          <span className="text-lg">{item.image}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-700">
                            +{order.items.length - 2}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-600">
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

        {/* Tips Section */}
        {!profileData.sellerInfo?.paymentMethods.cashApp && 
         !profileData.sellerInfo?.paymentMethods.venmo && 
         !profileData.sellerInfo?.paymentMethods.zelle && (
          <div className="mt-8 flex gap-3 p-6 rounded-2xl bg-orange-50 border-2 border-orange-200">
            <AlertCircle size={24} className="text-orange-600 shrink-0" />
            <div>
              <p className="text-lg font-bold text-gray-900 mb-2">Complete Your Seller Profile</p>
              <p className="text-sm text-gray-700 mb-4">
                Add your payment information to make it easier for buyers to pay you. Go to your profile settings to add CashApp, Venmo, or Zelle details.
              </p>
              <button
                onClick={onProfileClick}
                className="px-4 py-2 bg-[#CC0000] text-white font-bold rounded-lg hover:shadow-lg transition-all"
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