import { User, IdCard, Star, MapPin, Calendar, ShoppingBag } from 'lucide-react';
import type { Transaction, ProfileData, CartItem, Review } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ReviewsList from '../../components/ReviewsList';
import type { UserMode } from '../../types';

interface ViewProfileProps {
  sellerName: string;
  sellerStudentId: string;
  sellerPhoto: string | null;
  sellerBio: string;
  sellerLocation: string;
  transactions: Transaction[];
  reviews?: Review[];
  reviewsLoading?: boolean;
  currentUserProfile: ProfileData;
  cart: CartItem[];
  userMode: UserMode;
  onBack: () => void;
  onSignOut: () => void;
  onCartClick: () => void;
  onProfileClick: () => void;
  onLogoClick?: () => void;
}

const ViewProfile = ({
  sellerName,
  sellerStudentId,
  sellerPhoto,
  sellerBio,
  sellerLocation,
  transactions,
  reviews = [],
  reviewsLoading = false,
  currentUserProfile,
  cart,
  userMode,
  onBack,
  onSignOut,
  onCartClick,
  onProfileClick,
  onLogoClick,
}: ViewProfileProps) => {
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 'N/A';

  const totalSales = reviews.length;

  return (
    <div className="flex min-h-screen flex-col bg-[#040707]">
      <Header
        cartItems={cart}
        profileData={currentUserProfile}
        onCartClick={onCartClick}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onLogoClick={onLogoClick}
        showCart={true}
        userMode={userMode}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
          >
            ← Back to Browse
          </button>
        </div>

        <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-8 shadow-xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#3A3A3A] bg-[#252525]">
              {sellerPhoto ? (
                <img
                  src={sellerPhoto}
                  srcSet={`${sellerPhoto} 160w, ${sellerPhoto} 240w, ${sellerPhoto} 320w`}
                  sizes="128px"
                  alt={sellerName}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={48} className="text-[#888888]" />
              )}
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white">{sellerName}</h1>

            <div className="mb-2 flex items-center gap-2 text-gray-400">
              <IdCard size={16} />
              <span className="font-mono text-sm">{sellerStudentId}</span>
            </div>

            <div className="mb-4 flex items-center gap-2 text-gray-400">
              <MapPin size={16} />
              <span className="text-sm">{sellerLocation}</span>
            </div>

            <div className="mb-4 flex gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-[#CC0000]">
                  <Star size={24} className="fill-current" />
                  {averageRating}
                </div>
                <p className="mt-1 text-xs text-gray-400">Rating</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                  <ShoppingBag size={24} />
                  {totalSales}
                </div>
                <p className="mt-1 text-xs text-gray-400">Sales</p>
              </div>
            </div>
          </div>

          {sellerBio && (
            <div className="mb-8 rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] p-4">
              <h2 className="mb-2 text-sm font-bold text-white">About</h2>
              <p className="text-sm text-[#E0E0E0]">{sellerBio}</p>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mb-6 border-t-2 border-neutral-700 pt-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Star size={20} className="text-[#CC0000]" />
              Customer Reviews ({reviews.length})
            </h2>

            <ReviewsList
              reviews={reviews}
              loading={reviewsLoading}
              emptyMessage="No reviews yet. Be the first to order and leave a review!"
            />
          </div>

          {/* Transaction History */}
          {transactions.length > 0 && (
            <div className="border-t-2 border-neutral-700 pt-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                <ShoppingBag size={20} className="text-[#CC0000]" />
                Recent Transactions ({transactions.length})
              </h2>

              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] p-4 transition-colors hover:border-[#4A4A4A]"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white">{transaction.itemName}</h3>
                        <p className="text-sm text-[#A0A0A0]">Bought by {transaction.buyerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#CC0000]">${transaction.price}</p>
                        <div className="mt-1 flex items-center justify-end gap-1">
                          <Star size={14} className="fill-current text-[#FF9900]" />
                          <span className="text-sm font-semibold text-white">
                            {transaction.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2 flex items-center gap-2 text-xs text-[#888888]">
                      <Calendar size={12} />
                      <span>{transaction.date}</span>
                    </div>

                    {transaction.review && (
                      <div className="mt-3 rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] p-3">
                        <p className="text-sm text-[#E0E0E0] italic">"{transaction.review}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ViewProfile;
