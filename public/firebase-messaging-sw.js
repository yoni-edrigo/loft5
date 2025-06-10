importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
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
