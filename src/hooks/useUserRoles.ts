import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUserRoles(): string[] | undefined {
  const roles = useQuery(api.auth.getUserRoles, {});
  return roles;
}
