// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyDbGGvsy0IvJMkJnvWGUQ39jtQp9Qaeys",
  authDomain: "campus-night-market.firebaseapp.com",
  projectId: "campus-night-market",
  storageBucket: "campus-night-market.firebasestorage.app",
  messagingSenderId: "1098548595788",
  appId: "1:1098548595788:web:74d1ea9cced5b1e863f8e9"
});

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Night Market';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon.png',
    badge: '/badge.png',
    data: payload.data,
    tag: payload.data?.orderId || 'notification',
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked', event.notification);

  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  // Navigate to appropriate page based on notification data
  if (data?.orderId) {
    url = `/orders/${data.orderId}`;
  } else if (data?.type === 'new_order') {
    url = '/seller/orders';
  } else if (data?.type === 'order_update') {
    url = '/orders';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: data,
            url: url,
          });
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
