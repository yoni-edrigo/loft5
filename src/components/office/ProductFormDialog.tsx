import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface ProductFormData {
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  price: number;
  unit: "per_person" | "per_event" | "per_hour";
  category: string;
  key: string;
  visible: boolean;
  order: number;
  availableSlots: ("afternoon" | "evening")[];
  packageKey?: string;
  isDefaultInPackage?: boolean;
  parentId?: string;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  formData: ProductFormData;
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  onSlotToggle: (slot: "afternoon" | "evening") => void;
  editingProduct: any;
  categories: { value: string; label: string }[];
  units: { value: string; label: string }[];
  timeSlots: { value: "afternoon" | "evening"; label: string }[];
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  onReset,
  formData,
  onInputChange,
  onSlotToggle,
  editingProduct,
  categories,
  units,
  timeSlots,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button onClick={onReset}>
        <Plus className="w-4 h-4 mr-2" />
        הוסף מוצר
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingProduct ? "ערוך מוצר" : "הוסף מוצר חדש"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nameHe">שם (עברית) *</Label>
            <Input
              id="nameHe"
              value={formData.nameHe}
              onChange={(e) => onInputChange("nameHe", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">שם (אנגלית)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="descriptionHe">תיאור (עברית) *</Label>
            <Textarea
              id="descriptionHe"
              value={formData.descriptionHe}
              onChange={(e) => onInputChange("descriptionHe", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אנגלית)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onInputChange("description", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">מחיר</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => onInputChange("price", Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">יחידה</Label>
            <Select
              value={formData.unit}
              onValueChange={(value: "per_person" | "per_event" | "per_hour") =>
                onInputChange("unit", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">קטגוריה</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => onInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="key">מפתח ייחודי</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => onInputChange("key", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">סדר</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => onInputChange("order", Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>זמינות לפי שעות</Label>
          <div className="flex gap-4">
            {timeSlots.map((slot) => (
              <div key={slot.value} className="flex items-center space-x-2">
                <Switch
                  id={slot.value}
                  checked={formData.availableSlots.includes(slot.value)}
                  onCheckedChange={() => onSlotToggle(slot.value)}
                />
                <Label htmlFor={slot.value}>{slot.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="visible"
            checked={formData.visible}
            onCheckedChange={(checked) => onInputChange("visible", checked)}
            disabled={formData.category === "base"}
          />
          <Label htmlFor="visible">נראה למשתמשים</Label>
          {formData.category === "base" && (
            <span className="text-xs text-muted-foreground">
              מוצרי בסיס אינם מוצגים למשתמשים
            </span>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            ביטול
          </Button>
          <Button type="submit">{editingProduct ? "עדכן" : "הוסף"}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);

export default ProductFormDialog;
