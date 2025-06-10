import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { requestFCMToken } from "@/firebase";

export function FcmTokenRegistrar() {
  const addFcmToken = useMutation(api.set_functions.addFcmToken);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      void Notification.requestPermission();
    }
    void requestFCMToken().then((token) => {
      if (token) {
        void addFcmToken({ token });
        console.log("FCM Token:", token);
      }
    });
  }, [addFcmToken]);

  return null;
}
