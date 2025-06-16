import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface DeleteImageDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  deleteId: string | null;
  deleteOfficeImage: (args: any) => Promise<any>;
}

export default function DeleteImageDialog({
  open,
  setOpen,
  deleteId,
  deleteOfficeImage,
}: DeleteImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>אישור מחיקה</DialogTitle>
        </DialogHeader>
        <div>האם אתה בטוח שברצונך למחוק תמונה זו? פעולה זו אינה הפיכה.</div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              if (deleteId) {
                void deleteOfficeImage({ id: deleteId });
                setOpen(false);
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
  );
}
