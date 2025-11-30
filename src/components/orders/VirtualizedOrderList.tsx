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

const VirtualizedOrderList = ({
  orders,
  renderOrderContent,
}: VirtualizedOrderListProps) => {
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
    <div
      ref={parentRef}
      className="h-[calc(100vh-400px)] overflow-auto contain-strict"
    >
      <div
        style={{ '--list-height': `${virtualizer.getTotalSize()}px` } as React.CSSProperties}
        className="relative w-full h(--list-height)]"
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const order = orders[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{ '--item-y': `${virtualItem.start}px` } as React.CSSProperties}
              className="absolute top-0 left-0 w-full pb-4 translate-y(--item-y)]"
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
