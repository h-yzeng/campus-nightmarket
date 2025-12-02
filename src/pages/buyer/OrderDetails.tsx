import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  Wallet,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import type { UserMode, Order, ProfileData, CartItem, Review } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ReviewModal from '../../components/ReviewModal';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { toast } from 'sonner';

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
  onAddToCart?: (item: CartItem) => void;
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
  onLogoClick,
  onAddToCart,
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

  const handleOrderAgain = () => {
    if (!onAddToCart) {
      toast.error('Unable to add items to cart');
      return;
    }

    let addedCount = 0;
    order.items.forEach((item) => {
      onAddToCart(item);
      addedCount++;
    });

    toast.success(`Added ${addedCount} item${addedCount > 1 ? 's' : ''} to cart!`);
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
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onBackToOrders}
            className="flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white">Order #{order.id}</h1>
              <p className="text-[#A0A0A0]">Placed on {order.orderDate}</p>
            </div>
            <span
              className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold ${getStatusColor(order.status)}`}
            >
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Timeline */}
            <OrderTimeline status={order.status} />

            {/* Order Items */}
            <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                <Package size={20} />
                Order Items
              </h2>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E]">
                        {item.image.startsWith('http') ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">{item.image}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#E0E0E0]">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-[#B0B0B0]">{item.description}</p>
                        )}
                        <p className="mt-1 text-sm text-[#888888]">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#CC0000]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-[#888888]">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t-2 border-neutral-700 pt-4">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-[#CC0000]">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Pickup Information */}
            <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                <MapPin size={20} />
                Pickup Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
                  <Clock size={20} className="mt-1 text-[#CC0000]" />
                  <div>
                    <p className="text-sm font-semibold text-[#B0B0B0]">Pickup Time</p>
                    <p className="text-lg font-bold text-[#E0E0E0]">{order.pickupTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
                  <MapPin size={20} className="mt-1 text-[#CC0000]" />
                  <div>
                    <p className="text-sm font-semibold text-[#B0B0B0]">Location</p>
                    <p className="text-lg font-bold text-[#E0E0E0]">{order.sellerLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
                  <User size={20} className="mt-1 text-[#CC0000]" />
                  <div>
                    <p className="text-sm font-semibold text-[#B0B0B0]">Seller</p>
                    <p className="text-lg font-bold text-[#E0E0E0]">{order.sellerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.notes && (
              <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                  <MessageSquare size={20} />
                  Special Instructions
                </h2>
                <div className="rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
                  <p className="text-[#E0E0E0]">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Payment Information */}
            <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                <Wallet size={20} />
                Payment
              </h2>

              <div className="space-y-4">
                <div className="rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
                  <p className="mb-2 text-sm font-semibold text-[#B0B0B0]">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {order.paymentMethod === 'Cash'
                        ? '💵'
                        : order.paymentMethod === 'CashApp'
                          ? '💸'
                          : order.paymentMethod === 'Venmo'
                            ? '💳'
                            : '🏦'}
                    </span>
                    <span className="text-lg font-bold text-[#E0E0E0]">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#1A3A4A] bg-[#0A1A2A] p-4">
                  <p className="mb-2 text-sm font-semibold text-[#B0B0B0]">Payment Details</p>
                  {order.paymentMethod !== 'Cash' && (
                    <p className="mb-2 text-xs text-[#88CCFF] opacity-80">
                      💡 Send ${order.total.toFixed(2)} to the seller using:
                    </p>
                  )}
                  <p className="text-sm font-medium text-[#88CCFF]">{getPaymentInfo()}</p>
                </div>
              </div>
            </div>

            {/* Seller Contact Information */}
            <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
              <h2 className="mb-2 text-xl font-bold text-white">Contact Seller</h2>
              <p className="mb-4 text-xs text-[#A0A0A0]">
                Reach out for pickup coordination or questions
              </p>

              <div className="space-y-3">
                {sellerEmail && (
                  <a
                    href={`mailto:${sellerEmail}`}
                    className="flex items-center gap-3 rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-3 transition-all hover:border-[#CC0000]"
                  >
                    <Mail size={18} className="text-[#CC0000]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#888888]">Email</p>
                      <p className="truncate text-sm font-semibold text-[#E0E0E0]">{sellerEmail}</p>
                    </div>
                  </a>
                )}

                {sellerPhone && (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="flex items-center gap-3 rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-3 transition-all hover:border-[#CC0000]"
                  >
                    <Phone size={18} className="text-[#CC0000]" />
                    <div>
                      <p className="text-xs text-[#888888]">Phone</p>
                      <p className="text-sm font-semibold text-[#E0E0E0]">{sellerPhone}</p>
                    </div>
                  </a>
                )}

                {!sellerPhone && !sellerEmail && (
                  <div className="rounded-xl border-2 border-[#4A2A1A] bg-[#2A1A0A] p-4">
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
                className="w-full rounded-xl border-2 border-[#4A1A1A] bg-neutral-800 py-3 font-bold text-[#FF8888] transition-all hover:bg-[#2A0A0A]"
              >
                Cancel Order
              </button>
            )}

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
              <div className="rounded-2xl border-2 border-[#4A1A1A] bg-neutral-800 p-6 shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-[#FF8888]" />
                  <h3 className="text-lg font-bold text-white">Cancel Order?</h3>
                </div>
                <p className="mb-4 text-sm text-[#B0B0B0]">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelOrder}
                    className="flex-1 rounded-xl bg-[#CC0000] py-2 font-bold text-white transition-all hover:bg-[#AA0000]"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] py-2 font-bold text-[#E0E0E0] transition-all hover:bg-[#3A3A3A]"
                  >
                    Keep Order
                  </button>
                </div>
              </div>
            )}

            {/* Already Reviewed */}
            {order.status === 'completed' && order.hasReview && review && (
              <div className="rounded-2xl border-2 border-[#1A4A1A] bg-neutral-800 p-6 shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#88FF88]" />
                  <h3 className="text-lg font-bold text-white">Your Review</h3>
                </div>

                {/* Star Rating */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= review.rating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-[#3A3A3A]'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#E0E0E0]">
                    {review.rating} out of 5
                  </span>
                </div>

                {/* Review Comment */}
                {review.comment && (
                  <div className="rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
                    <p className="text-sm text-[#E0E0E0] italic">"{review.comment}"</p>
                  </div>
                )}

                <p className="mt-3 text-xs text-[#888888]">
                  Submitted on{' '}
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Sticky Action Buttons */}
            {(canLeaveReview || (order.status === 'completed' && onAddToCart)) && (
              <div className="sticky top-24 bottom-8 space-y-3">
                {/* Leave Review */}
                {canLeaveReview && (
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#CC0000] py-3 font-bold text-white shadow-lg transition-all hover:bg-[#AA0000] hover:shadow-xl"
                  >
                    <Star size={20} />
                    Leave a Review
                  </button>
                )}

                {/* Order Again */}
                {order.status === 'completed' && onAddToCart && (
                  <button
                    type="button"
                    onClick={handleOrderAgain}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#CC0000] bg-neutral-800 py-3 font-bold text-[#CC0000] shadow-lg transition-all hover:bg-[#2A0A0A] hover:shadow-xl"
                  >
                    <RefreshCw size={20} />
                    Order Again
                  </button>
                )}
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
        itemNames={order.items.map((item) => item.name)}
      />
    </div>
  );
};

export default OrderDetails;
