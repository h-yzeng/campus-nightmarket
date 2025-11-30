import type { Order } from '../../types';

interface RecentOrdersListProps {
  recentOrders: Order[];
  onViewOrders: () => void;
  onCreateListing: () => void;
}

const RecentOrdersList = ({
  recentOrders,
  onViewOrders,
  onCreateListing,
}: RecentOrdersListProps) => {
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

  return (
    <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold text-[#E0E0E0]">Recent Orders</h2>

      {recentOrders.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl" role="img" aria-label="Package icon">
            📦
          </div>
          <h3 className="mb-2 text-xl font-bold text-[#E0E0E0]">No orders yet</h3>
          <p className="mb-6 text-[#A0A0A0]">Start by creating your first listing!</p>
          <button
            onClick={onCreateListing}
            className="rounded-xl bg-[#CC0000] px-6 py-3 font-bold text-white transition-all hover:shadow-lg"
            aria-label="Create your first listing"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-[#3A3A3A] bg-[#252525] p-4 transition-all hover:bg-[#2A2A2A]"
              onClick={onViewOrders}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onViewOrders();
                }
              }}
              aria-label={`View order ${order.id} from ${order.buyerName || 'Anonymous'} for $${order.total.toFixed(2)}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#3A3A3A] bg-[#1E1E1E]"
                    >
                      {item.image.startsWith('http') ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">{item.image}</span>
                      )}
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#3A3A3A] bg-[#252525]">
                      <span className="text-xs font-bold text-[#B0B0B0]">
                        +{order.items.length - 2}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#E0E0E0]">Order #{order.id}</p>
                  <p className="text-sm text-[#A0A0A0]">
                    {order.buyerName || 'Anonymous'} · {order.pickupTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full border-2 px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}
                  role="status"
                  aria-label={`Order status: ${order.status}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <p className="text-lg font-bold text-[#CC0000]">${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersList;
