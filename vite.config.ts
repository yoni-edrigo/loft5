import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "Loft5",
        short_name: "Loft5",
        description: "Loft5 Event Booking Progressive Web App",
        theme_color: "#000000",
        categories: ["productivity", "business", "events", "booking"],
        lang: "he-IL",
        start_url: "/office",
        scope: "/",
        prefer_related_applications: false,
        shortcuts: [
          {
            name: "Bookings",
            short_name: "Bookings",
            description: "View and manage your bookings",
            url: "/office?tab=bookings",
            icons: [
              { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
            ],
          },
          {
            name: "Events",
            short_name: "Events",
            description: "Explore upcoming events",
            url: "/office?tab=events",
            icons: [
              { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
            ],
          },
        ],
        icons: [
          {
            src: "/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/mobile-loft-screenshot.png",
            sizes: "540x1170",
            type: "image/png",
            label: "Mobile view of Loft5 booking app",
          },
          {
            src: "/screenshots/pc-loft-screenshot.png",
            sizes: "1920x1080",
            type: "image/png",
            label: "Desktop view of Loft5 booking app",
            form_factor: "wide",
          },
        ],
      },
      // Add workbox configuration to handle firebase messaging
      workbox: {
        // Ensure firebase messaging service worker is imported
        importScripts: ["firebase-messaging-sw.js"],
        // Don't precache the firebase messaging service worker
        globIgnores: ["**/firebase-messaging-sw.js"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
