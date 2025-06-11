importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyBcBA3jHHYAqS6VMp0kvp_J-Tfm_trapS8",
  authDomain: "loft5-vip.firebaseapp.com",
  projectId: "loft5-vip",
  storageBucket: "loft5-vip.firebasestorage.app",
  messagingSenderId: "742785843285",
  appId: "1:742785843285:web:2568b3d0c33b3d7b0854dc",
  measurementId: "G-8REWPZ50ML",
});

const messaging = firebase.messaging();

// Use only Firebase's background message handler
messaging.onBackgroundMessage(function (payload) {
  console.log("[Service Worker] Background message received:", payload);

  // Extract notification data from the payload
  const notificationTitle =
    payload.notification?.title || payload.data?.title || "Loft5 Notification";
  const notificationBody =
    payload.notification?.body ||
    payload.data?.body ||
    "You have a new message";

  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || "/pwa-192x192.png",
    badge: payload.notification?.badge || "/pwa-64x64.png",
    image: payload.notification?.image || "/pwa-512x512.png",
    tag: payload.notification?.tag || "loft5-notification", // Prevents duplicate notifications
    renotify: true, // Show even if tag already exists
    requireInteraction: false, // Auto-dismiss after a few seconds
    silent: false,
    vibrate: [200, 100, 200], // Vibration pattern
    data: {
      url:
        payload.fcmOptions?.link ||
        payload.data?.click_action ||
        "https://www.loft5.vip/",
      timestamp: Date.now(),
      ...payload.data, // Include any custom data
    },
    actions: [
      {
        action: "open",
        title: "Open App",
        icon: "/pwa-64x64.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/pwa-64x64.png",
      },
    ],
  };

  console.log(
    "[Service Worker] Showing notification:",
    notificationTitle,
    notificationOptions,
  );

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification clicked:", event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === "dismiss") {
    // Just close the notification
    return;
  }

  // Default action or 'open' action - open the app
  const urlToOpen = notificationData?.url || "https://www.loft5.vip/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes("loft5.vip") && "focus" in client) {
            console.log("[Service Worker] Focusing existing window");
            return client.focus();
          }
        }

        // Open new window if app not already open
        if (clients.openWindow) {
          console.log("[Service Worker] Opening new window:", urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  console.log("[Service Worker] Notification closed:", event);
  // Optional: Send analytics about notification dismissal
});

// Optional: Handle push subscription changes
self.addEventListener("pushsubscriptionchange", function (event) {
  console.log("[Service Worker] Push subscription changed:", event);
  // You might want to send the new subscription to your server
});
