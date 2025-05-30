"use client";

import { useTheme } from "next-themes";

export default function Footer() {
  const { theme } = useTheme();

  const loftName = "לופט 5";
  const currentYear = new Date().getFullYear();

  // Add classes conditionally based on theme to ensure readability in both modes
  const footerBgClass = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const footerTextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const footerLinkClass =
    theme === "dark"
      ? "text-white hover:text-secondary"
      : "text-primary hover:text-secondary";

  return (
    <footer className={`py-10 ${footerBgClass} ${footerTextClass}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{loftName}</h3>
            <p className="mb-2">{"רחוב הדוגמה 5, תל אביב"}</p>
            <p className="mb-2">{"03-1234567"}</p>
            <p>{"info@loft5.co.il"}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">שעות פעילות</h3>
            <p className="mb-2">ראשון - חמישי: 9:00 - 23:00</p>
            <p className="mb-2">שישי: 9:00 - 15:00</p>
            <p>שבת: סגור</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">עקבו אחרינו</h3>
            <div className="flex gap-4">
              <a href="#" className={`${footerLinkClass}`}>
                פייסבוק
              </a>
              <a href="#" className={`${footerLinkClass}`}>
                אינסטגרם
              </a>
              <a href="#" className={`${footerLinkClass}`}>
                טוויטר
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p>
            © {currentYear} {loftName}. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}
