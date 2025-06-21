import { expect, test } from "vitest";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

// Set your Convex deployment URL here or use an env variable
const CONVEX_URL =
  process.env.VITE_CONVEX_URL || "https://patient-mongoose-780.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

test("visible product appears in client query", async () => {
  // Set your product key, category, and slot here
  const PRODUCT_KEY = "karaokeSystem"; // Change to your product's key
  const CATEGORY = undefined; // e.g., "addons" or undefined for all
  const SLOT = undefined; // e.g., "afternoon" or "evening" or undefined

  // Query products as the client does
  const products = await client.query(api.products.getProducts, {
    onlyVisible: true,
    category: CATEGORY,
  });

  // Find your product
  const found = products.find(
    (p: any) =>
      p.key === PRODUCT_KEY &&
      (SLOT ? !p.availableSlots || p.availableSlots.includes(SLOT) : true),
  );

  expect(found, "Product should be visible to the client").toBeTruthy();

  if (!found) {
    // Query all products for debugging
    const allProducts = await client.query(api.products.getProducts, {});
    const adminFound = allProducts.find((p: any) => p.key === PRODUCT_KEY);
    if (!adminFound) {
      throw new Error("Product not found at all (check seed/admin).");
    } else {
      if (!adminFound.visible) throw new Error("Product is not visible.");
      if (
        SLOT &&
        adminFound.availableSlots &&
        !adminFound.availableSlots.includes(SLOT)
      )
        throw new Error(`Product not available for slot ${SLOT as string}`);
      if (CATEGORY && adminFound.category !== CATEGORY)
        throw new Error(
          `Product category mismatch (expected: ${CATEGORY as string})`,
        );
    }
  }
});

test("all visible products have required fields", async () => {
  const products = await client.query(api.products.getProducts, {
    onlyVisible: true,
  });

  products.forEach((product: any) => {
    expect(product.name, "Product should have a name").toBeTruthy();
    expect(product.nameHe, "Product should have a Hebrew name").toBeTruthy();
    expect(product.price, "Product should have a price").toBeGreaterThan(0);
    expect(product.category, "Product should have a category").toBeTruthy();
    expect(product.visible, "Product should be visible").toBe(true);
  });
});

test("products are filtered by category correctly", async () => {
  const addonProducts = await client.query(api.products.getProducts, {
    onlyVisible: true,
    category: "addons",
  });

  addonProducts.forEach((product: any) => {
    expect(product.category, "All products should be addons").toBe("addons");
    expect(product.visible, "All products should be visible").toBe(true);
  });
});

test("products are filtered by package correctly", async () => {
  const foodPackageProducts = await client.query(api.products.getProducts, {
    onlyVisible: true,
    packageKey: "food_package",
  });

  foodPackageProducts.forEach((product: any) => {
    expect(
      product.packageKey,
      "All products should have food_package key",
    ).toBe("food_package");
    expect(product.visible, "All products should be visible").toBe(true);
  });
});

test("karaoke product visibility by time slot", async () => {
  // Get all visible addon products
  const allAddons = await client.query(api.products.getProducts, {
    category: "addons",
    onlyVisible: true,
  });

  // Find karaoke product
  const karaokeProduct = allAddons.find((p) => p.key === "karaokeSystem");
  expect(karaokeProduct).toBeDefined();
  expect(karaokeProduct?.name).toBe("Karaoke System");
  expect(karaokeProduct?.availableSlots).toContain("afternoon");
  expect(karaokeProduct?.availableSlots).not.toContain("evening");

  // Manually filter for afternoon slot - karaoke should be visible
  const afternoonAddons = allAddons.filter(
    (p) => !p.availableSlots || p.availableSlots.includes("afternoon"),
  );
  const karaokeAfternoon = afternoonAddons.find(
    (p) => p.key === "karaokeSystem",
  );
  expect(karaokeAfternoon).toBeDefined();

  // Manually filter for evening slot - karaoke should NOT be visible
  const eveningAddons = allAddons.filter(
    (p) => !p.availableSlots || p.availableSlots.includes("evening"),
  );
  const karaokeEvening = eveningAddons.find((p) => p.key === "karaokeSystem");
  expect(karaokeEvening).toBeUndefined();
});
