import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
      { label: "מחירים", href: "/site-control", search: { tab: "pricing" } },
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
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
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {filteredLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      {link.submenu && link.items ? (
                        <>
                          <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                            {link.label}
                          </div>
                          <ul>
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
                        </>
                      ) : (
                        <Link
                          to={link.href}
                          search={link.search}
                          className="block w-full py-1.5 px-2 text-muted-foreground hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
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
