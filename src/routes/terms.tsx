import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsComponent,
});

function TermsComponent() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl" dir="rtl">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            חזרה לעמוד הבית
          </Button>
        </Link>
      </div>{" "}
      <h1 className="text-4xl font-bold text-center mb-8">תקנון אתר</h1>
      <Card>
        <CardHeader>
          <p className="text-center text-muted-foreground text-lg">
            תקנון שימוש באתר לופט 5
          </p>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none" dir="rtl">
          <div className="space-y-6 text-right">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. כללי</h2>
              <p className="mb-4">
                ברוכים הבאים לאתר לופט 5. תקנון זה מגדיר את תנאי השימוש באתר
                ובשירותים המוצעים בו. השימוש באתר מהווה הסכמה מלאה לתקנון זה.
              </p>
              <p>
                החברה שומרת לעצמה את הזכות לעדכן תקנון זה מעת לעת, והשימוש
                המתמשך באתר מהווה הסכמה לעדכונים אלו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. השירות</h2>
              <p className="mb-4">
                לופט 5 מספק שירותי השכרת חלל אירועים ומתקנים נלווים. השירותים
                כוללים:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>השכרת חלל לאירועים פרטיים</li>
                <li>שירותי קריוקי</li>
                <li>שירותי צילום</li>
                <li>שירותי קיטרינג</li>
                <li>משקאות וחטיפים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. הזמנות וביטולים
              </h2>
              <p className="mb-4">
                כל הזמנה דרך האתר כפופה לאישור מצידנו. ההזמנה תחשב כמאושרת רק
                לאחר קבלת אישור מפורש.
              </p>
              <p className="mb-4">ביטול הזמנה:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>עד 48 שעות לפני האירוע - ללא תשלום</li>
                <li>24-48 שעות לפני האירוע - תשלום 50% מעלות ההזמנה</li>
                <li>פחות מ-24 שעות - תשלום מלא</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. תשלומים</h2>
              <p className="mb-4">
                התשלום מתבצע בהתאם למחירון הקיים באתר. המחירים כוללים מע"ם אלא
                אם צוין אחרת.
              </p>
              <p>
                התשלום יתבצע במזומן, באשראי או בהעברה בנקאית בהתאם להסכמה מראש.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. אחריות ומגבלות</h2>
              <p className="mb-4">
                הלקוח אחראי לכל נזק שייגרם למתקן במהלך האירוע. החברה אינה אחראית
                לרכוש אישי של הלקוחים או אורחיהם.
              </p>
              <p>
                החברה שומרת לעצמה את הזכות לסרב לכל הזמנה או לבטל אירוע בנסיבות
                חריגות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. פרטיות</h2>
              <p>
                החברה מתחייבת לשמור על פרטיותכם ולא להעביר מידע אישי לצדדים
                שלישיים ללא הסכמתכם, למעט במקרים הנדרשים על פי חוק.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. סמכות שיפוט</h2>
              <p>
                כל מחלוקת הנובעת מתקנון זה תהיה בסמכותו הבלעדית של בית המשפט
                המוסמך בתל אביב.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. יצירת קשר</h2>
              <p>לשאלות או הבהרות בנוגע לתקנון זה, ניתן לפנות אלינו:</p>
              <div className="mt-4">
                <p>
                  <strong>טלפון:</strong> 052-440-0382
                </p>
                <p>
                  <strong>אימייל:</strong> info@loft5.co.il
                </p>
                <p>
                  <strong>כתובת:</strong> רחוב 8, א"ת קצרין
                </p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                תקנון זה נכנס לתוקף ביום 13.6.2025 ומעודכן אחרון פעם ביום זה.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
