import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { requestFCMToken } from "@/firebase";

export function FcmTokenRegistrar() {
  const addFcmToken = useMutation(api.set_functions.addFcmToken);

  useEffect(() => {
    async function setupFCM() {
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
      }

      const existingToken = localStorage.getItem("fcm_token");
      if (existingToken) return;

      const token = await requestFCMToken();
      if (token) {
        await addFcmToken({ token });
      }
    }

    setupFCM().catch(console.error);
  }, []); // Remove addFcmToken from deps

  return null;
}
