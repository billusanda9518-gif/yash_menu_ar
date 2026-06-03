// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'restaurant_owner' | 'staff';

export type StaffRole = 'manager' | 'staff';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'paused';

export type EventType =
  | 'page_view'
  | 'menu_view'
  | 'dish_view'
  | 'ar_view'
  | 'qr_scan'
  | 'order_placed';

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dish {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  model_url: string | null;
  model_ios_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  allergens: string[];
  preparation_time: number | null;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  branch_id: string;
  table_number: string;
  qr_code_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantStaff {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: StaffRole;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  restaurant_id: string;
  event_type: EventType;
  metadata: Record<string, unknown> | null;
  session_id: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Insert / Update Variants ─────────────────────────────────────────────────

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type RestaurantInsert = Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>;
export type RestaurantUpdate = Partial<Omit<Restaurant, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;

export type BranchInsert = Omit<Branch, 'id' | 'created_at' | 'updated_at'>;
export type BranchUpdate = Partial<Omit<Branch, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>;

export type MenuCategoryInsert = Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>;
export type MenuCategoryUpdate = Partial<Omit<MenuCategory, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>;

export type DishInsert = Omit<Dish, 'id' | 'created_at' | 'updated_at'>;
export type DishUpdate = Partial<Omit<Dish, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>;

export type TableInsert = Omit<Table, 'id' | 'created_at' | 'updated_at'>;
export type TableUpdate = Partial<Omit<Table, 'id' | 'branch_id' | 'created_at' | 'updated_at'>>;

export type RestaurantStaffInsert = Omit<RestaurantStaff, 'id' | 'created_at' | 'updated_at'>;
export type RestaurantStaffUpdate = Partial<Omit<RestaurantStaff, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>;

export type SubscriptionInsert = Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
export type SubscriptionUpdate = Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  error: string | null;
  status: number;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
