import type { SubscriptionPlan } from './types';

// ─── App ──────────────────────────────────────────────────────────────────────

export const APP_NAME = 'ARMenu' as const;
export const APP_DESCRIPTION =
  'Create stunning AR-enabled digital menus for your restaurant.' as const;

// ─── Subscription Plans ───────────────────────────────────────────────────────

export interface PlanLimits {
  max_restaurants: number;
  max_dishes: number;
  max_branches: number;
  max_staff: number;
  ar_models: boolean;
  analytics: boolean;
  custom_domain: boolean;
  priority_support: boolean;
}

export const PLANS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    max_restaurants: 1,
    max_dishes: 10,
    max_branches: 1,
    max_staff: 2,
    ar_models: true,
    analytics: true,
    custom_domain: false,
    priority_support: false,
  },
  pro: {
    max_restaurants: 3,
    max_dishes: Infinity,
    max_branches: 5,
    max_staff: 10,
    ar_models: true,
    analytics: true,
    custom_domain: false,
    priority_support: false,
  },
  enterprise: {
    max_restaurants: Infinity,
    max_dishes: Infinity,
    max_branches: Infinity,
    max_staff: Infinity,
    ar_models: true,
    analytics: true,
    custom_domain: true,
    priority_support: true,
  },
} as const;

// ─── File Limits ──────────────────────────────────────────────────────────────

export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MODEL_MAX_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const ALLOWED_MODEL_TYPES = [
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream', // .glb files often sent with this MIME type
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'] as const;
export const ALLOWED_MODEL_EXTENSIONS = ['.glb', '.gltf'] as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Dashboard
  DASHBOARD: '/dashboard',
  RESTAURANTS: '/dashboard/restaurants',
  RESTAURANT: (id: string) => `/dashboard/restaurants/${id}` as const,
  MENU: (restaurantId: string) => `/dashboard/restaurants/${restaurantId}/menu` as const,
  DISHES: (restaurantId: string) => `/dashboard/restaurants/${restaurantId}/dishes` as const,
  BRANCHES: (restaurantId: string) => `/dashboard/restaurants/${restaurantId}/branches` as const,
  STAFF: (restaurantId: string) => `/dashboard/restaurants/${restaurantId}/staff` as const,
  ANALYTICS: (restaurantId: string) => `/dashboard/restaurants/${restaurantId}/analytics` as const,
  QR_CODES: (restaurantId: string) => `/dashboard/restaurants/${restaurantId}/qr` as const,
  SETTINGS: '/dashboard/settings',
  BILLING: '/dashboard/billing',

  // Public menu
  PUBLIC_MENU: (slug: string) => `/menu/${slug}` as const,
  AR_VIEW: (slug: string, dishSlug: string) => `/menu/${slug}/ar/${dishSlug}` as const,

  // API
  API_AUTH_CALLBACK: '/api/auth/callback',
} as const;

// ─── Currencies ───────────────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
] as const;

export const DEFAULT_CURRENCY = 'USD' as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20 as const;
export const MAX_PAGE_SIZE = 100 as const;
