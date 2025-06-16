import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import ImageUploadDialog from "./office-image-upload/ImageUploadDialog";
import OfficeImagesTable from "./office-image-upload/OfficeImagesTable";
import DeleteImageDialog from "./office-image-upload/DeleteImageDialog";

export function OfficeImageUpload() {
  // Fetch images
  const images = useQuery(api.office_images.getOfficeImages, {}) || [];
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Add image mutation
  const saveOfficeImage = useMutation(api.office_images.saveOfficeImage);
  // Update image mutation
  const updateOfficeImage = useMutation(
    api.office_images_admin.updateOfficeImage,
  );
  // Delete image mutation
  const deleteOfficeImage = useMutation(
    api.office_images_admin.deleteOfficeImage,
  );
  // Generate upload URL mutation
  const generateUploadUrl = useMutation(
    api.office_images.generateImageUploadUrl,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ניהול תמונות</h2>
        <ImageUploadDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          saveOfficeImage={saveOfficeImage}
          generateUploadUrl={generateUploadUrl}
        />
      </div>
      <OfficeImagesTable
        images={images.map((img) => ({ ...img, url: img.url ?? undefined }))}
        setDeleteId={setDeleteId}
        updateOfficeImage={updateOfficeImage}
      />
      <DeleteImageDialog
        open={!!deleteId}
        setOpen={(open: boolean) => !open && setDeleteId(null)}
        deleteId={deleteId}
        deleteOfficeImage={deleteOfficeImage}
      />
    </div>
  );
}
