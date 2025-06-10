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

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.notification?.title || "Default Title";
  const options = {
    body: data.notification?.body || "Default body",
    // icon, badge, etc. can be added here
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // icon, etc.
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
