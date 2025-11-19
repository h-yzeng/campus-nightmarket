import { Clock, MapPin, Package, CheckCircle, XCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { UserMode, Order, ProfileData, CartItem } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface UserOrdersProps {
  orders: Order[];
  profileData: ProfileData;
  cart: CartItem[];
  userMode: UserMode;
  onViewOrderDetails: (orderId: number) => void;
  onBackToBrowse: () => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick?: () => void;
  onSellerDashboardClick?: () => void;
  onModeChange?: (mode: UserMode) => void;
}

type OrderTab = 'pending' | 'completed';

const UserOrders = ({
  orders,
  profileData,
  cart,
  userMode,
  onViewOrderDetails,
  onBackToBrowse,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onSellerDashboardClick,
  onModeChange
}: UserOrdersProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('pending');

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const completedOrders = orders.filter(order => order.status === 'completed' || order.status === 'cancelled');

  const displayOrders = activeTab === 'pending' ? pendingOrders : completedOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        cartItems={cart} 
        profileData={profileData} 
        onCartClick={onCartClick}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onOrdersClick={onOrdersClick}
        onSellerDashboardClick={onSellerDashboardClick}
        onModeChange={onModeChange}
        showCart={true}
        userMode={userMode}
      />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onBackToBrowse}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Browse
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your food orders</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'pending'
                ? 'text-[#CC0000] border-b-4 border-[#CC0000] -mb-0.5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'completed'
                ? 'text-[#CC0000] border-b-4 border-[#CC0000] -mb-0.5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({completedOrders.length})
          </button>
        </div>

        {/* Orders List */}
        {displayOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border-2 border-gray-100">
            <div className="text-7xl mb-4">
              {activeTab === 'pending' ? '📦' : '✅'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'pending' ? 'No pending orders' : 'No completed orders yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'pending' 
                ? 'Start browsing to place your first order!' 
                : 'Your completed orders will appear here'}
            </p>
            <button
              onClick={onBackToBrowse}
              className="px-8 py-3 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 bg-[#CC0000]"
            >
              Browse Food
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onViewOrderDetails(order.id)}
                className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-xl hover:border-gray-300 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ordered on {order.orderDate}
                    </p>
                  </div>
                  <ChevronRight size={24} className="text-gray-400" />
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-200">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-full bg-[#FAFAFA] border-2 border-white flex items-center justify-center"
                      >
                        <span className="text-xl">{item.image}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-sm text-gray-600">
                      from {order.sellerName.split(' ')[0]}
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Pickup Time</p>
                      <p className="text-sm font-semibold text-gray-900">{order.pickupTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-semibold text-gray-900">{order.sellerLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-bold text-[#CC0000]">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {order.paymentMethod === 'Cash' ? '💵' : 
                       order.paymentMethod === 'CashApp' ? '💸' : 
                       order.paymentMethod === 'Venmo' ? '💳' : '🏦'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{order.paymentMethod}</span>
                  </div>
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

export default UserOrders;