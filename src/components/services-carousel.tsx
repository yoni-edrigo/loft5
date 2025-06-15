import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { icons, Users } from "lucide-react";
import { useIsMobile } from "@/lib/utils";

// Use the generated type for a service document
export type ServiceDoc = Doc<"services">;

interface FeatureProps {
  position: number;
  index: number;
  title: string;
  description: string;
  Icon: React.ElementType;
}

const ServiceCard = ({
  position,
  index,
  title,
  description,
  Icon,
}: FeatureProps) => {
  const translateAmt =
    position >= index ? -index * 100 : -index * 100 + 100 * (index - position);

  return (
    <motion.div
      animate={{ x: `${-translateAmt}%` }}
      transition={{
        ease: "easeInOut",
        duration: 0.35,
      }}
      className={`relative flex min-h-[280px] w-10/12 max-w-lg shrink-0 flex-col justify-between overflow-hidden p-8 rounded-lg md:w-3/5 ${
        index % 2
          ? "bg-primary text-primary-foreground"
          : "bg-card text-card-foreground border"
      }`}
      role="group"
      aria-roledescription="slide"
      aria-label={title}
      tabIndex={0}
    >
      <Icon
        className="absolute right-2 top-2 text-7xl opacity-20"
        aria-hidden="true"
        focusable="false"
      />
      <h3 className="mb-8 text-3xl font-bold text-right">{title}</h3>
      <p className="text-right leading-relaxed">{description}</p>
    </motion.div>
  );
};

export function ServicesCarousel() {
  const [position, setPosition] = useState(0);
  const isMobile = useIsMobile();

  // Fetch live services, only those visible
  const services: ServiceDoc[] =
    useQuery(api.services.getServices, {
      onlyVisible: true,
    })?.reverse() || [];

  const shiftLeft = () => {
    if (position < services.length - 1) {
      setPosition((pv) => pv + 1);
    }
  };

  const shiftRight = () => {
    if (position > 0) {
      setPosition((pv) => pv - 1);
    }
  };

  return (
    <section
      className="bg-gradient-to-b from-background to-muted/30 py-12 sm:py-20 overflow-clip"
      aria-label="שירותים בלופט 5"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex justify-between items-start gap-4">
          <div className="text-right">
            <h2
              className="text-4xl font-bold leading-[1.2] md:text-5xl mb-4"
              id="services-carousel-heading"
            >
              מה אנחנו מציעים
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              לופט 5 הוא מרחב אירוח יוקרתי ומעוצב, מושלם לכל סוג של אירוע או
              פעילות יצירתית
            </p>
          </div>
          {!isMobile && (
            <nav className="flex gap-2 shrink-0" aria-label="החלפת שירותים">
              <button
                className="h-fit bg-primary p-4 text-2xl text-primary-foreground transition-colors hover:bg-primary/80 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={shiftLeft}
                disabled={position >= services.length - 1}
                aria-label="הצג שירות קודם"
                aria-controls="services-carousel-slides"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                className="h-fit bg-primary p-4 text-2xl text-primary-foreground transition-colors hover:bg-primary/80 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={shiftRight}
                disabled={position <= 0}
                aria-label="הצג שירות הבא"
                aria-controls="services-carousel-slides"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </nav>
          )}
        </div>

        <div
          className="flex gap-4 direction-rtl"
          id="services-carousel-slides"
          role="region"
          aria-labelledby="services-carousel-heading"
          aria-live="polite"
        >
          {services.map((service, index) => {
            // Map icon string to LucideIcon
            const Icon =
              service.icon && icons[service.icon as keyof typeof icons]
                ? icons[service.icon as keyof typeof icons]
                : Users;
            return (
              <ServiceCard
                key={service.key || index}
                position={position}
                index={index}
                title={service.title}
                description={service.description}
                Icon={Icon}
              />
            );
          })}
        </div>

        <div
          className="flex justify-center mt-8 gap-2"
          role="tablist"
          aria-label="בחירת שירות"
        >
          {isMobile && (
            <nav
              className="flex items-center gap-4 shrink-0"
              aria-label="החלפת שירותים"
            >
              <button
                className="h-7 w-7 bg-primary p-0 flex items-center justify-center text-lg text-primary-foreground transition-colors hover:bg-primary/80 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={shiftRight}
                disabled={position <= 0}
                aria-label="הצג שירות הבא"
                aria-controls="services-carousel-slides"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <div className="flex gap-2 my-1">
                {services.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === position ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => setPosition(index)}
                    aria-label={`עבור לשירות מספר ${index + 1}`}
                    aria-selected={index === position}
                    role="tab"
                    tabIndex={index === position ? 0 : -1}
                  />
                ))}
              </div>
              <button
                className="h-7 w-7 bg-primary p-0 flex items-center justify-center text-lg text-primary-foreground transition-colors hover:bg-primary/80 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={shiftLeft}
                disabled={position >= services.length - 1}
                aria-label="הצג שירות קודם"
                aria-controls="services-carousel-slides"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
