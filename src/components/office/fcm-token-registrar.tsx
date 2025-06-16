import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  requestFCMToken,
  checkTokenRefresh,
  setupTokenRefreshChecking,
} from "@/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function FcmTokenRegistrar() {
  const addFcmToken = useMutation(api.set_functions.addFcmToken);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  // Check if the app is already installed using multiple detection methods
  useEffect(() => {
    const checkInstallState = () => {
      // Method 1: Check display-mode (traditional approach)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;

      // Method 2: Check navigator.standalone (iOS Safari)
      const isIOSInstalled = (window.navigator as any).standalone === true;

      // Method 3: Check if the app was launched from the installed app
      const isLaunchedFromInstalledApp =
        document.referrer.includes("android-app://");

      // Method 4: Check for PWA-specific launch parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      const launchedAsPWA =
        urlParams.has("pwa") ||
        (urlParams.has("source") && urlParams.get("source") === "pwa");

      // Method 5: Check for 'appinstalled' event in sessionStorage
      const wasInstalled = sessionStorage.getItem("pwa_installed") === "true";

      // Set installed state if any method indicates installation
      setIsInstalled(
        isStandalone ||
          isIOSInstalled ||
          isLaunchedFromInstalledApp ||
          launchedAsPWA ||
          wasInstalled,
      );
    };

    // Initial check
    checkInstallState();

    // Check on display mode changes
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
      checkInstallState();
    };
    displayModeQuery.addEventListener("change", handleDisplayModeChange);

    // Listen for the 'appinstalled' event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      sessionStorage.setItem("pwa_installed", "true");
      // If the user installs while using the app, show a toast
      toast.success("App successfully installed!");
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      displayModeQuery.removeEventListener("change", handleDisplayModeChange);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Capture the install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  // Handle the install action
  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      toast.success("Thanks for installing Loft5!");
      setInstallPrompt(null);
    } else {
      toast.info("Installation deferred");
    }
  };

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
      const lastSentToken = localStorage.getItem("fcm_token_last_sent");
      if (existingToken) {
        console.log("Using existing FCM token");
        // Only send to backend if not sent before
        if (existingToken !== lastSentToken) {
          await addFcmToken({ token: existingToken });
          localStorage.setItem("fcm_token_last_sent", existingToken);
        }
        // Also check if token needs refresh
        await checkTokenRefresh();
        return;
      }

      // If no token exists for this device, request a new one
      console.log("Requesting new FCM token");
      const token = await requestFCMToken();
      if (token) {
        console.log("Registering new FCM token");
        // Only send to backend if not sent before
        if (token !== lastSentToken) {
          await addFcmToken({ token });
          localStorage.setItem("fcm_token_last_sent", token);
        }
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
  }, [addFcmToken]); // Include addFcmToken in dependencies  return (

  return (
    <>
      {!isInstalled && installPrompt && (
        // Show install button if app is not installed and prompt is available
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={void handleInstallClick}
            className="shadow-lg flex items-center gap-2 bg-primary text-primary-foreground"
          >
            התקן את האפליקציה
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </Button>
        </div>
      )}
    </>
  );
}
