import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, ArrowUpDown } from "lucide-react";

interface ProductFilterSectionProps {
  searchTerm: string;
  categoryFilter: string;
  visibilityFilter: string;
  sortBy: string;
  categories: { value: string; label: string }[];
  onSearchChange: (value: string) => void;
  onCategoryFilter: (value: string) => void;
  onVisibilityFilter: (value: string) => void;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  resultsCount: number;
  totalCount: number;
}

const ProductFilterSection: React.FC<ProductFilterSectionProps> = ({
  searchTerm,
  categoryFilter,
  visibilityFilter,
  sortBy,
  categories,
  onSearchChange,
  onCategoryFilter,
  onVisibilityFilter,
  onSort,
  onClearFilters,
  resultsCount,
  totalCount,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Filter className="w-4 h-4" />
        סינון ומיון
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="searchTerm">חיפוש</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="searchTerm"
            placeholder="חיפוש מוצרים..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label htmlFor="categoryFilter">קטגוריה</Label>
        <Select value={categoryFilter} onValueChange={onCategoryFilter}>
          <SelectTrigger id="categoryFilter" aria-label="קטגוריה">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקטגוריות</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visibility Filter */}
      <div className="space-y-2">
        <Label htmlFor="visibilityFilter">נראות</Label>
        <Select value={visibilityFilter} onValueChange={onVisibilityFilter}>
          <SelectTrigger id="visibilityFilter" aria-label="נראות">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל המוצרים</SelectItem>
            <SelectItem value="visible">נראים</SelectItem>
            <SelectItem value="hidden">מוסתרים</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <Label htmlFor="sortBy">מיון לפי</Label>
        <Select value={sortBy} onValueChange={onSort}>
          <SelectTrigger id="sortBy" aria-label="מיון לפי">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">סדר ברירת מחדל</SelectItem>
            <SelectItem value="name">שם</SelectItem>
            <SelectItem value="price">מחיר</SelectItem>
            <SelectItem value="category">קטגוריה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={onClearFilters} className="w-full">
        נקה סינון
      </Button>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground pt-2 border-t">
        {resultsCount} מתוך {totalCount} תוצאות
      </div>
    </CardContent>
  </Card>
);

export default ProductFilterSection;
