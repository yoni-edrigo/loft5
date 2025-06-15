"use client";

import { useTheme } from "next-themes";
import { Link } from "@tanstack/react-router";

export default function Footer() {
  const { theme } = useTheme();

  const loftName = "לופט 5";
  const currentYear = new Date().getFullYear();

  // Add classes conditionally based on theme to ensure readability in both modes
  const footerBgClass = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const footerTextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const footerLinkClass =
    theme === "dark"
      ? "text-white hover:text-blue-300"
      : "text-primary hover:text-blue-600";

  return (
    <footer className={`py-10 ${footerBgClass} ${footerTextClass}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{loftName}</h3>
            <p className="mb-2">{'רחוב 8, א"ת קצרין'}</p>
            <p className="mb-2">{"052-440-0382"}</p>
            <p>{"info@loft5.co.il"}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">עקבו אחרינו</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61574237283112"
                className={`${footerLinkClass}`}
              >
                פייסבוק
              </a>
              <a
                href="https://www.instagram.com/loft5_katzrin"
                className={`${footerLinkClass}`}
              >
                אינסטגרם
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-center sm:text-right">
              © {currentYear} {loftName}. כל הזכויות שמורות.
            </p>

            <div className="flex gap-4 text-sm">
              <Link
                to="/terms"
                className={`${footerLinkClass} hover:underline`}
              >
                תקנון אתר
              </Link>
              <Link
                to="/accessibility"
                className={`${footerLinkClass} hover:underline`}
              >
                מדיניות נגישות
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
