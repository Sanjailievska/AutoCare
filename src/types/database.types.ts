// Hand-written types mirroring supabase/schema.sql.
// If you use the Supabase CLI, you can regenerate this file exactly with:
//   supabase gen types typescript --project-id <ref> > src/types/database.types.ts
// Kept hand-written here so the project has no external-tooling dependency.

export type UserRole = 'customer' | 'shop' | 'admin'
export type UrgencyLevel = 'low' | 'normal' | 'urgent'
export type RequestStatus =
  | 'SUBMITTED' | 'ACCEPTED' | 'DIAGNOSING' | 'ESTIMATE_SENT'
  | 'CUSTOMER_APPROVED' | 'IN_REPAIR' | 'READY_FOR_PICKUP' | 'COMPLETED'
  | 'REJECTED' | 'CANCELLED'
export type EstimateStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type EstimateItemType = 'PART' | 'LABOR' | 'SERVICE'
export type RepairStatus = 'IN_REPAIR' | 'READY_FOR_PICKUP' | 'COMPLETED'
export type NotificationType =
  | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'DIAGNOSIS_ADDED' | 'ESTIMATE_READY'
  | 'ESTIMATE_APPROVED' | 'ESTIMATE_REJECTED' | 'REPAIR_STARTED' | 'REPAIR_READY'
  | 'REPAIR_COMPLETED' | 'NEW_REQUEST' | 'REVIEW_RECEIVED' | 'SHOP_APPROVED'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  is_demo: boolean
}

export interface RepairShop {
  id: string
  owner_id: string
  name: string
  description: string | null
  address: string | null
  city: string
  phone: string | null
  email: string | null
  website: string | null
  opening_hours: string | null
  logo_url: string | null
  rating: number
  is_approved: boolean
  is_active: boolean
  created_at: string
  is_demo: boolean
}

export interface Mechanic {
  id: string
  shop_id: string
  profile_id: string | null
  full_name: string
  specialization: string | null
  is_active: boolean
  created_at: string
}

export interface Vehicle {
  id: string
  customer_id: string
  make: string
  model: string
  year: number
  engine: string | null
  fuel_type: string | null
  transmission: string | null
  mileage: number | null
  license_plate: string | null
  vin: string | null
  image_url: string | null
  created_at: string
}

export interface Service {
  id: string
  shop_id: string
  name: string
  description: string | null
  category: string | null
  base_price: number | null
  estimated_duration: string | null
  is_active: boolean
  created_at: string
}

export interface RepairRequest {
  id: string
  customer_id: string
  vehicle_id: string
  shop_id: string
  service_id: string | null
  category: string
  title: string
  description: string
  urgency: UrgencyLevel
  preferred_date: string | null
  status: RequestStatus
  assigned_mechanic_id: string | null
  created_at: string
  updated_at: string
}

export interface RepairRequestImage {
  id: string
  repair_request_id: string
  image_url: string
  created_at: string
}

export interface Diagnosis {
  id: string
  repair_request_id: string
  mechanic_id: string | null
  description: string
  recommended_repairs: string | null
  notes: string | null
  created_at: string
}

export interface Estimate {
  id: string
  repair_request_id: string
  total_amount: number
  notes: string | null
  status: EstimateStatus
  created_at: string
  approved_at: string | null
}

export interface EstimateItem {
  id: string
  estimate_id: string
  description: string
  item_type: EstimateItemType
  quantity: number
  unit_price: number
  total_price: number
}

export interface Repair {
  id: string
  repair_request_id: string
  mechanic_id: string | null
  status: RepairStatus
  started_at: string | null
  completed_at: string | null
  final_cost: number | null
  notes: string | null
}

export interface RepairImage {
  id: string
  repair_id: string
  image_url: string
  created_at: string
}

export interface Review {
  id: string
  customer_id: string
  shop_id: string
  repair_request_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  related_request_id: string | null
  is_read: boolean
  created_at: string
}

// Minimal Database generic so supabase-js typing works without the full
// generated schema — table rows are typed via the interfaces above at the
// call site instead of through this generic's Row/Insert/Update variants.
export type Database = Record<string, unknown>
