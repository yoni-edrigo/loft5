import BookingCalendar from "@/components/booking-calendar";
import BookingOptions from "@/components/booking-options";
import BookingSummary from "@/components/booking-summary";
import ImageGallery from "@/components/image-gallery";
import { Toaster } from "@/components/ui/sonner";
import FloatingOfficeButton from "@/components/floating-office-button";
import Hero from "./components/hero";
import Footer from "./components/footer";
import { ServicesCarousel } from "./components/services-carousel";

export default function LandingPageV2() {
  return (
    <>
      <Hero />
      <ServicesCarousel />
      <section
        id="calendar"
        className="py-12 sm:py-20 px-3 sm:px-4 md:px-8 bg-gradient-to-b from-muted to-background"
      >
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4">
            בחר תאריך ושעות
          </h2>
          <p className="text-center text-muted-foreground mb-6 sm:mb-10 max-w-2xl mx-auto text-sm sm:text-base">
            בחר את התאריך והשעות המועדפים עליך. אירועי צהריים מתאימים עד 25 איש,
            אירועי ערב ללא הגבלה.
          </p>
          <BookingCalendar />
        </div>
      </section>

      <section id="options" className="py-10 sm:py-16 px-3 sm:px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                התאם את האירוע
              </h2>
              <BookingOptions />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                סיכום מחיר
              </h2>
              <BookingSummary />
            </div>
          </div>
        </div>
      </section>

      <section
        id="gallery"
        className="py-10 sm:py-16 px-3 sm:px-4 md:px-8 bg-muted"
      >
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
            גלריית תמונות
          </h2>
          <ImageGallery />
        </div>
      </section>

      <FloatingOfficeButton />
      <Toaster />

      <Footer />
    </>
  );
}
