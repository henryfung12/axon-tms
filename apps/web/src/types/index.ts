// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DISPATCHER'
  | 'DRIVER'
  | 'CUSTOMER'
  | 'ACCOUNTANT';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export type TenantPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface Tenant {
  id: string;
  slug: string;
  companyName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  plan: TenantPlan;
  cargoWiseEnabled?: boolean;
  quickbooksEnabled?: boolean;
  netsuiteEnabled?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  tenant: Tenant;
  accessToken: string;
}

export interface MeResponse {
  user: AuthUser & { phone?: string };
  tenant: Tenant;
}

// ─── Loads ────────────────────────────────────────────────────────────────────

export type LoadStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'AT_STOP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'TONU';

export type StopType = 'PICKUP' | 'DELIVERY' | 'FUEL_STOP' | 'WAYPOINT';

export interface Stop {
  id: string;
  type: StopType;
  sequence: number;
  facilityName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
  scheduledAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface Load {
  id: string;
  loadNumber: string;
  customer: { id: string; name: string };
  driver?: { id: string; user: { firstName: string; lastName: string } };
  status: LoadStatus;
  commodity?: string;
  weight?: number;
  rate: number;
  totalRate: number;
  stops: Stop[];
  createdAt: string;
  updatedAt: string;
}

export interface LoadsResponse {
  data: Load[];
  total: number;
  page: number;
  limit: number;
}

// ─── Drivers ──────────────────────────────────────────────────────────────────

export type DriverStatus =
  | 'AVAILABLE'
  | 'DRIVING'
  | 'ON_BREAK'
  | 'OFF_DUTY'
  | 'SLEEPER_BERTH'
  | 'HOS_LIMIT'
  | 'INACTIVE';

export interface Driver {
  id: string;
  user: { id: string; firstName: string; lastName: string; email: string; phone?: string };
  cdlClass?: string;
  cdlExpiry?: string;
  status: DriverStatus;
  currentLat?: number;
  currentLng?: number;
  hosHoursUsed: number;
  updatedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
