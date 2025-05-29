// Types based on the Convex schema
export type LoftConfig = {
  name: string
  description: string
  address: string
  basePrice: number
  maxCapacity: number
  amenities: string[]
  photos: string[]
  checkInTime: string
  checkOutTime: string
  cleaningDuration: number
  minStayHours: number
}

export interface BlockedPeriod {
  _id: string
  startDateTime: string
  endDateTime: string
  reason: string
  isRecurring: boolean
  recurringPattern?: string
}

export type Item = {
  _id: string
  name: string
  description: string
  type: "food" | "drink"
  isActive: boolean
  image?: string
  servingInfo?: string
  sortOrder?: number
}

export type PackageItem = {
  itemId: string
  quantity: number
  unit?: string
}

export type PricingTier = {
  minGroupSize: number
  maxGroupSize: number
  pricePerPerson: number
}

export type AdditionalItem = {
  itemId: string
  basePrice: number
  groupSizeAdjustments?: {
    minGroupSize: number
    maxGroupSize: number
    adjustedPrice: number
  }[]
}

export type Package = {
  _id: string
  name: string
  description: string
  type: "food" | "drink" | "combined"
  isActive: boolean
  image?: string
  packageItems: PackageItem[]
  pricingTiers: PricingTier[]
  availableAdditionalItems: AdditionalItem[]
  sortOrder?: number
}

export type Reservation = {
  _id: string
  checkInDateTime: string
  checkOutDateTime: string
  guestCount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests?: string
  selectedPackage: {
    packageId: string
    priceAtTimeOfOrder: number
    totalPriceForGroup: number
  }
  selectedAdditionalItems: {
    itemId: string
    quantity: number
    specialInstructions?: string
    priceAtTimeOfOrder: number
    totalPrice: number
  }[]
  baseRentalPrice: number
  packagePrice: number
  additionalItemsPrice: number
  totalAmount: number
  status: string
  adminId?: string
  adminNotes?: string
  requestedAt: number
  approvedAt?: number
  paymentLinkSentAt?: number
  takbullOrderId?: string
  paymentUrl?: string
  paymentLinkExpiresAt?: number
  paidAt?: number
  transactionId?: string
  invoiceId?: string
}
