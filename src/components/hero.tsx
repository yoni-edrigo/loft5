"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Default photos if config.photos is undefined
  const photos = [
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop",
  ];

  // Carousel animation

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === currentIndex || photos.length === 0) return;

      setIsAnimating(true);
      setCurrentIndex(index);

      // Reset animation state after transition
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    },
    [currentIndex, isAnimating, photos.length],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating && photos.length > 0) {
        goToSlide((currentIndex + 1) % photos.length);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex, goToSlide, isAnimating, photos.length]);

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center text-white overflow-hidden">
      {/* Carousel Images */}
      {photos.length > 0 && (
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${photos[currentIndex]}')`,
              zIndex: 0,
            }}
          />
        </AnimatePresence>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Carousel Indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2 rtl:flex-row-reverse">
          {photos.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-secondary w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-3 sm:px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="backdrop-blur-sm bg-black/30 p-4 sm:p-8 rounded-lg"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold mb-2 sm:mb-4 text-white"
          >
            {"לופט 5"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-8 text-white"
          >
            {"לופט מרווח ומודרני במרכז העיר"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 animate-scale"
              onClick={() =>
                document
                  .getElementById("calendar")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              שכור עכשיו
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
