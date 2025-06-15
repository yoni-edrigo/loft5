import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { AlertCircleIcon, UploadIcon, ImageIcon, XIcon } from "lucide-react";

export function OfficeImageUpload() {
  const images = useQuery(api.office_images.getOfficeImages) || [];
  const saveOfficeImage = useMutation(api.office_images.saveOfficeImage);
  const updateOfficeImage = useMutation(
    api.office_images_admin.updateOfficeImage,
  );
  const deleteOfficeImage = useMutation(
    api.office_images_admin.deleteOfficeImage,
  );
  const generateUploadUrl = useMutation(
    api.office_images.generateImageUploadUrl,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [addType, setAddType] = useState<"upload" | "external">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [visible, setVisible] = useState(true);
  const [inHeader, setInHeader] = useState(false);
  const [inGallery, setInGallery] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  // Table editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<any>(null);

  const [confirmDeleteId, setConfirmDeleteId] =
    useState<Id<"officeImages"> | null>(null);

  // Drag-and-drop state for upload
  const [isDragging, setIsDragging] = useState(false);
  const maxSizeMB = 2;
  const maxSize = maxSizeMB * 1024 * 1024;
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Helper to get image URL from officeImages (storageId or externalUrl or url field from server)
  function getImageUrl(img: any) {
    if (typeof img.url === "string" && img.url) return img.url;
    if ("externalUrl" in img && typeof img.externalUrl === "string")
      return img.externalUrl;
    if ("storageId" in img && img.storageId)
      return `/api/storage/${img.storageId}`;
    return "/placeholder.svg";
  }

  // Add new image handler
  async function handleAddImage(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setError(null);
    try {
      let altText = alt;
      if (!altText) {
        if (addType === "upload" && selectedFile) {
          altText = selectedFile.name;
        } else if (addType === "external" && externalUrl) {
          try {
            const urlObj = new URL(externalUrl);
            altText = urlObj.pathname.split("/").pop() || "תמונה";
          } catch {
            altText = "תמונה";
          }
        } else {
          altText = "תמונה";
        }
      }
      if (addType === "upload" && selectedFile) {
        const postUrl = await generateUploadUrl();
        console.log("Uploading file", selectedFile, "to", postUrl);
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        console.log("Upload result storageId", storageId);
        await saveOfficeImage({
          storageId,
          visible,
          inHeader,
          inGallery,
          alt: altText,
        });
      } else if (addType === "external" && externalUrl) {
        console.log("Saving external image", externalUrl);
        await saveOfficeImage({
          externalUrl,
          visible,
          inHeader,
          inGallery,
          alt: altText,
        });
      }
      setDialogOpen(false);
      setSelectedFile(null);
      setExternalUrl("");
      setAlt("");
      setVisible(true);
      setInHeader(false);
      setInGallery(true);
    } catch (err: any) {
      setError(err.message || "שגיאה בהעלאת התמונה");
      console.error("Image upload error", err);
    } finally {
      setUploading(false);
    }
  }

  // Table columns
  const columnHelper = createColumnHelper<any>();
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "preview",
        header: () => "תמונה",
        cell: ({ row }) => (
          <img
            src={getImageUrl(row.original)}
            alt={row.original.alt || ""}
            className="w-20 h-20 object-cover rounded"
          />
        ),
      }),
      columnHelper.accessor("alt", {
        header: () => "Alt",
        cell: ({ row }) =>
          editingId === row.original._id ? (
            <Input
              value={editRow?.alt || ""}
              onChange={(e) =>
                setEditRow((r: any) => ({ ...r, alt: e.target.value }))
              }
            />
          ) : (
            row.original.alt || ""
          ),
      }),
      columnHelper.display({
        id: "visible",
        header: () => "גלוי",
        cell: ({ row }) =>
          editingId === row.original._id ? (
            <Switch
              checked={!!editRow?.visible}
              onCheckedChange={(checked) =>
                setEditRow((r: any) => ({ ...r, visible: checked }))
              }
            />
          ) : (
            <Switch checked={row.original.visible ?? false} disabled />
          ),
      }),
      columnHelper.display({
        id: "inHeader",
        header: () => "בהדר",
        cell: ({ row }) =>
          editingId === row.original._id ? (
            <Switch
              checked={!!editRow?.inHeader}
              onCheckedChange={(checked) =>
                setEditRow((r: any) => ({ ...r, inHeader: checked }))
              }
            />
          ) : (
            <Switch checked={row.original.inHeader ?? false} disabled />
          ),
      }),
      columnHelper.display({
        id: "inGallery",
        header: () => "בגלריה",
        cell: ({ row }) =>
          editingId === row.original._id ? (
            <Switch
              checked={!!editRow?.inGallery}
              onCheckedChange={(checked) =>
                setEditRow((r: any) => ({ ...r, inGallery: checked }))
              }
            />
          ) : (
            <Switch checked={row.original.inGallery ?? false} disabled />
          ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => "פעולות",
        cell: ({ row }) =>
          editingId === row.original._id ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  void (async () => {
                    await updateOfficeImage({
                      id: row.original._id,
                      alt: editRow.alt,
                      visible: editRow.visible,
                      inHeader: editRow.inHeader,
                      inGallery: editRow.inGallery,
                    });
                    setEditingId(null);
                    setEditRow(null);
                  })();
                }}
              >
                שמור
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setEditRow(null);
                }}
              >
                ביטול
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingId(row.original._id);
                  setEditRow(row.original);
                }}
              >
                ערוך
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDeleteId(row.original._id)}
              >
                מחק
              </Button>
            </div>
          ),
      }),
    ],
    [editingId, editRow, updateOfficeImage, columnHelper],
  );

  const table = useReactTable({
    data: images,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  // Drag-and-drop handlers
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        setUploadError(`הקובץ גדול מדי (מקסימום ${maxSizeMB}MB)`);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  }
  function openFileDialog() {
    imageInput.current?.click();
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        setUploadError(`הקובץ גדול מדי (מקסימום ${maxSizeMB}MB)`);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  }
  function removeFile() {
    setSelectedFile(null);
    setUploadError(null);
    if (imageInput.current) imageInput.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ניהול תמונות</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">הוסף תמונה</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת תמונה</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddImage(e);
              }}
              className="space-y-4"
            >
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={addType === "upload" ? "default" : "outline"}
                  onClick={() => setAddType("upload")}
                >
                  <UploadIcon className="mr-1" />
                  העלה קובץ
                </Button>
                <Button
                  type="button"
                  variant={addType === "external" ? "default" : "outline"}
                  onClick={() => setAddType("external")}
                >
                  <ImageIcon className="mr-1" />
                  קישור חיצוני
                </Button>
              </div>
              {addType === "upload" ? (
                <div className="relative">
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-dragging={isDragging || undefined}
                    className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={imageInput}
                      onChange={handleFileInput}
                      className="sr-only"
                      aria-label="Upload image file"
                    />
                    {selectedFile ? (
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt={selectedFile.name}
                          className="mx-auto max-h-full rounded object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                        <div
                          className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                          aria-hidden="true"
                        >
                          <ImageIcon className="size-4 opacity-60" />
                        </div>
                        <p className="mb-1.5 text-sm font-medium">
                          גרור תמונה לכאן
                        </p>
                        <p className="text-muted-foreground text-xs">
                          SVG, PNG, JPG או GIF (מקסימום {maxSizeMB}MB)
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          type="button"
                          onClick={openFileDialog}
                        >
                          <UploadIcon
                            className="-ms-1 size-4 opacity-60"
                            aria-hidden="true"
                          />
                          בחר תמונה
                        </Button>
                      </div>
                    )}
                  </div>
                  {selectedFile && (
                    <div className="absolute top-4 right-4">
                      <button
                        type="button"
                        className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                        onClick={removeFile}
                        aria-label="הסר תמונה"
                      >
                        <XIcon className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                  {uploadError && (
                    <div
                      className="text-destructive flex items-center gap-1 text-xs mt-2"
                      role="alert"
                    >
                      <AlertCircleIcon className="size-3 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  placeholder="הדבק קישור לתמונה"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              )}
              <Input
                placeholder="Alt (תיאור לתמונה)"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
              <div className="flex gap-4">
                <label>
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                  />{" "}
                  גלוי
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={inHeader}
                    onChange={(e) => setInHeader(e.target.checked)}
                  />{" "}
                  בהדר
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={inGallery}
                    onChange={(e) => setInGallery(e.target.checked)}
                  />{" "}
                  בגלריה
                </label>
              </div>
              <DialogFooter>
                <Button type="submit" variant="default" disabled={uploading}>
                  {uploading ? "מעלה..." : "הוסף"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    ביטול
                  </Button>
                </DialogClose>
              </DialogFooter>
              {error && (
                <div
                  className="text-red-500 flex items-center gap-1 text-xs"
                  role="alert"
                >
                  <AlertCircleIcon className="size-3 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
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
                  <td key={cell.id} className="p-2 ">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>אישור מחיקה</DialogTitle>
          </DialogHeader>
          <div>האם אתה בטוח שברצונך למחוק תמונה זו? פעולה זו אינה הפיכה.</div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDeleteId) {
                  void deleteOfficeImage({ id: confirmDeleteId });
                  setConfirmDeleteId(null);
                }
              }}
            >
              מחק
            </Button>
            <DialogClose asChild>
              <Button variant="secondary" type="button">
                ביטול
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
