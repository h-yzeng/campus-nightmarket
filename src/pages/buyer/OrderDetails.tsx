import { ArrowLeft, Clock, MapPin, Package, Wallet, User, Phone, Mail, MessageSquare, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';
import { useState } from 'react';
import type { UserMode, Order, ProfileData, CartItem, Review } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ReviewModal from '../../components/ReviewModal';

interface OrderDetailsProps {
  order: Order;
  review?: Review;
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
  onSubmitReview?: (orderId: number, rating: number, comment: string) => Promise<void>;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onLogoClick?: () => void;
}

const OrderDetails = ({
  order,
  review,
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
  onSubmitReview,
  onCartClick,
  onSignOut,
  onProfileClick,
  onLogoClick
}: OrderDetailsProps) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
        return <Clock size={20} />;
      case 'confirmed':
        return <CheckCircle size={20} />;
      case 'ready':
        return <Package size={20} />;
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

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (onSubmitReview) {
      await onSubmitReview(order.id, rating, comment);
    }
  };

  const canLeaveReview = order.status === 'completed' && !order.hasReview && onSubmitReview;

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
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
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
              <h1 className="text-3xl font-bold text-white mb-2">Order #{order.id}</h1>
              <p className="text-[#A0A0A0]">Placed on {order.orderDate}</p>
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
            <div className="bg-neutral-800 rounded-2xl shadow-md border-2 border-neutral-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Package size={20} />
                Order Items
              </h2>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A]">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[#1E1E1E] flex items-center justify-center border-2 border-[#3A3A3A] overflow-hidden">
                        {item.image.startsWith('http') ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">{item.image}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#E0E0E0] text-lg">{item.name}</p>
                        {item.description && <p className="text-sm text-[#B0B0B0]">{item.description}</p>}
                        <p className="text-sm text-[#888888] mt-1">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#CC0000] text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-[#888888]">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-neutral-700 flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-[#CC0000]">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Pickup Information */}
            <div className="bg-neutral-800 rounded-2xl shadow-md border-2 border-neutral-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Pickup Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A]">
                  <Clock size={20} className="text-[#CC0000] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-[#B0B0B0]">Pickup Time</p>
                    <p className="text-lg font-bold text-[#E0E0E0]">{order.pickupTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A]">
                  <MapPin size={20} className="text-[#CC0000] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-[#B0B0B0]">Location</p>
                    <p className="text-lg font-bold text-[#E0E0E0]">{order.sellerLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A]">
                  <User size={20} className="text-[#CC0000] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-[#B0B0B0]">Seller</p>
                    <p className="text-lg font-bold text-[#E0E0E0]">{order.sellerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.notes && (
              <div className="bg-neutral-800 rounded-2xl shadow-md border-2 border-neutral-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Special Instructions
                </h2>
                <div className="p-4 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A]">
                  <p className="text-[#E0E0E0]">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Information */}
            <div className="bg-neutral-800 rounded-2xl shadow-md border-2 border-neutral-700 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Wallet size={20} />
                Payment
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A]">
                  <p className="text-sm font-semibold text-[#B0B0B0] mb-2">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {order.paymentMethod === 'Cash' ? '💵' :
                       order.paymentMethod === 'CashApp' ? '💸' :
                       order.paymentMethod === 'Venmo' ? '💳' : '🏦'}
                    </span>
                    <span className="text-lg font-bold text-[#E0E0E0]">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#0A1A2A] rounded-xl border-2 border-[#1A3A4A]">
                  <p className="text-sm font-semibold text-[#B0B0B0] mb-2">Payment Details</p>
                  {order.paymentMethod !== 'Cash' && (
                    <p className="text-xs text-[#88CCFF] mb-2 opacity-80">
                      💡 Send ${order.total.toFixed(2)} to the seller using:
                    </p>
                  )}
                  <p className="text-sm text-[#88CCFF] font-medium">{getPaymentInfo()}</p>
                </div>
              </div>
            </div>

            {/* Seller Contact Information */}
            <div className="bg-neutral-800 rounded-2xl shadow-md border-2 border-neutral-700 p-6">
              <h2 className="text-xl font-bold text-white mb-2">Contact Seller</h2>
              <p className="text-xs text-[#A0A0A0] mb-4">
                Reach out for pickup coordination or questions
              </p>

              <div className="space-y-3">
                {sellerEmail && (
                  <a
                    href={`mailto:${sellerEmail}`}
                    className="flex items-center gap-3 p-3 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A] hover:border-[#CC0000] transition-all"
                  >
                    <Mail size={18} className="text-[#CC0000]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#888888]">Email</p>
                      <p className="text-sm font-semibold text-[#E0E0E0] truncate">{sellerEmail}</p>
                    </div>
                  </a>
                )}

                {sellerPhone && (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="flex items-center gap-3 p-3 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A] hover:border-[#CC0000] transition-all"
                  >
                    <Phone size={18} className="text-[#CC0000]" />
                    <div>
                      <p className="text-xs text-[#888888]">Phone</p>
                      <p className="text-sm font-semibold text-[#E0E0E0]">{sellerPhone}</p>
                    </div>
                  </a>
                )}

                {!sellerPhone && !sellerEmail && (
                  <div className="p-4 bg-[#2A1A0A] rounded-xl border-2 border-[#4A2A1A]">
                    <p className="text-sm text-[#FFD699]">
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
                className="w-full py-3 bg-neutral-800 text-[#FF8888] font-bold rounded-xl border-2 border-[#4A1A1A] hover:bg-[#2A0A0A] transition-all"
              >
                Cancel Order
              </button>
            )}

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
              <div className="bg-neutral-800 rounded-2xl shadow-md border-2 border-[#4A1A1A] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={20} className="text-[#FF8888]" />
                  <h3 className="text-lg font-bold text-white">Cancel Order?</h3>
                </div>
                <p className="text-sm text-[#B0B0B0] mb-4">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelOrder}
                    className="flex-1 py-2 bg-[#CC0000] text-white font-bold rounded-xl hover:bg-[#AA0000] transition-all"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2 bg-[#2A2A2A] text-[#E0E0E0] font-bold rounded-xl border-2 border-[#3A3A3A] hover:bg-[#3A3A3A] transition-all"
                  >
                    Keep Order
                  </button>
                </div>
              </div>
            )}

            {/* Leave Review */}
            {canLeaveReview && (
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="w-full py-3 bg-[#CC0000] text-white font-bold rounded-xl hover:bg-[#AA0000] transition-all flex items-center justify-center gap-2"
              >
                <Star size={20} />
                Leave a Review
              </button>
            )}

            {/* Already Reviewed */}
            {order.status === 'completed' && order.hasReview && review && (
              <div className="bg-neutral-800 rounded-2xl shadow-md border-2 border-[#1A4A1A] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-[#88FF88]" />
                  <h3 className="text-lg font-bold text-white">Your Review</h3>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={star <= review.rating ? 'text-[#FFD700] fill-[#FFD700]' : 'text-[#3A3A3A]'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#E0E0E0]">
                    {review.rating} out of 5
                  </span>
                </div>

                {/* Review Comment */}
                {review.comment && (
                  <div className="p-4 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A]">
                    <p className="text-sm text-[#E0E0E0] italic">"{review.comment}"</p>
                  </div>
                )}

                <p className="text-xs text-[#888888] mt-3">
                  Submitted on {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        sellerName={order.sellerName}
        itemNames={order.items.map(item => item.name)}
      />
    </div>
  );
};

export default OrderDetails;
