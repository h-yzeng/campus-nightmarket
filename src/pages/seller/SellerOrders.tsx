import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import type { ProfileData, CartItem, Order, Review } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface SellerOrdersProps {
  profileData: ProfileData;
  cart: CartItem[];
  incomingOrders: Order[];
  orderReviews: Record<string, Review>;
  userMode: 'buyer' | 'seller';
  onBackToDashboard: () => void;
  onUpdateOrderStatus: (orderId: number, status: Order['status']) => void;
  onModeChange: (mode: 'buyer' | 'seller') => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onSellerDashboardClick: () => void;
  onLogoClick?: () => void;
  loading?: boolean;
}

type OrderTab = 'active' | 'completed';

const SellerOrders = ({
  profileData,
  cart,
  incomingOrders,
  orderReviews,
  userMode,
  onBackToDashboard,
  onUpdateOrderStatus,
  onModeChange,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onSellerDashboardClick,
  onLogoClick,
  loading = false,
}: SellerOrdersProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('active');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const pendingOrders = incomingOrders.filter((order) => order.status === 'pending');
  const activeOrders = incomingOrders.filter(
    (order) =>
      order.status === 'pending' || order.status === 'confirmed' || order.status === 'ready'
  );
  const completedOrders = incomingOrders.filter(
    (order) => order.status === 'completed' || order.status === 'cancelled'
  );

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

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

  const toggleOrderExpanded = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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
          <h1 className="mb-2 text-3xl font-bold text-white">Incoming Orders</h1>
          <p className="text-[#A0A0A0]">Manage and fulfill customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#A0A0A0]">Total Orders</p>
              <Package size={20} className="text-[#A0A0A0]" />
            </div>
            <p className="text-3xl font-bold text-[#E0E0E0]">{incomingOrders.length}</p>
          </div>

          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#A0A0A0]">Pending Orders</p>
              <Clock size={20} className="text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
            {pendingOrders.length > 0 && (
              <p className="mt-2 text-xs font-semibold text-yellow-600">Action needed!</p>
            )}
          </div>

          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#A0A0A0]">Completed Orders</p>
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b-2 border-[#3A3A3A]">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'active'
                ? '-mb-0.5 border-b-4 border-[#CC0000] text-[#CC0000]'
                : 'text-[#A0A0A0] hover:text-[#E0E0E0]'
            }`}
          >
            Active ({activeOrders.length})
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
            <p className="text-lg text-[#A0A0A0]">Loading orders...</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] py-16 text-center shadow-md">
            <div className="mb-4 text-7xl">{activeTab === 'active' ? '📦' : '✅'}</div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              {activeTab === 'active' ? 'No active orders' : 'No completed orders yet'}
            </h2>
            <p className="mb-6 text-[#A0A0A0]">
              {activeTab === 'active'
                ? 'New orders will appear here when customers place them'
                : 'Completed orders will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] shadow-md transition-all hover:shadow-lg"
                >
                  {/* Order Header */}
                  <div
                    className="cursor-pointer p-6 transition-colors hover:bg-[#0A0A0B]"
                    onClick={() => toggleOrderExpanded(order.id)}
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
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#CC0000]">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-[#888888]">{order.items.length} items</p>
                      </div>
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
                            <span className="text-xs font-bold text-[#90A0C0]">
                              +{order.items.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#E0E0E0]">
                          {order.items.map((item) => item.name).join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-[#888888]" />
                        <div>
                          <p className="text-xs text-[#888888]">Customer</p>
                          <p className="text-sm font-semibold text-[#E0E0E0]">
                            {order.buyerName || 'Anonymous'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-[#888888]" />
                        <div>
                          <p className="text-xs text-[#888888]">Pickup Time</p>
                          <p className="text-sm font-semibold text-[#E0E0E0]">{order.pickupTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-[#888888]" />
                        <div>
                          <p className="text-xs text-[#888888]">Payment</p>
                          <p className="text-sm font-semibold text-[#E0E0E0]">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <div className="mt-4 text-center">
                      <button className="text-sm font-semibold text-[#CC0000]">
                        {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <div className="border-t-2 border-[#3A3A3A] bg-[#252525] p-6 pt-0">
                      {/* Order Items List */}
                      <div className="mb-6">
                        <h4 className="mb-3 text-lg font-bold text-white">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-xl bg-[#1E1E1E] p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-[#3A3A3A] bg-[#252525]">
                                  {item.image.startsWith('http') ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      loading="lazy"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-2xl">{item.image}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#E0E0E0]">{item.name}</p>
                                  <p className="text-sm text-[#A0A0A0]">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold text-[#CC0000]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="mb-6">
                        <h4 className="mb-3 text-lg font-bold text-white">Customer Information</h4>
                        <div className="space-y-3 rounded-xl bg-[#1E1E1E] p-4">
                          <div className="flex items-center gap-3">
                            <User size={18} className="text-[#CC0000]" />
                            <div>
                              <p className="text-xs text-[#888888]">Name</p>
                              <p className="text-sm font-semibold text-[#E0E0E0]">
                                {order.buyerName || 'Not provided'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-[#CC0000]" />
                            <div>
                              <p className="text-xs text-[#888888]">Pickup Location</p>
                              <p className="text-sm font-semibold text-[#E0E0E0]">
                                {order.sellerLocation}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock size={18} className="text-[#CC0000]" />
                            <div>
                              <p className="text-xs text-[#888888]">Pickup Time</p>
                              <p className="text-sm font-semibold text-[#E0E0E0]">
                                {order.pickupTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {order.notes && (
                        <div className="mb-6">
                          <h4 className="mb-3 text-lg font-bold text-white">
                            Special Instructions
                          </h4>
                          <div className="rounded-xl border-2 border-blue-800 bg-blue-950 p-4">
                            <p className="text-sm text-[#E0E0E0]">{order.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Payment Information */}
                      <div className="mb-6">
                        <h4 className="mb-3 text-lg font-bold text-white">Payment Information</h4>
                        <div className="rounded-xl bg-[#1E1E1E] p-4">
                          <div className="mb-2 flex items-center gap-3">
                            <span className="text-2xl">
                              {order.paymentMethod === 'Cash'
                                ? '💵'
                                : order.paymentMethod === 'CashApp'
                                  ? '💸'
                                  : order.paymentMethod === 'Venmo'
                                    ? '💳'
                                    : '🏦'}
                            </span>
                            <div>
                              <p className="text-xs text-[#888888]">Payment Method</p>
                              <p className="text-sm font-bold text-[#E0E0E0]">
                                {order.paymentMethod}
                              </p>
                            </div>
                          </div>
                          {order.paymentMethod !== 'Cash' && (
                            <div className="mt-3 rounded-lg border border-[#1A3A4A] bg-[#0A1A2A] p-3">
                              <p className="text-xs text-[#90A0C0]">
                                💡 Share your {order.paymentMethod} details with the customer for
                                payment
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Actions */}
                      {order.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-base font-bold text-white transition-all hover:bg-blue-700"
                          >
                            <CheckCircle size={20} />
                            Confirm Order
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-base font-bold text-white transition-all hover:bg-red-700"
                          >
                            <XCircle size={20} />
                            Cancel Order
                          </button>
                        </div>
                      )}

                      {order.status === 'confirmed' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-base font-bold text-white transition-all hover:bg-purple-700"
                          >
                            <Package size={20} />
                            Mark as Ready for Pickup
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-base font-bold text-white transition-all hover:bg-red-700"
                          >
                            <XCircle size={20} />
                            Cancel Order
                          </button>
                        </div>
                      )}

                      {order.status === 'ready' && (
                        <div>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-base font-bold text-white transition-all hover:bg-green-700"
                          >
                            <CheckCircle size={20} />
                            Mark as Completed
                          </button>
                          <p className="mt-2 text-center text-xs text-[#A0A0A0]">
                            💡 Only mark as completed after buyer has picked up and paid
                          </p>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <>
                          <div className="mb-4 rounded-xl border-2 border-green-800 bg-green-950 p-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={20} className="text-green-600" />
                              <p className="text-sm font-semibold text-[#88FF88]">
                                Order completed successfully!
                              </p>
                            </div>
                          </div>

                          {/* Customer Review */}
                          {order.hasReview && orderReviews[order.firebaseId] && (
                            <div className="rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-5">
                              <div className="mb-3 flex items-center gap-2">
                                <Star size={18} className="fill-[#FFD700] text-[#FFD700]" />
                                <h4 className="text-base font-bold text-white">Customer Review</h4>
                              </div>

                              {/* Star Rating */}
                              <div className="mb-3 flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={18}
                                      className={
                                        star <= orderReviews[order.firebaseId].rating
                                          ? 'fill-[#FFD700] text-[#FFD700]'
                                          : 'text-[#3A3A3A]'
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-semibold text-[#E0E0E0]">
                                  {orderReviews[order.firebaseId].rating} out of 5
                                </span>
                              </div>

                              {/* Review Comment */}
                              {orderReviews[order.firebaseId].comment && (
                                <div className="mb-3 rounded-lg border border-[#3A3A3A] bg-[#252525] p-3">
                                  <p className="text-sm text-[#E0E0E0] italic">
                                    "{orderReviews[order.firebaseId].comment}"
                                  </p>
                                </div>
                              )}

                              {/* Review Details */}
                              <div className="flex items-center justify-between text-xs text-[#888888]">
                                <span>By {orderReviews[order.firebaseId].buyerName}</span>
                                <span>
                                  {new Date(
                                    orderReviews[order.firebaseId].createdAt
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="rounded-xl border-2 border-red-800 bg-red-950 p-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-600" />
                            <p className="text-sm font-semibold text-[#FF8888]">
                              This order was cancelled
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SellerOrders;
