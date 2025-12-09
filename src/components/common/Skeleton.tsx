interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) => {
  const baseClasses = 'bg-[#2A2A2A]';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  // Convert width/height to Tailwind arbitrary values when possible
  let dimensionClasses = '';
  if (width) {
    dimensionClasses += typeof width === 'number' ? `w-[${width}px] ` : `w-[${width}] `;
  }
  if (height) {
    dimensionClasses += typeof height === 'number' ? `h-[${height}px]` : `h-[${height}]`;
  }

  return (
    <div
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${dimensionClasses} ${className}`.trim()}
      role="status"
      aria-label="Loading..."
    />
  );
};

// Pre-built skeleton components for common use cases
export const ListingCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border-2 border-[#2A2A2A] bg-[#141414] p-4 shadow-sm">
    <Skeleton variant="rounded" className="mb-4 h-40 w-full" />
    <Skeleton className="mb-2 h-4 w-3/4" />
    <Skeleton className="mb-4 h-4 w-1/2" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton variant="rounded" className="h-8 w-20" />
    </div>
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border-2 border-[#2A2A2A] bg-[#1A1A1A] p-6 shadow-md">
    <div className="mb-4 flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton variant="rounded" className="h-6 w-20" />
    </div>
    <Skeleton className="mb-4 h-10 w-full" />
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
    </div>
  </div>
);

export const CartItemSkeleton = () => (
  <div className="animate-pulse rounded-2xl border-2 border-[#2A2A2A] bg-[#1A1A1A] p-6">
    <div className="flex gap-4">
      <Skeleton variant="rounded" className="h-24 w-24 shrink-0" />
      <div className="flex-1">
        <Skeleton className="mb-2 h-5 w-2/3" />
        <Skeleton className="mb-1 h-3 w-1/3" />
        <Skeleton className="mb-4 h-3 w-1/4" />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton variant="rounded" className="h-8 w-8" />
            <Skeleton className="h-8 w-12" />
            <Skeleton variant="rounded" className="h-8 w-8" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" className="h-20 w-20" />
      <div className="flex-1">
        <Skeleton className="mb-2 h-6 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
);

export const ReviewSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
    <div className="mb-3 flex items-center gap-3">
      <Skeleton variant="circular" className="h-10 w-10" />
      <div>
        <Skeleton className="mb-1 h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="mb-2 h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export const DashboardStatSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
    <Skeleton className="mb-2 h-4 w-1/2" />
    <Skeleton className="h-8 w-2/3" />
  </div>
);

export default Skeleton;
