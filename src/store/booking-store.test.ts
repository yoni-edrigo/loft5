import { describe, it, expect, beforeEach } from "vitest";
import { useBookingStore } from "./booking-store";
import { ProductDoc, LegacyPricingData } from "@/lib/types";
import { Id } from "../../convex/_generated/dataModel";

// Get initial state for resetting
const initialStoreState = useBookingStore.getState();

// --- MOCK DATA ---
const mockProducts: ProductDoc[] = [
  { _id: 'p1' as Id<'products'>, nameHe: 'שירות בסיסי', price: 100, category: 'base', unit: 'per_event', packageKey: 'base_pkg', _creationTime: Date.now(), descriptionHe: '', visible: true },
  { _id: 'p2' as Id<'products'>, nameHe: 'קריוקי', price: 500, category: 'entertainment', unit: 'flat', packageKey: 'entertainment_pkg', _creationTime: Date.now(), descriptionHe: '', visible: true },
  { _id: 'p3' as Id<'products'>, nameHe: 'קייטרינג', price: 75, category: 'food', unit: 'per_person', packageKey: 'food_pkg', _creationTime: Date.now(), descriptionHe: '', visible: true },
  { _id: 'p4' as Id<'products'>, nameHe: 'שעה נוספת', price: 200, category: 'timing', unit: 'per_hour', _creationTime: Date.now(), descriptionHe: '', visible: true },
];

const mockPricing: LegacyPricingData = {
  minimumPrice: 1000,
  loftPerPerson: 150,
  afternoonWithoutKaraoke: 2000,
  afternoonWithKaraoke: 2500,
  foodPerPerson: 75, // Not used in new calculation
  drinksPerPerson: 50, // Not used
  snacksPerPerson: 25, // Not used
  extraHourPerPerson: 30, // Not used
  photographerPrice: 1000, // Example of a flat price product
};

describe('useBookingStore Business Logic', () => {
  const get = useBookingStore.getState;

  // Reset the store to its initial state before each test
  beforeEach(() => {
    useBookingStore.setState(initialStoreState, true);
    // Setup initial data required for calculations
    get().setProducts(mockProducts);
    get().setPricing(mockPricing);
  });

  describe('Product and Package Selection', () => {
    it('should add a standalone product', () => {
      get().addStandaloneProduct('p2' as Id<'products'>); // Add Karaoke
      const state = get();
      expect(state.selectedProducts.some(p => p.productId === 'p2')).toBe(true);
    });

    it('should remove a standalone product', () => {
      const karaokeId = 'p2' as Id<'products'>;
      get().addStandaloneProduct(karaokeId);
      expect(get().isProductSelected(karaokeId)).toBe(true);
      get().removeStandaloneProduct(karaokeId);
      expect(get().isProductSelected(karaokeId)).toBe(false);
    });

    it('should select a product within a package, replacing previous selection', () => {
      const foodPackageKey = 'food_pkg';
      const cateringId = 'p3' as Id<'products'>;

      // Select catering
      get().selectProduct(foodPackageKey, cateringId);

      let state = get();
      expect(state.packageSelections.get(foodPackageKey)?.productId).toBe(cateringId);
      expect(state.selectedProducts.some(p => p.productId === cateringId)).toBe(true);

      // Imagine another food option
      const pizzaId = 'p5' as Id<'products'>;
      const mockProductsWithPizza: ProductDoc[] = [
        ...mockProducts,
        {
          _id: pizzaId,
          nameHe: 'פיצה',
          price: 50,
          category: 'food',
          unit: 'per_person',
          packageKey: foodPackageKey,
          _creationTime: Date.now(),
          descriptionHe: '',
          visible: true,
        },
      ];
      get().setProducts(mockProductsWithPizza);

      // Select pizza, should replace catering
      get().selectProduct(foodPackageKey, pizzaId);

      state = get();
      expect(state.packageSelections.get(foodPackageKey)?.productId).toBe(pizzaId);
      expect(state.selectedProducts.some(p => p.productId === cateringId)).toBe(false);
      expect(state.selectedProducts.some(p => p.productId === pizzaId)).toBe(true);
    });
  });

  describe('Price Calculation', () => {
    it('should calculate price for an evening event with per-person products', () => {
      get().setSelectedTimeSlot('evening');
      get().setNumberOfParticipants(20);
      get().addStandaloneProduct('p3' as Id<'products'>); // Catering per person

      const totalPrice = get().calculateTotalPrice();
      const expectedBase = mockPricing.loftPerPerson * 20; // 150 * 20 = 3000
      const expectedCatering = mockProducts.find(p=>p._id === 'p3')!.price * 20; // 75 * 20 = 1500
      expect(totalPrice).toBe(expectedBase + expectedCatering); // 3000 + 1500 = 4500
    });

    it('should calculate price for an afternoon event (small group)', () => {
      get().setSelectedTimeSlot('afternoon');
      get().setNumberOfParticipants(15);

      const totalPrice = get().calculateTotalPrice();
      expect(totalPrice).toBe(mockPricing.afternoonWithoutKaraoke); // 2000
    });

    it('should calculate price for an afternoon event (large group)', () => {
      get().setSelectedTimeSlot('afternoon');
      get().setNumberOfParticipants(30);

      const totalPrice = get().calculateTotalPrice();
      expect(totalPrice).toBe(mockPricing.afternoonWithKaraoke); // 2500
    });

    it('should add flat fee products correctly', () => {
      get().setSelectedTimeSlot('evening');
      get().setNumberOfParticipants(10);
      get().addStandaloneProduct('p2' as Id<'products'>); // Karaoke flat fee

      const totalPrice = get().calculateTotalPrice();
      const expectedBase = mockPricing.loftPerPerson * 10; // 150 * 10 = 1500
      const expectedKaraoke = mockProducts.find(p=>p._id === 'p2')!.price; // 500
      expect(totalPrice).toBe(expectedBase + expectedKaraoke); // 1500 + 500 = 2000
    });

    it('should add per-hour products correctly', () => {
      get().setSelectedTimeSlot('evening');
      get().setNumberOfParticipants(10);
      get().setExtraHours(3);
      get().addStandaloneProduct('p4' as Id<'products'>); // 3 extra hours

      const totalPrice = get().calculateTotalPrice();
      const expectedBase = mockPricing.loftPerPerson * 10; // 1500
      const expectedExtraHours = mockProducts.find(p=>p._id === 'p4')!.price * 3; // 200 * 3 = 600
      expect(totalPrice).toBe(expectedBase + expectedExtraHours); // 1500 + 600 = 2100
    });
  });

  it('should reset the booking state correctly', () => {
    get().setSelectedDate(new Date());
    get().setSelectedTimeSlot('evening');
    get().addStandaloneProduct('p2' as Id<'products'>);
    get().selectProduct('food_pkg', 'p3' as Id<'products'>);

    get().resetBooking();

    const state = get();
    // We can't compare to initialStoreState directly because some parts are initialized inside the test (products, pricing)
    // So we check the resettable parts
    expect(state.selectedDate).toBeNull();
    expect(state.selectedTimeSlot).toBeNull();
    expect(state.selectedProducts).toEqual([]);
    expect(state.packageSelections.size).toBe(0);
    expect(state.customerName).toBe("");
  });
});
