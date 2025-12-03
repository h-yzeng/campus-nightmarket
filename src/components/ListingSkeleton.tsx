export const ListingSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-lg bg-gray-800">
    {/* Image skeleton */}
    <div className="h-48 w-full bg-gray-700"></div>

    {/* Content skeleton */}
    <div className="space-y-3 p-4">
      {/* Title */}
      <div className="h-5 w-3/4 rounded bg-gray-700"></div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-700"></div>
        <div className="h-3 w-5/6 rounded bg-gray-700"></div>
      </div>

      {/* Price and location */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-6 w-20 rounded bg-gray-700"></div>
        <div className="h-4 w-24 rounded bg-gray-700"></div>
      </div>

      {/* Button */}
      <div className="h-10 w-full rounded bg-gray-700"></div>
    </div>
  </div>
);

export default ListingSkeleton;
