/**
 * Skeleton Component Tests
 */
import { render, screen } from '@testing-library/react';
import Skeleton, {
  ListingCardSkeleton,
  OrderCardSkeleton,
  CartItemSkeleton,
  ProfileSkeleton,
  ReviewSkeleton,
  DashboardStatSkeleton,
} from '../../src/components/common/Skeleton';

describe('Skeleton Component', () => {
  describe('Base Skeleton', () => {
    it('should render with default props', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should apply text variant class', () => {
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('rounded');
    });

    it('should apply circular variant class', () => {
      render(<Skeleton variant="circular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('rounded-full');
    });

    it('should apply rectangular variant', () => {
      render(<Skeleton variant="rectangular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });

    it('should apply rounded variant class', () => {
      render(<Skeleton variant="rounded" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('rounded-xl');
    });

    it('should apply pulse animation by default', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('animate-pulse');
    });

    it('should apply wave animation', () => {
      render(<Skeleton animation="wave" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('animate-shimmer');
    });

    it('should apply no animation when animation is none', () => {
      render(<Skeleton animation="none" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).not.toContain('animate-pulse');
      expect(skeleton.className).not.toContain('animate-shimmer');
    });

    it('should apply custom width as number', () => {
      render(<Skeleton width={100} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('w-[100px]');
    });

    it('should apply custom width as string', () => {
      render(<Skeleton width="50%" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('w-[50%]');
    });

    it('should apply custom height as number', () => {
      render(<Skeleton height={50} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('h-[50px]');
    });

    it('should apply custom height as string', () => {
      render(<Skeleton height="2rem" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('h-[2rem]');
    });

    it('should apply custom className', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('custom-class');
    });
  });

  describe('Pre-built Skeleton Components', () => {
    it('should render ListingCardSkeleton', () => {
      const { container } = render(<ListingCardSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render OrderCardSkeleton', () => {
      const { container } = render(<OrderCardSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render CartItemSkeleton', () => {
      const { container } = render(<CartItemSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render ProfileSkeleton', () => {
      const { container } = render(<ProfileSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render ReviewSkeleton', () => {
      const { container } = render(<ReviewSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render DashboardStatSkeleton', () => {
      const { container } = render(<DashboardStatSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have status role', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading...');
    });
  });
});
