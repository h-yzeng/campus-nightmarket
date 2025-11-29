import {
  Clock,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
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
  onLogoClick?: () => void;
  loading?: boolean;
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
  onModeChange,
  onLogoClick,
  loading = false,
}: UserOrdersProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('pending');

  // Pending includes: pending, confirmed, and ready (all active statuses from buyer's perspective)
  const pendingOrders = orders.filter(
    (order) =>
      order.status === 'pending' || order.status === 'confirmed' || order.status === 'ready'
  );
  const completedOrders = orders.filter(
    (order) => order.status === 'completed' || order.status === 'cancelled'
  );

  const displayOrders = activeTab === 'pending' ? pendingOrders : completedOrders;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'ready':
        return <Package size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      <Header
        cartItems={cart}
        profileData={profileData}
        onCartClick={onCartClick}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onOrdersClick={onOrdersClick}
        onSellerDashboardClick={onSellerDashboardClick}
        onModeChange={onModeChange}
        onLogoClick={onLogoClick}
        showCart={true}
        userMode={userMode}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onBackToBrowse}
            className="flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Browse
          </button>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">My Orders</h1>
          <p className="text-[#A0A0A0]">Track and manage your food orders</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b-2 border-[#3A3A3A]">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'pending'
                ? '-mb-0.5 border-b-4 border-[#CC0000] text-[#CC0000]'
                : 'text-[#A0A0A0] hover:text-[#E0E0E0]'
            }`}
          >
            Pending ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'completed'
                ? '-mb-0.5 border-b-4 border-[#CC0000] text-[#CC0000]'
                : 'text-[#A0A0A0] hover:text-[#E0E0E0]'
            }`}
          >
            Completed ({completedOrders.length})
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={48} className="mb-4 animate-spin text-[#CC0000]" />
            <p className="text-lg text-[#A0A0A0]">Loading your orders...</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] py-16 text-center shadow-md">
            <div className="mb-4 text-7xl">{activeTab === 'pending' ? '📦' : '✅'}</div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              {activeTab === 'pending' ? 'No pending orders' : 'No completed orders yet'}
            </h2>
            <p className="mb-6 text-[#A0A0A0]">
              {activeTab === 'pending'
                ? 'Start browsing to place your first order!'
                : 'Your completed orders will appear here'}
            </p>
            <button
              onClick={onBackToBrowse}
              className="transform rounded-xl bg-[#CC0000] px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
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
                className="cursor-pointer rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md transition-all hover:border-neutral-600 hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-bold text-[#E0E0E0]">Order #{order.id}</h3>
                      <span
                        className={`flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-[#A0A0A0]">Ordered on {order.orderDate}</p>
                  </div>
                  <ChevronRight size={24} className="text-[#A0A0A0]" />
                </div>

                {/* Order Items Preview */}
                <div className="mb-4 flex items-center gap-3 border-b-2 border-[#3A3A3A] pb-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#3A3A3A] bg-[#252525]"
                      >
                        {item.image.startsWith('http') ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">{item.image}</span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#3A3A3A] bg-[#3A3A3A]">
                        <span className="text-xs font-bold text-gray-700">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[#E0E0E0]">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-sm text-[#A0A0A0]">from {order.sellerName.split(' ')[0]}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#888888]" />
                    <div>
                      <p className="text-xs text-[#888888]">Pickup Time</p>
                      <p className="text-sm font-semibold text-[#E0E0E0]">{order.pickupTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#888888]" />
                    <div>
                      <p className="text-xs text-[#888888]">Location</p>
                      <p className="text-sm font-semibold text-[#E0E0E0]">{order.sellerLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[#888888]" />
                    <div>
                      <p className="text-xs text-[#888888]">Total</p>
                      <p className="text-sm font-bold text-[#CC0000]">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-4 border-t-2 border-[#3A3A3A] pt-4">
                  <p className="mb-1 text-xs text-[#888888]">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {order.paymentMethod === 'Cash'
                        ? '💵'
                        : order.paymentMethod === 'CashApp'
                          ? '💸'
                          : order.paymentMethod === 'Venmo'
                            ? '💳'
                            : '🏦'}
                    </span>
                    <span className="text-sm font-semibold text-[#E0E0E0]">
                      {order.paymentMethod}
                    </span>
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
