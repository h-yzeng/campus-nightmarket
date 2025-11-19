import { ArrowLeft, Clock, MapPin, Package, Wallet, User, Phone, Mail, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { UserMode, Order, ProfileData, CartItem } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface OrderDetailsProps {
  order: Order;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerCashApp?: string;
  sellerVenmo?: string;
  sellerZelle?: string;
  profileData: ProfileData;
  cart: CartItem[];
  userMode: UserMode;
  onBackToOrders: () => void;
  onCancelOrder: (orderId: number) => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onLogoClick?: () => void;
}

const OrderDetails = ({
  order,
  sellerPhone,
  sellerEmail,
  sellerCashApp,
  sellerVenmo,
  sellerZelle,
  profileData,
  cart,
  userMode,
  onBackToOrders,
  onCancelOrder,
  onCartClick,
  onSignOut,
  onProfileClick,
  onLogoClick
}: OrderDetailsProps) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
        return <Clock size={20} />;
      case 'completed':
        return <CheckCircle size={20} />;
      case 'cancelled':
        return <XCircle size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  const handleCancelOrder = () => {
    onCancelOrder(order.id);
    setShowCancelConfirm(false);
  };

  const getPaymentInfo = () => {
    switch (order.paymentMethod) {
      case 'CashApp':
        return sellerCashApp || 'Contact seller for details';
      case 'Venmo':
        return sellerVenmo || 'Contact seller for details';
      case 'Zelle':
        return sellerZelle || 'Contact seller for details';
      case 'Cash':
        return 'Pay in person at pickup';
      default:
        return 'Contact seller for details';
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
        onLogoClick={onLogoClick}
        showCart={true}
        userMode={userMode}
      />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onBackToOrders}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.id}</h1>
              <p className="text-gray-600">Placed on {order.orderDate}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 flex items-center gap-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} />
                Order Items
              </h2>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-[#FAFAFA] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center border-2 border-gray-200">
                        <span className="text-3xl">{item.image}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#CC0000] text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-[#CC0000]">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Pickup Information */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Pickup Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-[#FAFAFA] rounded-xl">
                  <Clock size={20} className="text-[#CC0000] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Pickup Time</p>
                    <p className="text-lg font-bold text-gray-900">{order.pickupTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#FAFAFA] rounded-xl">
                  <MapPin size={20} className="text-[#CC0000] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Location</p>
                    <p className="text-lg font-bold text-gray-900">{order.sellerLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#FAFAFA] rounded-xl">
                  <User size={20} className="text-[#CC0000] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Seller</p>
                    <p className="text-lg font-bold text-gray-900">{order.sellerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.notes && (
              <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Special Instructions
                </h2>
                <div className="p-4 bg-[#FAFAFA] rounded-xl">
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet size={20} />
                Payment
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-[#FAFAFA] rounded-xl">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {order.paymentMethod === 'Cash' ? '💵' : 
                       order.paymentMethod === 'CashApp' ? '💸' : 
                       order.paymentMethod === 'Venmo' ? '💳' : '🏦'}
                    </span>
                    <span className="text-lg font-bold text-gray-900">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Payment Details</p>
                  <p className="text-sm text-gray-900 font-medium">{getPaymentInfo()}</p>
                </div>
              </div>
            </div>

            {/* Seller Contact Information */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Seller</h2>

              <div className="space-y-3">
                {sellerPhone && (
                  <a 
                    href={`tel:${sellerPhone}`}
                    className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <Phone size={18} className="text-[#CC0000]" />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{sellerPhone}</p>
                    </div>
                  </a>
                )}

                {sellerEmail && (
                  <a 
                    href={`mailto:${sellerEmail}`}
                    className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <Mail size={18} className="text-[#CC0000]" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900">{sellerEmail}</p>
                    </div>
                  </a>
                )}

                {!sellerPhone && !sellerEmail && (
                  <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                    <p className="text-sm text-gray-700">
                      Contact information will be shared after order confirmation
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Order */}
            {order.status === 'pending' && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-3 bg-white text-red-600 font-bold rounded-xl border-2 border-red-300 hover:bg-red-50 transition-all"
              >
                Cancel Order
              </button>
            )}

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
              <div className="bg-white rounded-2xl shadow-md border-2 border-red-300 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={20} className="text-red-600" />
                  <h3 className="text-lg font-bold text-gray-900">Cancel Order?</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelOrder}
                    className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Keep Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetails;
