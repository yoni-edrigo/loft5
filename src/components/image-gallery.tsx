"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useInView } from "react-intersection-observer";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop",
    alt: "אירוע חגיגי עם אנשים מרימים כוסות",
    title: "אירועים חגיגיים",
  },
  {
    src: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop",
    alt: "חלל מעוצב עם תאורה אווירתית",
    title: "עיצוב ייחודי",
  },
  {
    src: "https://plus.unsplash.com/premium_photo-1671580671733-92d038f1ea97?q=80&w=2070&auto=format&fit=crop",
    alt: "אזור ישיבה מעוצב",
    title: "אזורי ישיבה",
  },
  {
    src: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2070&auto=format&fit=crop",
    alt: "אווירה מושלמת למסיבות",
    title: "אווירת מסיבה",
  },
  {
    src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop",
    alt: "אירוע חגיגי נוסף",
    title: "אירועים מיוחדים",
  },
  {
    src: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop",
    alt: "חלל מעוצב נוסף",
    title: "עיצוב פנים",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ImageGallery() {
  const galleryImages = useQuery(api.office_images.getOfficeImages, {
    inGallery: true,
    visible: true,
  }) as (Doc<"officeImages"> & { url?: string })[] | undefined;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const images =
    galleryImages && galleryImages.length > 0
      ? galleryImages.map((img) =>
          "url" in img ? (img as any).url : undefined,
        )
      : GALLERY_IMAGES.map((img) => img.src);

  return (
    <>
      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        {images.map((src, index) => (
          <motion.div
            key={index}
            variants={item}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="overflow-hidden rounded-lg shadow-md"
          >
            <div
              className="relative cursor-pointer h-48 sm:h-64"
              onClick={() => setSelectedImage(src)}
            >
              <img
                src={src || "/placeholder.svg"}
                alt={
                  (galleryImages && galleryImages[index]?.alt) ||
                  GALLERY_IMAGES[index]?.alt
                }
                className="w-full h-full object-cover"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
              >
                <span className="text-white text-base sm:text-lg font-medium">
                  {(galleryImages && galleryImages[index]?.alt) ||
                    GALLERY_IMAGES[index]?.title}
                </span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl p-0">
          <span className="sr-only">
            <DialogTitle>תמונה מוגדלת</DialogTitle>
          </span>
          {selectedImage && (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={selectedImage}
              alt="תמונה מוגדלת"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
