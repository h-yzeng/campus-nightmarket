import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import NotificationBell from '../../src/components/NotificationBell';
import type { Notification } from '../../src/hooks/useNotifications';

describe('NotificationBell permission messaging', () => {
  const baseNotification: Notification = {
    id: '1',
    title: 'Order update',
    body: 'Your order is ready',
    timestamp: new Date(),
    read: false,
  };

  it('surfaces permission denied guidance and handles retry', () => {
    const onRequestPermission = jest.fn();

    render(
      <NotificationBell
        notifications={[baseNotification]}
        unreadCount={1}
        onMarkAsRead={jest.fn()}
        onMarkAllAsRead={jest.fn()}
        onClear={jest.fn()}
        onClearAll={jest.fn()}
        permissionState="denied"
        onRequestPermission={onRequestPermission}
        isRequestingPermission={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    expect(
      screen.getByText(/Notifications are blocked in your browser settings/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Enable notifications/i }));
    expect(onRequestPermission).toHaveBeenCalled();
  });
});
