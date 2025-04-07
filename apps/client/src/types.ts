// User-related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Availability-related types
export enum DayOfWeek {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

export interface AvailabilityResponse {
  id: string;
  userId: string;
  day: DayOfWeek;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface TimeSlot {
  day: DayOfWeek;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

// Appointment-related types
export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELED = "canceled",
}

export interface AppointmentResponse {
  id: string;
  userId: string;
  inviteeEmail: string;
  inviteeName?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: AppointmentStatus;
}

export interface CreateAppointmentRequest {
  userId: string;
  inviteeEmail: string;
  inviteeName?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateAppointmentRequest {
  title?: string;
  description?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  inviteeName?: string;
  inviteeEmail?: string;
}

export interface BookedSlot {
  id: string;
  startDate: string;
  endDate: string;
}

// Auth-related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
