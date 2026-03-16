// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker (use public config)
const firebaseConfig = {
  apiKey: 'AIzaSyBrLKNkLYNvyQVIj1TmKBU9BaOHXrGZlVE',
  authDomain: 'app-base-7de4d.firebaseapp.com',
  projectId: 'app-base-7de4d',
  storageBucket: 'app-base-7de4d.appspot.com',
  messagingSenderId: '970887254951',
  appId: '1:970887254951:web:b8e6e85949b59e4c10f2e1',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle messages received in background
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo-raw.png',
    badge: '/logo-raw.png',
    tag: payload.data?.tag || 'notification',
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
