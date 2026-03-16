// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

console.log('[firebase-messaging-sw] Service Worker loaded');

try {
  // Initialize Firebase with your config
  firebase.initializeApp({
    apiKey: 'AIzaSyC-77hYNsnn5mhe-0Rab2J2sKFJodcoUos',
    authDomain: 'app-base-7de4d.firebaseapp.com',
    projectId: 'app-base-7de4d',
    storageBucket: 'app-base-7de4d.firebasestorage.app',
    messagingSenderId: '768864792786',
    appId: '1:768864792786:web:c88af129de02118999fd0b',
    measurementId: 'G-Z35NG91BXE',
  });

  // Get Firebase Messaging instance
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw] Received background message: ', payload);

    const notificationTitle = payload.notification?.title || 'Nueva Notificación';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: payload.data || {},
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  console.log('[firebase-messaging-sw] Firebase Messaging configured');
} catch (error) {
  console.error('[firebase-messaging-sw] Error initializing Firebase:', error);
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification clicked: ', event);
  event.notification.close();

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    }),
  );
});
