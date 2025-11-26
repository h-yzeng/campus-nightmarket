export const OrderSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
    {/* Header */}
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-gray-700 rounded w-32"></div>
        <div className="h-4 bg-gray-700 rounded w-48"></div>
      </div>
      <div className="h-7 bg-gray-700 rounded w-24"></div>
    </div>

    {/* Items */}
    <div className="space-y-3 mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-16 h-16 bg-gray-700 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-16 h-16 bg-gray-700 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
      <div className="h-4 bg-gray-700 rounded w-32"></div>
      <div className="h-6 bg-gray-700 rounded w-20"></div>
    </div>
  </div>
);

export const OrderListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <OrderSkeleton key={i} />
    ))}
  </div>
);

export default OrderSkeleton;
