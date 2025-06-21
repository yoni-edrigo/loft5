import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";

interface ProductTableProps {
  products: any[];
  sortBy: string;
  onSort: (field: string) => void;
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
  getUnitLabel: (unit: string) => string;
  getCategoryLabel: (category: string) => string;
  getSlotLabels: (slots: ("afternoon" | "evening")[]) => string;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  sortBy,
  onSort,
  onEdit,
  onDelete,
  getUnitLabel,
  getCategoryLabel,
  getSlotLabels,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onSort("name")}
        >
          <div className="flex items-center gap-1">
            שם
            {sortBy === "name" && <ArrowUpDown className="w-3 h-3" />}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onSort("price")}
        >
          <div className="flex items-center gap-1">
            מחיר
            {sortBy === "price" && <ArrowUpDown className="w-3 h-3" />}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onSort("category")}
        >
          <div className="flex items-center gap-1">
            קטגוריה
            {sortBy === "category" && <ArrowUpDown className="w-3 h-3" />}
          </div>
        </TableHead>
        <TableHead>זמינות</TableHead>
        <TableHead>סטטוס</TableHead>
        <TableHead>פעולות</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {products.map((product) => (
        <TableRow key={product._id}>
          <TableCell>
            <div>
              <div className="font-medium">
                {product.nameHe || product.name}
              </div>
              {product.name && product.nameHe && (
                <div className="text-sm text-muted-foreground">
                  {product.name}
                </div>
              )}
            </div>
          </TableCell>
          <TableCell>
            ₪{product.price} ({getUnitLabel(product.unit)})
          </TableCell>
          <TableCell>{getCategoryLabel(product.category)}</TableCell>
          <TableCell>{getSlotLabels(product.availableSlots || [])}</TableCell>
          <TableCell>
            {product.category !== "base" && (
              <Badge variant={product.visible ? "default" : "secondary"}>
                {product.visible ? "נראה" : "מוסתר"}
              </Badge>
            )}
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(product)}
              >
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
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default ProductTable;
