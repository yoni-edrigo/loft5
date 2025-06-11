import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  requestFCMToken,
  checkTokenRefresh,
  setupTokenRefreshChecking,
} from "@/firebase";
import { toast } from "sonner";

export function FcmTokenRegistrar() {
  const addFcmToken = useMutation(api.set_functions.addFcmToken);

  useEffect(() => {
    async function setupFCM() {
      // Request permission if not already set
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission not granted");
          return;
        }
      }

      // Check if we already have a token for this device
      const existingToken = localStorage.getItem("fcm_token");
      if (existingToken) {
        console.log("Using existing FCM token");
        // Re-register the existing token to ensure it's still valid
        await addFcmToken({ token: existingToken });

        // Also check if token needs refresh
        await checkTokenRefresh();
        return;
      }

      // If no token exists for this device, request a new one
      console.log("Requesting new FCM token");
      const token = await requestFCMToken();
      if (token) {
        console.log("Registering new FCM token");
        // Register token with backend
        await addFcmToken({ token });
        // Store in localStorage to remember this device has a token
        localStorage.setItem("fcm_token", token);
        toast.success("Notifications enabled", { id: "notifications-setup" });
      }
    }

    // Set up token refresh monitoring
    const cleanup = setupTokenRefreshChecking();

    // Initial setup
    setupFCM().catch((error) => {
      console.error("FCM setup error:", error);
      toast.error("Failed to setup notifications", {
        id: "notifications-error",
      });
    });

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [addFcmToken]); // Include addFcmToken in dependencies

  return null;
}
