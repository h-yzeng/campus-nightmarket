export const ListingSkeleton = () => (
  <div className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
    {/* Image skeleton */}
    <div className="w-full h-48 bg-gray-700"></div>

    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      {/* Title */}
      <div className="h-5 bg-gray-700 rounded w-3/4"></div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
      </div>

      {/* Price and location */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-700 rounded w-24"></div>
      </div>

      {/* Button */}
      <div className="h-10 bg-gray-700 rounded w-full"></div>
    </div>
  </div>
);

export const ListingGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ListingSkeleton key={i} />
    ))}
  </div>
);

export default ListingSkeleton;
