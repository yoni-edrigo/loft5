import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface OfficeImage {
  _id: string;
  url?: string;
  externalUrl?: string;
  storageId?: string;
  alt?: string;
  visible?: boolean;
  inHeader?: boolean;
  inGallery?: boolean;
}

interface OfficeImagesTableProps {
  images: OfficeImage[];
  updateOfficeImage: (args: any) => Promise<any>;
  setDeleteId: (id: string) => void;
}

function getImageUrl(img: OfficeImage) {
  if (typeof img.url === "string" && img.url) return img.url;
  if ("externalUrl" in img && typeof img.externalUrl === "string")
    return img.externalUrl;
  if ("storageId" in img && img.storageId)
    return `/api/storage/${img.storageId}`;
  return "/placeholder.svg";
}

function OfficeImageRow({
  image,
  saveRow,
  setDeleteId,
  isMobile,
}: {
  image: OfficeImage;
  saveRow: (row: OfficeImage) => Promise<void>;
  setDeleteId: (id: string) => void;
  isMobile: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [row, setRow] = useState<OfficeImage>({ ...image });
  const [saving, setSaving] = useState(false);

  // Keep row state in sync if image changes (e.g. after save)
  useEffect(() => {
    setRow({ ...image });
  }, [image]);

  if (isMobile) {
    return (
      <div className="mx-auto max-w-lg mb-4">
        <div className="bg-background overflow-hidden rounded-md border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="bg-muted/50 py-2 font-medium">
                  תמונה
                </TableCell>
                <TableCell className="py-2">
                  <img
                    src={getImageUrl(image)}
                    alt={image.alt || ""}
                    className="w-20 h-20 object-cover rounded"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="bg-muted/50 py-2 font-medium">
                  Alt
                </TableCell>
                <TableCell className="py-2 whitespace-normal">
                  {editing ? (
                    <Input
                      value={row.alt || ""}
                      onChange={(e) =>
                        setRow((r) => ({ ...r, alt: e.target.value }))
                      }
                    />
                  ) : (
                    image.alt || ""
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="bg-muted/50 py-2 font-medium">
                  גלוי
                </TableCell>
                <TableCell className="py-2">
                  {editing ? (
                    <Switch
                      checked={!!row.visible}
                      onCheckedChange={(checked) =>
                        setRow((r) => ({ ...r, visible: checked }))
                      }
                    />
                  ) : (
                    <Switch checked={image.visible ?? false} disabled />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="bg-muted/50 py-2 font-medium">
                  בהדר
                </TableCell>
                <TableCell className="py-2">
                  {editing ? (
                    <Switch
                      checked={!!row.inHeader}
                      onCheckedChange={(checked) =>
                        setRow((r) => ({ ...r, inHeader: checked }))
                      }
                    />
                  ) : (
                    <Switch checked={image.inHeader ?? false} disabled />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="bg-muted/50 py-2 font-medium">
                  בגלריה
                </TableCell>
                <TableCell className="py-2">
                  {editing ? (
                    <Switch
                      checked={!!row.inGallery}
                      onCheckedChange={(checked) =>
                        setRow((r) => ({ ...r, inGallery: checked }))
                      }
                    />
                  ) : (
                    <Switch checked={image.inGallery ?? false} disabled />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="bg-muted/50 py-2 font-medium">
                  פעולות
                </TableCell>
                <TableCell className="py-2">
                  {editing ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={saving}
                        onClick={() => {
                          void (async () => {
                            setSaving(true);
                            await saveRow(row);
                            setEditing(false);
                            setSaving(false);
                          })();
                        }}
                      >
                        שמור
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(false);
                          setRow({ ...image });
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
                        onClick={() => setEditing(true)}
                      >
                        ערוך
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(image._id)}
                      >
                        מחק
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Desktop row
  return (
    <tr className="border-b last:border-b-0">
      <td className="p-2">
        <img
          src={getImageUrl(image)}
          alt={image.alt || ""}
          className="w-20 h-20 object-cover rounded"
        />
      </td>
      <td className="p-2">
        {editing ? (
          <Input
            value={row.alt || ""}
            onChange={(e) => setRow((r) => ({ ...r, alt: e.target.value }))}
          />
        ) : (
          image.alt || ""
        )}
      </td>
      <td className="p-2">
        {editing ? (
          <Switch
            checked={!!row.visible}
            onCheckedChange={(checked) =>
              setRow((r) => ({ ...r, visible: checked }))
            }
          />
        ) : (
          <Switch checked={image.visible ?? false} disabled />
        )}
      </td>
      <td className="p-2">
        {editing ? (
          <Switch
            checked={!!row.inHeader}
            onCheckedChange={(checked) =>
              setRow((r) => ({ ...r, inHeader: checked }))
            }
          />
        ) : (
          <Switch checked={image.inHeader ?? false} disabled />
        )}
      </td>
      <td className="p-2">
        {editing ? (
          <Switch
            checked={!!row.inGallery}
            onCheckedChange={(checked) =>
              setRow((r) => ({ ...r, inGallery: checked }))
            }
          />
        ) : (
          <Switch checked={image.inGallery ?? false} disabled />
        )}
      </td>
      <td className="p-2">
        {editing ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              disabled={saving}
              onClick={() => {
                void (async () => {
                  setSaving(true);
                  await saveRow(row);
                  setEditing(false);
                  setSaving(false);
                })();
              }}
            >
              שמור
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditing(false);
                setRow({ ...image });
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
              onClick={() => setEditing(true)}
            >
              ערוך
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteId(image._id)}
            >
              מחק
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function OfficeImagesTable({
  images,
  updateOfficeImage,
  setDeleteId,
}: OfficeImagesTableProps) {
  const isMobile = useIsMobile();
  // Save handler passed to each row
  const saveRow = async (row: OfficeImage) => {
    await updateOfficeImage({
      id: row._id,
      alt: row.alt,
      visible: row.visible,
      inHeader: row.inHeader,
      inGallery: row.inGallery,
    });
  };

  if (isMobile) {
    return (
      <div>
        {images.map((img) => (
          <OfficeImageRow
            key={img._id}
            image={img}
            saveRow={saveRow}
            setDeleteId={setDeleteId}
            isMobile={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <thead>
          <tr>
            <TableHead>תמונה</TableHead>
            <TableHead>Alt</TableHead>
            <TableHead>גלוי</TableHead>
            <TableHead>בהדר</TableHead>
            <TableHead>בגלריה</TableHead>
            <TableHead>פעולות</TableHead>
          </tr>
        </thead>
        <TableBody>
          {images.map((img) => (
            <OfficeImageRow
              key={img._id}
              image={img}
              saveRow={saveRow}
              setDeleteId={setDeleteId}
              isMobile={false}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
