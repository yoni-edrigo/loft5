import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  type MessagePayload,
} from "firebase/messaging";
import { toast } from "sonner";

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

// VAPID key for push notifications
const VAPID_KEY =
  "BFeHkcvZ31VmsxW0cbzS3BhKrtG2rWWbaKKcwU0DbV9B3xIvAHa94V2FyHakXffsr4ZXOR_NS_uWISUxCb6NbAc";

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    throw new Error("Notifications not supported in this browser");
  }

  const permission = await Notification.requestPermission();
  console.log("Notification permission:", permission);
  return permission;
}

// Register service worker
async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  try {
    console.log("Registering service worker for FCM...");
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" },
    );

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log("Service worker registered successfully:", registration);
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    throw error;
  }
}

// Get FCM token
export async function requestFCMToken(): Promise<string | null> {
  if (!isNotificationSupported()) {
    console.error("Notifications are not supported in this browser");
    return null;
  }

  try {
    // Check current permission status
    let permission = Notification.permission;

    // Request permission if not granted
    if (permission === "default") {
      permission = await requestNotificationPermission();
    }

    if (permission !== "granted") {
      console.log("Notification permission denied");
      toast.error("Notification permission required for push notifications");
      return null;
    }

    // Register service worker
    const registration = await registerServiceWorker();

    // Get FCM token
    console.log("Requesting FCM token...");
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM token obtained:", token);
      return token;
    } else {
      console.log("No FCM token received");
      toast.error("Failed to get notification token");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    toast.error("Failed to setup push notifications");
    return null;
  }
}

// Periodically check for token updates (Firebase v9+ handles refresh automatically)
// Call this when app becomes active or periodically
export async function checkTokenRefresh(): Promise<void> {
  try {
    if (!isNotificationSupported() || !isPushNotificationEnabled()) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      const storedToken = localStorage.getItem("fcm_token");
      if (storedToken !== currentToken) {
        console.log("FCM token updated:", currentToken);
        localStorage.setItem("fcm_token", currentToken);
        // Token storage handled by FcmTokenRegistrar component
      }
    }
  } catch (error) {
    console.error("Error checking token refresh:", error);
  }
}

// Handle foreground messages
onMessage(messaging, (payload: MessagePayload) => {
  console.log("[FCM] Foreground message received:", payload);

  const title = payload.notification?.title || payload.data?.title || "Loft5";
  const body =
    payload.notification?.body || payload.data?.body || "New notification";
  const url = payload.fcmOptions?.link || payload.data?.click_action;

  // Show only toast notification when app is in foreground
  // This prevents duplicate notifications
  toast.info(`${title}: ${body}`, {
    duration: 5000,
    action: {
      label: "View",
      onClick: (): void => {
        // Handle notification click - navigate to relevant page
        if (url && typeof url === "string") {
          window.open(url, "_blank");
        }
      },
    },
  });
});

// Utility function to check if push notifications are enabled
export function isPushNotificationEnabled(): boolean {
  return Notification.permission === "granted";
}

// Utility function to get current notification permission
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission;
}

// Function to disable notifications (remove token from backend)
export async function disablePushNotifications(): Promise<void> {
  try {
    // Remove from localStorage
    localStorage.removeItem("fcm_token");

    // Token removal should be handled by your component/mutation
    console.log(
      "FCM token removed locally - handle backend removal in component",
    );
    toast.success("Push notifications disabled");
  } catch (error) {
    console.error("Failed to disable push notifications:", error);
    toast.error("Failed to disable notifications");
  }
}

// Initialize push notifications (call this when user logs in or on app start)
export async function initializePushNotifications(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.log("Push notifications not supported");
    return false;
  }

  try {
    if (Notification.permission === "granted") {
      const token = await requestFCMToken();
      if (token) {
        // Check for token updates periodically
        window.setTimeout(() => void checkTokenRefresh(), 5000);
        return true;
      }
    }
  } catch (error) {
    console.error("Failed to initialize push notifications:", error);
  }

  return false;
}

// Call this when app becomes visible again (for token refresh checking)
export function setupTokenRefreshChecking(): () => void {
  // Check token when page becomes visible
  const handleVisibilityChange = (): void => {
    if (!document.hidden && isPushNotificationEnabled()) {
      void checkTokenRefresh();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Check token periodically (every 24 hours)
  const intervalId: number = window.setInterval(
    () => {
      if (isPushNotificationEnabled()) {
        void checkTokenRefresh();
      }
    },
    24 * 60 * 60 * 1000,
  ); // 24 hours

  // Return cleanup function for component unmounting
  return (): void => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.clearInterval(intervalId);
  };
}
