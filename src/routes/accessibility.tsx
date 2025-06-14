import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Eye, Keyboard, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/accessibility")({
  component: AccessibilityComponent,
});

function AccessibilityComponent() {
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
      <h1 className="text-4xl font-bold text-center mb-8">מדיניות נגישות</h1>
      <Card>
        <CardHeader>
          <p className="text-center text-muted-foreground text-lg">
            מחויבותנו לנגישות דיגיטלית ושוויון הזדמנויות
          </p>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none" dir="rtl">
          <div className="space-y-6 text-right">
            <section className="bg-primary/5 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">המחויבות שלנו</h2>
              </div>
              <p className="text-lg">
                לופט 5 מחויב לספק חוויית שימוש נגישה ושוויונית לכל המשתמשים,
                כולל אנשים עם מוגבלויות. אנו פועלים ברוח חוק שוויון זכויות
                לאנשים עם מוגבלות תשס"ח-2008 ותקנות הנגישות לשירותי אינטרנט
                תשע"ח-2018.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">תקני נגישות</h2>
              <p className="mb-4">
                האתר שלנו מיושם בהתאם לתקן הבינלאומי
                <Badge variant="secondary" className="mx-2">
                  WCAG 2.1 AA
                </Badge>
                (Web Content Accessibility Guidelines) ברמת AA.
              </p>
              <p>
                התקן מבטיח שהאתר נגיש למגוון רחב של משתמשים עם מוגבלויות שונות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                תכונות נגישות באתר
              </h2>
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-status-available mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">תמיכה בקוראי מסך</h3>
                    <p className="text-sm text-muted-foreground">
                      תמיכה מלאה בקוראי מסך כמו JAWS, NVDA ו-VoiceOver עם תוויות
                      ARIA מתאימות בעברית
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Keyboard className="h-5 w-5 text-status-available mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">ניווט במקלדת</h3>
                    <p className="text-sm text-muted-foreground">
                      כל הפונקציות זמינות באמצעות מקלדת בלבד עם סדר מיקוד לוגי
                      ונתיבי ניווט ברורים
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Eye className="h-5 w-5 text-status-available mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">ניגודיות צבעים</h3>
                    <p className="text-sm text-muted-foreground">
                      יחס ניגודיות של לפחות 4.5:1 בין טקסט לרקע בהתאם לתקן WCAG
                      2.1 AA
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-status-available mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">תוויות נגישות</h3>
                    <p className="text-sm text-muted-foreground">
                      כל הכפתורים, הקישורים והטפסים כוללים תוויות נגישות מתאימות
                      בעברית
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-status-available mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">תמיכה ב-RTL</h3>
                    <p className="text-sm text-muted-foreground">
                      עיצוב מותאם לכתיבה מימין לשמאל (RTL) עם תמיכה מלאה בעברית
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-status-available mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">מבנה סמנטי</h3>
                    <p className="text-sm text-muted-foreground">
                      שימוש ב-HTML סמנטי ומבנה תכנים היררכי לניווט קל ומובן
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                טכנולוגיות נגישות נתמכות
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">קוראי מסך</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm mr-4">
                    <li>JAWS (Windows)</li>
                    <li>NVDA (Windows)</li>
                    <li>VoiceOver (macOS/iOS)</li>
                    <li>TalkBack (Android)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">דפדפנים נתמכים</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm mr-4">
                    <li>Chrome 90+</li>
                    <li>Firefox 88+</li>
                    <li>Safari 14+</li>
                    <li>Edge 90+</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                שיפורי נגישות מתמשכים
              </h2>
              <p className="mb-4">
                אנו מתחייבים לשיפור מתמיד של הנגישות באתר שלנו:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>בדיקות נגישות קבועות עם משתמשים בעלי מוגבלויות</li>
                <li>עדכון תכנים והתאמתם לתקני נגישות מתקדמים</li>
                <li>הכשרת צוות הפיתוח בנושאי נגישות דיגיטלית</li>
                <li>מעקב אחר טכנולוגיות עזר חדשות והתאמת האתר אליהן</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                נגישות פיזית במתקן
              </h2>
              <p className="mb-4">
                מעבר לנגישות הדיגיטלית, המתקן הפיזי שלנו מותאם לאנשים עם
                מוגבלויות:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>כניסה נגישה ללא מדרגות</li>
                <li>שירותים מותאמים לכסא גלגלים</li>
                <li>מקומות חניה מיועדים לאנשים עם מוגבלות</li>
                <li>מסלולי תנועה רחבים ונגישים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                דיווח על בעיות נגישות
              </h2>
              <p className="mb-4">
                אם נתקלתם בבעיית נגישות באתר או זקוקים לסיוע, אנא פנו אלינו:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">רכז נגישות</h3>
                <p>
                  <strong>טלפון:</strong> 03-1234567
                </p>
                <p>
                  <strong>אימייל:</strong> accessibility@loft5.co.il
                </p>
                <p>
                  <strong>כתובת:</strong> רחוב הדוגמה 5, תל אביב
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  אנו מתחייבים להשיב תוך 48 שעות ולפתור בעיות נגישות בהקדם
                  האפשרי.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">הצהרת נגישות</h2>
              <p className="mb-4">
                הצהרת נגישות זו נכתבה ביום 13.6.2025 והיא מתעדכנת באופן קבוע.
                הערכת הנגישות האחרונה בוצעה ביום זה ע"י מומחי נגישות דיגיטלית.
              </p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>סטטוס תאימות:</strong> תואם מלא לתקן WCAG 2.1 AA
                </p>
                <p className="text-sm mt-1">
                  <strong>תאריך הערכה אחרון:</strong> 13.6.2025
                </p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-status-available/10 border border-status-available/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-status-available" />
                <h3 className="font-semibold">אתר נגיש וזמין לכולם</h3>
              </div>
              <p className="text-sm">
                אנו גאים להציע חוויית שימוש נגישה ושוויונית לכל המשתמשים שלנו.
                הנגישות היא ערך מרכזי בפעילותנו ואנו ממשיכים לפעול לשיפורה.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
