"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Briefcase } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function FloatingOfficeButton() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const handleClick = () =>
    void navigate({
      to: "/office",
      search: { tab: "pending", bookingId: undefined },
    });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        className="relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.9 }}
      >
        <motion.button
          className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary text-secondary-foreground shadow-lg cursor-pointer"
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          aria-label="Office Management - Navigate to office management page"
          title="Office Management - Navigate to office management page"
        >
          <Briefcase className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">Office Management</span>
        </motion.button>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute top-1/2 right-full -translate-y-1/2 mr-2 whitespace-nowrap"
            >
              <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md shadow-md text-sm">
                משרד
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
