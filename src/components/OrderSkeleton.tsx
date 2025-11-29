export const OrderSkeleton = () => (
  <div className="animate-pulse rounded-lg bg-gray-800 p-6">
    {/* Header */}
    <div className="mb-4 flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 rounded bg-gray-700"></div>
        <div className="h-4 w-48 rounded bg-gray-700"></div>
      </div>
      <div className="h-7 w-24 rounded bg-gray-700"></div>
    </div>

    {/* Items */}
    <div className="mb-4 space-y-3">
      <div className="flex items-center space-x-3">
        <div className="h-16 w-16 rounded bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-700"></div>
          <div className="h-3 w-1/2 rounded bg-gray-700"></div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-16 w-16 rounded bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-700"></div>
          <div className="h-3 w-1/2 rounded bg-gray-700"></div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between border-t border-gray-700 pt-4">
      <div className="h-4 w-32 rounded bg-gray-700"></div>
      <div className="h-6 w-20 rounded bg-gray-700"></div>
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
