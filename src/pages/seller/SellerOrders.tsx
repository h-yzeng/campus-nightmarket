import { ArrowLeft, Clock, MapPin, Package, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { ProfileData, CartItem, Order } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface SellerOrdersProps {
  profileData: ProfileData;
  cart: CartItem[];
  incomingOrders: Order[];
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
}

type OrderTab = 'pending' | 'completed';

const SellerOrders = ({
  profileData,
  cart,
  incomingOrders,
  userMode,
  onBackToDashboard,
  onUpdateOrderStatus,
  onModeChange,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onSellerDashboardClick,
  onLogoClick
}: SellerOrdersProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('pending');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const pendingOrders = incomingOrders.filter(order => order.status === 'pending');
  const completedOrders = incomingOrders.filter(order => 
    order.status === 'completed' || order.status === 'cancelled'
  );

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

  const toggleOrderExpanded = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Incoming Orders</h1>
          <p className="text-gray-600">Manage and fulfill customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600">Total Orders</p>
              <Package size={20} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{incomingOrders.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600">Pending Orders</p>
              <Clock size={20} className="text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
            {pendingOrders.length > 0 && (
              <p className="text-xs text-yellow-600 mt-2 font-semibold">Action needed!</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600">Completed Orders</p>
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
          </div>
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
                  className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden transition-all hover:shadow-lg"
                >
                  {/* Order Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrderExpanded(order.id)}
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
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#CC0000]">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                      </div>
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
                          {order.items.map(item => item.name).join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Customer</p>
                          <p className="text-sm font-semibold text-gray-900">{order.buyerName || 'Anonymous'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Pickup Time</p>
                          <p className="text-sm font-semibold text-gray-900">{order.pickupTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Payment</p>
                          <p className="text-sm font-semibold text-gray-900">{order.paymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <div className="mt-4 text-center">
                      <button className="text-sm text-[#CC0000] font-semibold">
                        {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <div className="p-6 pt-0 border-t-2 border-gray-200 bg-[#FAFAFA]">
                      {/* Order Items List */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-white rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#FAFAFA] border-2 border-gray-200 flex items-center justify-center">
                                  <span className="text-2xl">{item.image}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
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
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h4>
                        <div className="bg-white rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <User size={18} className="text-[#CC0000]" />
                            <div>
                              <p className="text-xs text-gray-500">Name</p>
                              <p className="text-sm font-semibold text-gray-900">{order.buyerName || 'Not provided'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-[#CC0000]" />
                            <div>
                              <p className="text-xs text-gray-500">Pickup Location</p>
                              <p className="text-sm font-semibold text-gray-900">{order.sellerLocation}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock size={18} className="text-[#CC0000]" />
                            <div>
                              <p className="text-xs text-gray-500">Pickup Time</p>
                              <p className="text-sm font-semibold text-gray-900">{order.pickupTime}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {order.notes && (
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-3">Special Instructions</h4>
                          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                            <p className="text-sm text-gray-900">{order.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Payment Information */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Payment Information</h4>
                        <div className="bg-white rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {order.paymentMethod === 'Cash' ? '💵' : 
                               order.paymentMethod === 'CashApp' ? '💸' : 
                               order.paymentMethod === 'Venmo' ? '💳' : '🏦'}
                            </span>
                            <div>
                              <p className="text-xs text-gray-500">Payment Method</p>
                              <p className="text-sm font-bold text-gray-900">{order.paymentMethod}</p>
                            </div>
                          </div>
                          {order.paymentMethod !== 'Cash' && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs text-gray-700">
                                💡 Share your {order.paymentMethod} details with the customer for payment
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Actions */}
                      {order.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                            className="flex-1 py-3 bg-green-600 text-white text-base font-bold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={20} />
                            Mark as Completed
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                            className="flex-1 py-3 bg-red-600 text-white text-base font-bold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={20} />
                            Cancel Order
                          </button>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-600" />
                            <p className="text-sm font-semibold text-green-800">
                              Order completed successfully!
                            </p>
                          </div>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-600" />
                            <p className="text-sm font-semibold text-red-800">
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