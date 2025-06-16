import React from "react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "@tanstack/react-router";

interface RoleGuardProps {
  requiredRoles: string[];
  fallbackRoute?: string;
  children: React.ReactNode;
}

export function RoleGuard({
  requiredRoles,
  fallbackRoute,
  children,
}: RoleGuardProps) {
  const roles = useUserRoles();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (roles && !requiredRoles.some((role) => roles.includes(role))) {
      if (fallbackRoute) {
        void navigate({ to: fallbackRoute, search: {} });
      }
    }
  }, [roles, requiredRoles, fallbackRoute, navigate]);

  if (!roles) return null; // or a spinner
  if (!requiredRoles.some((role) => roles.includes(role))) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-red-600">
        אין לך הרשאה לדף זה. אנא פנה למנהל המערכת.
      </div>
    );
  }
  return <>{children}</>;
}
