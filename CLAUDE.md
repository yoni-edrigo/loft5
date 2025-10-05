# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Loft5 is an event booking Progressive Web App built with React, Vite, TanStack Router, and Convex as the backend. The app is designed for a Hebrew event space ("Loft5") with bilingual support, allowing customers to book events and administrators to manage bookings, products, and services.

## Architecture

### Frontend Stack
- **React 19** with TypeScript
- **TanStack Router** for file-based routing (routes in `src/routes/`)
- **Tailwind CSS 4** with shadcn/ui components
- **Vite** for bundling and development
- **PWA** with service worker and push notifications via Firebase

### Backend Stack
- **Convex** for real-time database, authentication, and serverless functions
- **Convex Auth** for user authentication with role-based access (ADMIN, DESIGNER, GUEST, MANAGER)
- **Firebase** for push notifications via FCM

### Project Structure
- `src/components/` - Reusable UI components including shadcn/ui components in `ui/` subfolder
- `src/routes/` - TanStack Router file-based routes
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and type definitions
- `convex/` - Backend functions, schema, and database operations
- `tests/` - Playwright E2E tests with accessibility testing

## Development Commands

```bash
# Development (runs frontend and backend in parallel)
npm run dev

# Build for production
npm run build

# Linting and type checking
npm run lint
npm run lint:a11y

# Testing
npm run test           # Unit tests with Vitest
npm run test:ui        # Vitest UI
npm run test:run       # Run tests once
npm run test:coverage  # Coverage report
npm run test:e2e       # Playwright E2E tests
npm run test:e2e:ui    # Playwright UI
npm run test:accessibility  # Accessibility tests
npm run test:all       # Run all tests

# Preview production build
npm run preview
```

## Key Features and Business Logic

### Booking System
- Events are booked for specific time slots: "afternoon" or "evening"
- Dynamic product selection with categories: base, food, drinks, addons, snacks
- Pricing calculated based on number of participants and selected products
- Approval workflow: bookings require admin approval before confirmation
- Calendar availability system tracks which time slots are booked

### User Roles and Permissions
- **GUEST**: Default role, can make bookings
- **MANAGER**: Can approve/decline bookings, manage products
- **DESIGNER**: Can manage site design and images
- **ADMIN**: Full access to all management features

### Internationalization
- Primary language is Hebrew (`he-IL`)
- Database schema includes both English and Hebrew fields (e.g., `nameHe`, `descriptionHe`)
- RTL support built into the UI

## Database Schema (Convex)

Key tables:
- `bookings` - Customer event bookings with product selections
- `products` - Services and products with pricing and categorization
- `users` - User accounts with role-based permissions
- `availability` - Calendar availability by date and time slot
- `services` - Service information cards for marketing
- `officeImages` - Gallery and header images

## Configuration Notes

- **Accessibility**: Comprehensive a11y testing with jest-axe and Playwright
- **PWA**: Configured with manifest, service worker, and offline support
- **Notifications**: Firebase Cloud Messaging for push notifications
- **Code Quality**: ESLint with React, TypeScript, and accessibility rules
- **Path Alias**: `@/` maps to `src/` directory

## Testing Strategy

The project emphasizes accessibility with dedicated a11y tests and comprehensive E2E testing with Playwright. Unit tests use Vitest with React Testing Library.