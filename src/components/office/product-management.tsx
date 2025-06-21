import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import ProductFilterSection from "./ProductFilterSection";
import ProductFormDialog from "./ProductFormDialog";
import ProductTable from "./ProductTable";
import ProductCardList from "./ProductCardList";
import { Id } from "../../../convex/_generated/dataModel";

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
  parentId?: Id<"products">;
}
const categories = [
  { value: "base", label: "בסיס" },
  { value: "food_package", label: "חבילת אוכל" },
  { value: "drinks_package", label: "חבילת משקאות" },
  { value: "snacks", label: "חטיפים" },
  { value: "addons", label: "תוספות" },
];
export default function ProductManagement() {
  const products = useQuery(api.products.getAllProducts);
  const createProductMutation = useMutation(api.products.createProduct);
  const updateProductMutation = useMutation(api.products.updateProduct);
  const deleteProductMutation = useMutation(api.products.deleteProduct);

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    nameHe: "",
    description: "",
    descriptionHe: "",
    price: 0,
    unit: "per_person",
    category: "base",
    key: "",
    visible: true,
    order: 0,
    availableSlots: ["afternoon", "evening"],
    packageKey: "",
    isDefaultInPackage: false,
    parentId: undefined,
  });

  // Mobile state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Search params for filtering and sorting
  const search = useSearch({ from: "/site-control" });
  const navigate = useNavigate();

  // Use default values when search params are undefined
  const searchTerm = search.searchTerm || "";
  const categoryFilter = search.categoryFilter || "all";
  const visibilityFilter = search.visibilityFilter || "all";
  const sortBy = search.sortBy || "order";
  const sortOrder = search.sortOrder || "asc";

  const isMobile = useIsMobile();

  // Update search params - only include non-default values
  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const currentSearch = search as any;
    const newSearch = { ...currentSearch };

    // Only add params that have meaningful values
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value &&
        value !== "" &&
        value !== "all" &&
        value !== "order" &&
        value !== "asc"
      ) {
        newSearch[key] = value;
      } else {
        delete newSearch[key];
      }
    });

    void navigate({ search: newSearch, replace: true });
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    updateSearchParams({ searchTerm: value || undefined });
  };

  // Handle category filter
  const handleCategoryFilter = (value: string) => {
    updateSearchParams({ categoryFilter: value === "all" ? undefined : value });
  };

  // Handle visibility filter
  const handleVisibilityFilter = (value: string) => {
    updateSearchParams({
      visibilityFilter: value === "all" ? undefined : value,
    });
  };

  // Handle sort
  const handleSort = (field: string) => {
    const newSortBy = field === sortBy ? sortBy : field;
    const newSortOrder =
      field === sortBy && sortOrder === "asc" ? "desc" : "asc";

    updateSearchParams({
      sortBy: newSortBy === "order" ? undefined : newSortBy,
      sortOrder: newSortOrder === "asc" ? undefined : newSortOrder,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    void navigate({
      search: {
        tab: search.tab || "products",
        searchTerm: undefined,
        categoryFilter: undefined,
        visibilityFilter: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      } as any,
      replace: true,
    });
  };

  const units = [
    { value: "per_person", label: "לאדם" },
    { value: "per_event", label: "לאירוע" },
    { value: "per_hour", label: "לשעה" },
  ];

  const timeSlots: Array<{ value: "afternoon" | "evening"; label: string }> = [
    { value: "afternoon", label: "צהריים" },
    { value: "evening", label: "ערב" },
  ];

  const getCategoryLabel = useCallback((category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  }, []);

  const getUnitLabel = (unit: string) => {
    return units.find((u) => u.value === unit)?.label || unit;
  };

  const getSlotLabels = (slots: ("afternoon" | "evening")[]) => {
    return slots
      .map((slot) => timeSlots.find((s) => s.value === slot)?.label)
      .join(", ");
  };

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    const filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        product.nameHe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descriptionHe
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      // Visibility filter
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible" && product.visible) ||
        (visibilityFilter === "hidden" && !product.visible);

      return matchesSearch && matchesCategory && matchesVisibility;
    });

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = (a.nameHe || a.name || "").localeCompare(
            b.nameHe || b.name || "",
          );
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "category":
          comparison = getCategoryLabel(a.category).localeCompare(
            getCategoryLabel(b.category),
          );
          break;
        case "order":
        default:
          comparison = (a.order ?? 0) - (b.order ?? 0);
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return sorted;
  }, [
    products,
    searchTerm,
    categoryFilter,
    visibilityFilter,
    sortBy,
    sortOrder,
    getCategoryLabel,
  ]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlotToggle = (slot: "afternoon" | "evening") => {
    setFormData((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter((s) => s !== slot)
        : [...prev.availableSlots, slot],
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameHe: "",
      description: "",
      descriptionHe: "",
      price: 0,
      unit: "per_person",
      category: "base",
      key: "",
      visible: true,
      order: 0,
      availableSlots: ["afternoon", "evening"],
      packageKey: "",
      isDefaultInPackage: false,
      parentId: undefined,
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProductMutation({
          id: editingProduct._id,
          ...formData,
        });
      } else {
        await createProductMutation(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      nameHe: product.nameHe || "",
      description: product.description || "",
      descriptionHe: product.descriptionHe || "",
      price: product.price || 0,
      unit: product.unit || "per_person",
      category: product.category || "base",
      key: product.key || "",
      visible: product.visible ?? true,
      order: product.order || 0,
      availableSlots: product.availableSlots || ["afternoon", "evening"],
      packageKey: product.packageKey || "",
      isDefaultInPackage: product.isDefaultInPackage || false,
      parentId: product.parentId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: Id<"products">) => {
    if (confirm("האם אתה בטוח שברצונך למחוק מוצר זה?")) {
      try {
        await deleteProductMutation({ id: productId });
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (products === undefined) {
    return <div className="text-center">טוען...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      {isMobile && (
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            סינון ומיון
          </span>
          {isFiltersOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      )}

      {/* Filters Section */}
      {isMobile ? (
        isFiltersOpen && (
          <ProductFilterSection
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            visibilityFilter={visibilityFilter}
            sortBy={sortBy}
            categories={categories}
            onSearchChange={handleSearchChange}
            onCategoryFilter={handleCategoryFilter}
            onVisibilityFilter={handleVisibilityFilter}
            onSort={handleSort}
            onClearFilters={clearFilters}
            resultsCount={filteredAndSortedProducts.length}
            totalCount={products?.length || 0}
          />
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <ProductFilterSection
              searchTerm={searchTerm}
              categoryFilter={categoryFilter}
              visibilityFilter={visibilityFilter}
              sortBy={sortBy}
              categories={categories}
              onSearchChange={handleSearchChange}
              onCategoryFilter={handleCategoryFilter}
              onVisibilityFilter={handleVisibilityFilter}
              onSort={handleSort}
              onClearFilters={clearFilters}
              resultsCount={filteredAndSortedProducts.length}
              totalCount={products?.length || 0}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ניהול מוצרים</CardTitle>
                <ProductFormDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  onSubmit={(e) => {
                    void handleSubmit(e);
                  }}
                  onReset={resetForm}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSlotToggle={handleSlotToggle}
                  editingProduct={editingProduct}
                  categories={categories}
                  units={units}
                  timeSlots={timeSlots}
                />
              </CardHeader>
              <CardContent>
                <ProductTable
                  products={filteredAndSortedProducts}
                  sortBy={sortBy}
                  onSort={handleSort}
                  onEdit={handleEdit}
                  onDelete={(id) => {
                    void handleDelete(id as Id<"products">);
                  }}
                  getUnitLabel={getUnitLabel}
                  getCategoryLabel={getCategoryLabel}
                  getSlotLabels={getSlotLabels}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Mobile Main Content */}
      {isMobile && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ניהול מוצרים</CardTitle>
            <ProductFormDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              onReset={resetForm}
              formData={formData}
              onInputChange={handleInputChange}
              onSlotToggle={handleSlotToggle}
              editingProduct={editingProduct}
              categories={categories}
              units={units}
              timeSlots={timeSlots}
            />
          </CardHeader>
          <CardContent>
            <ProductCardList
              products={filteredAndSortedProducts}
              onEdit={handleEdit}
              onDelete={(id) => {
                void handleDelete(id as Id<"products">);
              }}
              getUnitLabel={getUnitLabel}
              getCategoryLabel={getCategoryLabel}
              getSlotLabels={getSlotLabels}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
