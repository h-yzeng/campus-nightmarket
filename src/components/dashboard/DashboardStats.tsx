import { Package, DollarSign, Clock, TrendingUp } from 'lucide-react';
import type { ListingWithFirebaseId, Order } from '../../types';

interface DashboardStatsProps {
  listings: ListingWithFirebaseId[];
  incomingOrders: Order[];
}

const DashboardStats = ({ listings, incomingOrders }: DashboardStatsProps) => {
  const activeListings = listings.filter((l) => l.isAvailable).length;
  const pendingOrders = incomingOrders.filter((o) => o.status === 'pending').length;
  const totalEarnings = incomingOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Active Listings */}
      <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-xl bg-[#0A1A2A] p-3">
            <Package size={24} className="text-[#88CCFF]" />
          </div>
          <TrendingUp size={20} className="text-[#88FF88]" />
        </div>
        <p className="mb-1 text-sm font-semibold text-[#A0A0A0]">Active Listings</p>
        <p className="text-3xl font-bold text-[#E0E0E0]">{activeListings}</p>
        <p className="mt-2 text-xs text-[#888888]">Total: {listings.length} listings</p>
      </div>

      {/* Pending Orders */}
      <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-xl bg-[#2A2A0A] p-3">
            <Clock size={24} className="text-[#FFD700]" />
          </div>
          {pendingOrders > 0 && (
            <span
              className="rounded-full border-2 border-[#4A4A1A] bg-[#2A2A0A] px-2 py-1 text-xs font-bold text-[#FFD700]"
              role="status"
              aria-label={`${pendingOrders} pending orders requiring action`}
            >
              Action Needed
            </span>
          )}
        </div>
        <p className="mb-1 text-sm font-semibold text-[#A0A0A0]">Pending Orders</p>
        <p className="text-3xl font-bold text-[#E0E0E0]">{pendingOrders}</p>
        <p className="mt-2 text-xs text-[#888888]">Total: {incomingOrders.length} orders</p>
      </div>

      {/* Total Earnings */}
      <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-xl bg-[#0A2A0A] p-3">
            <DollarSign size={24} className="text-[#88FF88]" />
          </div>
          <TrendingUp size={20} className="text-[#88FF88]" />
        </div>
        <p className="mb-1 text-sm font-semibold text-[#A0A0A0]">Total Earnings</p>
        <p className="text-3xl font-bold text-[#E0E0E0]">${totalEarnings.toFixed(2)}</p>
        <p className="mt-2 text-xs text-[#888888]">Completed orders only</p>
      </div>
    </div>
  );
};

export default DashboardStats;
