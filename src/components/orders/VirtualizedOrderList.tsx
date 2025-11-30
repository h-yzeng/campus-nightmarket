import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, type ReactElement } from 'react';
import type { Order, Review } from '../../types';

interface VirtualizedOrderListProps {
  orders: Order[];
  orderReviews: Record<string, Review>;
  expandedOrderId: number | null;
  onToggleExpanded: (orderId: number) => void;
  onUpdateStatus: (orderId: number, status: Order['status']) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => ReactElement;
  renderOrderContent: (order: Order, isExpanded: boolean) => ReactElement;
}

const VirtualizedOrderList = ({ orders, renderOrderContent }: VirtualizedOrderListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each order card
    overscan: 5, // Number of items to render outside viewport
  });

  if (orders.length === 0) {
    return null;
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-400px)] overflow-auto contain-strict">
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const order = orders[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full pb-4"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              {renderOrderContent(order, false)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedOrderList;
