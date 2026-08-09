import { z } from 'zod';

export const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createEventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['normal_match', 'tournament']),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  facilityId: z.string().min(1, 'Facility is required'),
  courtIds: z.array(z.string()).min(1, 'Select at least 1 court'),
  maxPlayers: z.number().int().positive(),
  visibility: z.enum(['private', 'public']),
});

export const scoreEntrySchema = z.object({
  matchId: z.string(),
  team1Score: z.number().int().min(0),
  team2Score: z.number().int().min(0),
});
