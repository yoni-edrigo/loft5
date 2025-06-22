import { Home, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useUserRoles } from "@/hooks/useUserRoles";

const navigationLinks = [
  {
    label: "ניהול הזמנות",
    href: "/office",
    search: { tab: "pending" },
    submenu: true,
    items: [
      { label: "ממתינות לאישור", href: "/office", search: { tab: "pending" } },
      { label: "מאושרות", href: "/office", search: { tab: "approved" } },
      { label: "נדחו", href: "/office", search: { tab: "declined" } },
      { label: "הכל", href: "/office", search: { tab: "all" } },
    ],
    roles: ["MANAGER", "ADMIN"],
  },
  {
    label: "ניהול עיצוב",
    href: "/site-design",
    search: { tab: "pricing" },
    submenu: true,
    items: [
      { label: "שירותים", href: "/site-design", search: { tab: "services" } },
      { label: "תמונות", href: "/site-design", search: { tab: "images" } },
    ],
    roles: ["DESIGNER", "ADMIN"],
  },
  {
    label: "ניהול אתר",
    href: "/site-control",
    search: { tab: "pricing" },
    submenu: true,
    items: [
      { label: "מוצרים", href: "/site-control", search: { tab: "products" } },
      { label: "משתמשים", href: "/site-control", search: { tab: "users" } },
    ],
    roles: ["ADMIN"],
  },
];

export function OfficeNavbar() {
  const { signOut } = useAuthActions();
  const roles = useUserRoles();
  const filteredLinks = roles
    ? navigationLinks.filter((link) =>
        link.roles.some((r) => roles.includes(r)),
      )
    : [];

  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
                aria-label="פתח תפריט ניווט"
                aria-expanded="false"
                aria-controls="mobile-navigation-menu"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
                <span className="sr-only">פתח תפריט ניווט</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-64 p-4 md:hidden"
              id="mobile-navigation-menu"
            >
              <div className="mb-4">
                <Link to="/" className="flex items-center gap-2">
                  <img
                    src="/loft5-logo.png"
                    alt="Loft 5"
                    className="h-8 w-auto"
                  />
                  <span className="text-lg font-semibold">Loft 5</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-1">
                {filteredLinks.map((link) =>
                  link.submenu && link.items ? (
                    <Collapsible key={link.label}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium hover:bg-accent">
                        {link.label}
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="flex flex-col pt-1 pl-7">
                          {link.items.map((item) => (
                            <li key={item.label}>
                              <Link
                                to={item.href}
                                search={item.search}
                                className="block rounded-md py-2 px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Link
                      to={link.href}
                      search={link.search}
                      key={link.label}
                      className="block rounded-md px-3 py-2 font-medium hover:bg-accent"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            </SheetContent>
          </Sheet>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-primary hover:text-primary/90">
              <Home className="h-7 w-7" aria-label="Home" />
            </Link>
            <NavigationMenu viewport={false} className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {filteredLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    {link.submenu && link.items ? (
                      <>
                        <NavigationMenuTrigger className="text-muted-foreground hover:text-primary bg-transparent px-2 py-1.5 font-medium">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="min-w-48">
                            {link.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <Link
                                  to={item.href}
                                  search={item.search}
                                  className="block w-full py-1.5 px-4 text-muted-foreground hover:text-primary"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link
                        to={link.href}
                        search={link.search}
                        className="text-muted-foreground hover:text-primary py-1.5 font-medium"
                      >
                        {link.label}
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="text-sm"
            variant="destructive"
            onClick={() => void signOut()}
          >
            התנתק
          </Button>
        </div>
      </div>
    </header>
  );
}
