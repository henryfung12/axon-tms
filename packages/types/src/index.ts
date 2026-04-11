// Shared types used by both the API (NestJS) and Web (React) apps.
// The API uses these as reference — DTOs are defined separately in NestJS.

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DISPATCHER' | 'DRIVER' | 'CUSTOMER' | 'ACCOUNTANT';

export type LoadStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'AT_STOP' | 'DELIVERED' | 'CANCELLED' | 'TONU';

export type StopType = 'PICKUP' | 'DELIVERY' | 'FUEL_STOP' | 'WAYPOINT';

export type DriverStatus = 'AVAILABLE' | 'DRIVING' | 'ON_BREAK' | 'OFF_DUTY' | 'SLEEPER_BERTH' | 'HOS_LIMIT' | 'INACTIVE';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'FACTORED' | 'VOID';

export type DocumentType = 'RATE_CONFIRMATION' | 'BILL_OF_LADING' | 'PROOF_OF_DELIVERY' | 'LUMPER_RECEIPT' | 'SCALE_TICKET' | 'FUEL_RECEIPT' | 'OTHER';

// Load number prefix
export const LOAD_NUMBER_PREFIX = 'GE';

// HOS limits (hours)
export const HOS_DRIVING_LIMIT = 11;
export const HOS_ON_DUTY_LIMIT = 14;
export const HOS_CYCLE_LIMIT = 70; // 70hr / 8-day cycle
