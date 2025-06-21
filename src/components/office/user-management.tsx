import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { Button } from "@/components/ui/button";
import { Pencil, X, Trash2, Save } from "lucide-react";
import { useState } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";

export function UserManagement() {
  const users = useQuery(api.user_roles.getAllUsers);
  const setUserRoles = useMutation(api.user_roles.setUserRoles);
  const deleteUserAndData = useMutation(api.user_roles.deleteUserAndData);
  const [editRow, setEditRow] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, Option[]>>(
    {},
  );
  const [localLoading, setLocalLoading] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleStartEdit = (userId: string, roles: string[] | undefined) => {
    setPendingRoles((prev) => ({
      ...prev,
      [userId]:
        roles
          ?.filter((r): r is Option["value"] =>
            ["MANAGER", "DESIGNER", "GUEST"].includes(r as any),
          )
          .map((r) => ({ label: r, value: r })) ?? [],
    }));
    setEditRow(userId);
  };

  const handleCancelEdit = () => {
    setEditRow(null);
  };

  const handleSaveEdit = async (userId: Id<"users">) => {
    setLocalLoading(userId);
    const roles = (pendingRoles[userId]?.map((o) => o.value) ?? []).filter(
      (r): r is "MANAGER" | "DESIGNER" | "GUEST" =>
        ["MANAGER", "DESIGNER", "GUEST"].includes(r as any),
    );
    await setUserRoles({ userId, roles });
    setEditRow(null);
    setLocalLoading(null);
  };

  const handleDelete = async (userId: Id<"users">) => {
    setLocalLoading(userId);
    await deleteUserAndData({ userId });
    setLocalLoading(null);
  };

  // Hebrew labels and color classes for roles
  const ROLE_LABELS: Record<string, string> = {
    MANAGER: "מנהל/ת",
    DESIGNER: "מעצב/ת",
    GUEST: "אורח/ת",
    ADMIN: "מנהל/ת ראשי/ת",
  };
  const ROLE_COLORS: Record<string, string> = {
    MANAGER: "bg-blue-100 text-blue-800 border-blue-300",
    DESIGNER: "bg-green-100 text-green-800 border-green-300",
    GUEST: "bg-gray-100 text-gray-800 border-gray-300",
    ADMIN: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  // Table columns definition
  const columnHelper = createColumnHelper<Doc<"users">>();
  const columns: ColumnDef<Doc<"users">, any>[] = [
    columnHelper.accessor("name", {
      header: () => "שם",
      cell: (info) =>
        info.getValue() || info.row.original.email || info.row.original._id,
    }),
    columnHelper.accessor("email", {
      header: () => "אימייל",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "roles",
      header: () => "הרשאות",
      cell: ({ row }) => {
        const user = row.original;
        if (user.roles?.includes("ADMIN")) {
          return (
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${ROLE_COLORS.ADMIN}`}
            >
              {ROLE_LABELS.ADMIN}
            </span>
          );
        }
        if (editRow === user._id) {
          return (
            <MultipleSelector
              value={pendingRoles[user._id] || []}
              options={[
                { label: ROLE_LABELS.MANAGER, value: "MANAGER" },
                { label: ROLE_LABELS.DESIGNER, value: "DESIGNER" },
                { label: ROLE_LABELS.GUEST, value: "GUEST" },
              ]}
              disabled={localLoading === user._id}
              onChange={(opts) =>
                setPendingRoles((prev) => ({ ...prev, [user._id]: opts }))
              }
            />
          );
        }
        // Show colored tags for each role
        return (
          <div className="flex gap-1 flex-wrap">
            {(
              user.roles?.filter((r): r is "MANAGER" | "DESIGNER" | "GUEST" =>
                ["MANAGER", "DESIGNER", "GUEST"].includes(r as any),
              ) ?? []
            ).map((r) => (
              <span
                key={r}
                className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${ROLE_COLORS[r]}`}
              >
                {ROLE_LABELS[r]}
              </span>
            ))}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => "פעולות",
      cell: ({ row }) => {
        const user = row.original;
        if (user.roles?.includes("ADMIN")) return null;
        if (editRow === user._id) {
          return (
            <div className="flex gap-2 justify-center">
              <Button
                variant="ghost"
                size="icon"
                disabled={
                  localLoading === user._id ||
                  (() => {
                    const original = (
                      user.roles?.filter((r: string) =>
                        ["MANAGER", "DESIGNER", "GUEST"].includes(r),
                      ) ?? []
                    ).sort();
                    const current = (
                      pendingRoles[user._id]?.map((o) => o.value) ?? []
                    ).sort();
                    return (
                      original.length === current.length &&
                      original.every((v, i) => v === current[i])
                    );
                  })()
                }
                onClick={() => {
                  void handleSaveEdit(user._id);
                }}
              >
                <Save className="w-4 h-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={localLoading === user._id}
                onClick={handleCancelEdit}
              >
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex gap-2 justify-center">
            <Button
              variant="ghost"
              size="icon"
              disabled={localLoading === user._id}
              onClick={() => handleStartEdit(user._id, user.roles)}
            >
              <Pencil className="w-4 h-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={localLoading === user._id}
              onClick={() => {
                void handleDelete(user._id);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: users ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
  });

  if (!users) return <div>טוען משתמשים...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-center border-b pb-4">
        ניהול משתמשים
      </h2>
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="rounded border bg-white dark:bg-zinc-900 p-4 flex flex-col gap-2 shadow"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  {user.name || user.email || user._id}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {user.email}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 flex-wrap">
                {(
                  user.roles?.filter((r) =>
                    ["MANAGER", "DESIGNER", "GUEST"].includes(r),
                  ) ?? []
                ).map((r) => (
                  <span key={r} className="truncate max-w-[60px] block">
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold border w-full truncate max-w-[60px]">
                      {ROLE_LABELS[r]}
                    </span>
                  </span>
                ))}
                {user.roles?.includes("ADMIN") && (
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold border bg-yellow-100 text-yellow-800 border-yellow-300 w-full truncate max-w-[60px]">
                    {ROLE_LABELS.ADMIN}
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {user.roles?.includes("ADMIN") ? null : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(user._id, user.roles)}
                      disabled={localLoading === user._id}
                    >
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        void handleDelete(user._id);
                      }}
                      disabled={localLoading === user._id}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
              {editRow === user._id && (
                <div className="mt-2 flex flex-col gap-2">
                  <MultipleSelector
                    value={pendingRoles[user._id] || []}
                    options={[
                      { label: ROLE_LABELS.MANAGER, value: "MANAGER" },
                      { label: ROLE_LABELS.DESIGNER, value: "DESIGNER" },
                      { label: ROLE_LABELS.GUEST, value: "GUEST" },
                    ]}
                    disabled={localLoading === user._id}
                    onChange={(opts) =>
                      setPendingRoles((prev) => ({ ...prev, [user._id]: opts }))
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        void handleSaveEdit(user._id);
                      }}
                      disabled={localLoading === user._id}
                    >
                      <Save className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
                      disabled={localLoading === user._id}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border bg-white dark:bg-zinc-900">
          <table className="min-w-full text-right border-separate border-spacing-0">
            <thead className="bg-zinc-100 dark:bg-zinc-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200 border-b"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="align-middle">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border px-4 py-2 whitespace-nowrap text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
