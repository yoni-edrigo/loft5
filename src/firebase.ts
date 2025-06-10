import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner"; // e.g., 'react-toastify'

const firebaseConfig = {
  apiKey: "AIzaSyBcBA3jHHYAqS6VMp0kvp_J-Tfm_trapS8",
  authDomain: "loft5-vip.firebaseapp.com",
  projectId: "loft5-vip",
  storageBucket: "loft5-vip.firebasestorage.app",
  messagingSenderId: "742785843285",
  appId: "1:742785843285:web:2568b3d0c33b3d7b0854dc",
  measurementId: "G-8REWPZ50ML",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function requestFCMToken() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service workers are not supported in this browser.");
    return null;
  }
  try {
    // Explicitly register the Firebase service worker for FCM
    console.log("Registering service worker for FCM...");
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    console.log("Service worker registration state:", registration);
    console.log("Requesting FCM token...");
    const token = await getToken(messaging, {
      vapidKey:
        "BFeHkcvZ31VmsxW0cbzS3BhKrtG2rWWbaKKcwU0DbV9B3xIvAHa94V2FyHakXffsr4ZXOR_NS_uWISUxCb6NbAc",
      serviceWorkerRegistration: registration,
    });
    if (token) {
      console.log("FCM token obtained:", token);
    } else {
      console.log("No FCM token received. User may have denied permission.");
    }
    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

onMessage(messaging, (payload) => {
  const { title, body } = payload.notification || {};
  toast.info(`${title}: ${body}`);
});
