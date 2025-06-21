import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { AlertCircleIcon, UploadIcon, ImageIcon, XIcon } from "lucide-react";

interface ImageUploadDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  saveOfficeImage: (args: any) => Promise<any>;
  generateUploadUrl: () => Promise<string>;
}

export default function ImageUploadDialog({
  open,
  setOpen,
  saveOfficeImage,
  generateUploadUrl,
}: ImageUploadDialogProps) {
  const [addType, setAddType] = useState<"upload" | "external">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [visible, setVisible] = useState(true);
  const [inHeader, setInHeader] = useState(false);
  const [inGallery, setInGallery] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInput = useRef<HTMLInputElement | null>(null);
  const maxSizeMB = 10;
  const maxSize = maxSizeMB * 1024 * 1024;

  async function handleAddImage(e: FormEvent) {
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
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        await saveOfficeImage({
          storageId,
          visible,
          inHeader,
          inGallery,
          alt: altText,
        });
      } else if (addType === "external" && externalUrl) {
        await saveOfficeImage({
          externalUrl,
          visible,
          inHeader,
          inGallery,
          alt: altText,
        });
      }
      setOpen(false);
      setSelectedFile(null);
      setExternalUrl("");
      setAlt("");
      setVisible(true);
      setInHeader(false);
      setInGallery(true);
    } catch (err: any) {
      setError((err && err.message) || "שגיאה בהעלאת התמונה");
    } finally {
      setUploading(false);
    }
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDrop(e: DragEvent) {
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
  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">הוסף תמונה</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוספת תמונה</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
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
  );
}
