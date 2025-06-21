import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface ProductCardListProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
  getUnitLabel: (unit: string) => string;
  getCategoryLabel: (category: string) => string;
  getSlotLabels: (slots: ("afternoon" | "evening")[]) => string;
}

const ProductCardList: React.FC<ProductCardListProps> = ({
  products,
  onEdit,
  onDelete,
  getUnitLabel,
  getCategoryLabel,
  getSlotLabels,
}) => (
  <div className="space-y-4">
    {products.map((product) => (
      <Card key={product._id} className="p-4">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {product.nameHe || product.name}
            </h3>
            {product.name && product.nameHe && (
              <p className="text-sm text-muted-foreground truncate">
                {product.name}
              </p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(product._id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <strong>מחיר:</strong> ₪{product.price} (
            {getUnitLabel(product.unit)})
          </p>
          <p>
            <strong>קטגוריה:</strong> {getCategoryLabel(product.category)}
          </p>
          <p>
            <strong>זמינות:</strong>{" "}
            {getSlotLabels(product.availableSlots || [])}
          </p>
          {product.category !== "base" && (
            <div className="flex gap-1 mt-2">
              <Badge variant={product.visible ? "default" : "secondary"}>
                {product.visible ? "נראה" : "מוסתר"}
              </Badge>
            </div>
          )}
        </div>
      </Card>
    ))}
  </div>
);

export default ProductCardList;
