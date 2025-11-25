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
  onLogoClick
}: ViewProfileProps) => {
  const averageRating = transactions.length > 0
    ? (transactions.reduce((sum, t) => sum + t.rating, 0) / transactions.length).toFixed(1)
    : 'N/A';

  const totalSales = transactions.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#040707]">
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
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            ← Back to Browse
          </button>
        </div>

        <div className="bg-neutral-800 rounded-2xl shadow-xl border-2 border-neutral-700 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-[#E0E0E0] bg-[#F5F5F5] overflow-hidden mb-4">
              {sellerPhoto ? (
                <img 
                  src={sellerPhoto} 
                  alt={sellerName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={48} className="text-[#76777B]" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">{sellerName}</h1>
            
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <IdCard size={16} />
              <span className="text-sm font-mono">{sellerStudentId}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <MapPin size={16} />
              <span className="text-sm">{sellerLocation}</span>
            </div>

            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-[#CC0000]">
                  <Star size={24} className="fill-current" />
                  {averageRating}
                </div>
                <p className="text-xs text-gray-400 mt-1">Rating</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                  <ShoppingBag size={24} />
                  {totalSales}
                </div>
                <p className="text-xs text-gray-400 mt-1">Sales</p>
              </div>
            </div>
          </div>

          {sellerBio && (
            <div className="mb-8 p-4 bg-[#FAFAFA] rounded-xl border-2 border-gray-200">
              <h2 className="text-sm font-bold text-white mb-2">About</h2>
              <p className="text-sm text-gray-700">{sellerBio}</p>
            </div>
          )}

          {/* Reviews Section */}
          <div className="border-t-2 border-neutral-700 pt-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
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
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#CC0000]" />
                Recent Transactions ({transactions.length})
              </h2>

              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 bg-[#FAFAFA] rounded-xl border-2 border-neutral-700 hover:border-neutral-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white">{transaction.itemName}</h3>
                        <p className="text-sm text-gray-600">Bought by {transaction.buyerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#CC0000]">${transaction.price}</p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Star size={14} className="fill-current text-[#FF9900]" />
                          <span className="text-sm font-semibold text-white">{transaction.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Calendar size={12} />
                      <span>{transaction.date}</span>
                    </div>

                    {transaction.review && (
                      <div className="mt-3 p-3 bg-neutral-800 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-300 italic">"{transaction.review}"</p>
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