import React, { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import IconPicker from "@/components/icon-picker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { icons } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Use the generated type for a service document
export type ServiceDoc = Doc<"services">;

export function ServicesControl() {
  const services =
    useQuery(api.services.getServices, { onlyVisible: false }) || [];
  const setService = useMutation(api.services.setService);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceDoc> | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addIconPickerOpen, setAddIconPickerOpen] = useState(false);

  // For adding new service
  const [form, setForm] = useState<Partial<ServiceDoc>>({
    key: "",
    title: "",
    description: "",
    icon: "",
    order: 0,
    visible: true,
  });

  // Utility to pick only allowed fields for setService
  function pickServiceFields(obj: Partial<ServiceDoc>) {
    return {
      key: obj.key!,
      title: obj.title!,
      description: obj.description!,
      icon: obj.icon!,
      order: obj.order,
      visible: obj.visible,
    };
  }

  const startEdit = (service: ServiceDoc) => {
    setEditingKey(service.key);
    setEditForm({ ...service });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditForm(null);
  };

  const saveEdit = useCallback(async () => {
    if (!editForm) return;
    await setService({
      ...pickServiceFields(editForm),
      order: Number(editForm.order),
    });
    setEditingKey(null);
    setEditForm(null);
  }, [editForm, setService]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditForm((f) => ({
      ...f!,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const columnHelper = createColumnHelper<ServiceDoc>();
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "icon",
        header: () => "אייקון",
        cell: ({ row }) => {
          const iconName = row.original.icon;
          const ServiceIcon = iconName && icons[iconName as keyof typeof icons];
          if (editingKey === row.original.key) {
            return (
              <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="icon">
                    {ServiceIcon ? <ServiceIcon size={20} /> : <span>בחר</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-2">
                  <IconPicker
                    selectedIcon={editForm?.icon || ""}
                    setSelectedIcon={(icon) => {
                      setEditForm((f) => ({ ...f!, icon }));
                      setIconPickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            );
          }
          return ServiceIcon ? <ServiceIcon size={20} /> : null;
        },
      }),
      columnHelper.accessor("title", {
        header: () => "כותרת",
        cell: ({ row }) =>
          editingKey === row.original.key ? (
            <Input
              name="title"
              value={editForm?.title || ""}
              onChange={handleEditChange}
            />
          ) : (
            row.original.title
          ),
      }),
      columnHelper.accessor("key", {
        header: () => "מפתח",
        cell: ({ row }) => row.original.key,
      }),
      columnHelper.accessor("description", {
        header: () => "תיאור",
        cell: ({ row }) =>
          editingKey === row.original.key ? (
            <Textarea
              name="description"
              value={editForm?.description || ""}
              onChange={handleEditChange}
              className="min-w-[120px]"
            />
          ) : (
            <span
              title={row.original.description}
              className="max-w-xs truncate inline-block"
            >
              {row.original.description}
            </span>
          ),
      }),
      columnHelper.accessor("order", {
        header: () => "סדר",
        cell: ({ row }) =>
          editingKey === row.original.key ? (
            <Input
              name="order"
              type="number"
              value={editForm?.order ?? 0}
              onChange={handleEditChange}
              className="w-16"
            />
          ) : (
            row.original.order
          ),
      }),
      columnHelper.display({
        id: "visible",
        header: () => "גלוי",
        cell: ({ row }) =>
          editingKey === row.original.key ? (
            <Switch
              checked={!!editForm?.visible}
              onCheckedChange={(checked) =>
                setEditForm((f) => ({ ...f!, visible: checked }))
              }
            />
          ) : (
            <Switch checked={row.original.visible ?? false} disabled />
          ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => "עריכה",
        cell: ({ row }) =>
          editingKey === row.original.key ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  void saveEdit();
                }}
              >
                שמור
              </Button>
              <Button size="sm" variant="secondary" onClick={cancelEdit}>
                ביטול
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => startEdit(row.original)}
            >
              ערוך
            </Button>
          ),
      }),
    ],
    [editingKey, editForm, iconPickerOpen, columnHelper, saveEdit],
  );

  const table = useReactTable({
    data: services,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  const SelectedIcon = form.icon && icons[form.icon as keyof typeof icons];

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    await setService({ ...pickServiceFields(form), order: Number(form.order) });
    setForm({
      key: "",
      title: "",
      description: "",
      icon: "",
      order: 0,
      visible: true,
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ניהול כרטיסי שירות</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">הוסף שירות חדש</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת שירות חדש</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddService(e);
              }}
              className="space-y-4"
            >
              <Input
                name="key"
                value={form.key || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, key: e.target.value }))
                }
                placeholder="מפתח ייחודי"
                required
              />
              <Input
                name="title"
                value={form.title || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="כותרת"
                required
              />
              <Textarea
                name="description"
                value={form.description || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="תיאור"
                required
                className="min-w-[180px]"
              />
              <div>
                <span className="block text-xs mb-1">אייקון</span>
                <Popover
                  open={addIconPickerOpen}
                  onOpenChange={setAddIconPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2 min-w-[90px]"
                    >
                      {SelectedIcon && (
                        <SelectedIcon size={18} className="mr-1" />
                      )}
                      {form.icon ? (
                        <span className="capitalize">{form.icon}</span>
                      ) : (
                        <span>בחר אייקון</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-2">
                    <IconPicker
                      selectedIcon={form.icon || ""}
                      setSelectedIcon={(icon) => {
                        setForm((f) => ({ ...f, icon }));
                        setAddIconPickerOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                name="order"
                type="number"
                value={form.order ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: Number(e.target.value) }))
                }
                placeholder="סדר"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!form.visible}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, visible: checked }))
                  }
                  id="visible-switch"
                />
                <label htmlFor="visible-switch" className="text-sm">
                  גלוי
                </label>
              </div>
              <DialogFooter>
                <Button type="submit" variant="default">
                  הוסף
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    ביטול
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded shadow bg-card">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 text-right">
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
              <tr key={row.id} className="border-b last:border-b-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
