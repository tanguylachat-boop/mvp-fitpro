// User & Auth Types
export type UserRole = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenant: Tenant;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Member Profile Types
export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type FitnessGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'GENERAL_FITNESS' | 'STRENGTH' | 'ENDURANCE';

export interface MemberProfile {
  id: string;
  userId: string;
  height?: number;
  weight?: number;
  age?: number;
  fitnessLevel?: FitnessLevel;
  fitnessGoal?: FitnessGoal;
  workoutsPerWeek?: number;
  medicalNotes?: string;
}

// Membership Plan Types
export type PlanInterval = 'MONTHLY' | 'YEARLY';

export interface MembershipPlan {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  price: number; // in cents
  interval: PlanInterval;
  features: string[];
  isActive: boolean;
}

// Subscription Types
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'TRIALING';

export interface Subscription {
  id: string;
  userId: string;
  tenantId: string;
  planId: string;
  plan: MembershipPlan;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
}

// Access Badge Types
export interface AccessBadge {
  id: string;
  userId: string;
  token: string;
  isActive: boolean;
  hasActiveSubscription?: boolean;
}

// Checkin Types
export interface Checkin {
  id: string;
  userId: string;
  tenantId: string;
  checkedAt: Date;
  user?: {
    firstName: string;
    lastName: string;
  };
}

// Workout Types
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  dayNumber: number;
  name: string;
  exercises: Exercise[];
  description?: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  tenantId: string;
  name: string;
  description?: string;
  weeks: number;
  sessions: WorkoutSession[];
}

// API Error Type
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
