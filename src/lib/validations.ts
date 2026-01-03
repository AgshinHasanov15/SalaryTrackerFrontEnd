import { z } from 'zod';

// Worker validation schemas
export const workerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  position: z
    .string()
    .trim()
    .min(1, 'Position is required')
    .max(100, 'Position must be less than 100 characters'),
  monthlySalary: z
    .number()
    .positive('Salary must be a positive number')
    .max(10000000, 'Salary exceeds maximum allowed value')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  photo: z
    .string()
    .url('Please enter a valid URL')
    .max(2000, 'URL is too long')
    .optional()
    .or(z.literal('')),
});

export const workerNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, 'Note content is required')
    .max(2000, 'Note content must be less than 2000 characters'),
});

// Payment validation schema
export const paymentSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required'),
  amount: z
    .number()
    .positive('Amount must be a positive number')
    .max(10000000, 'Amount exceeds maximum allowed value'),
  date: z.date(),
  note: z
    .string()
    .trim()
    .max(500, 'Note must be less than 500 characters')
    .optional(),
});

// Technique validation schema
export const techniqueSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Technique name is required')
    .max(100, 'Name must be less than 100 characters'),
  monthlyRent: z
    .number()
    .positive('Monthly rent must be a positive number')
    .max(100000000, 'Monthly rent exceeds maximum allowed value'),
  plannedWorkingDays: z
    .number()
    .int('Working days must be a whole number')
    .min(1, 'At least 1 working day is required')
    .max(31, 'Cannot exceed 31 days'),
  startDate: z.date(),
  endDate: z.date().optional(),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
});

// Type exports for validated data
export type ValidatedWorker = z.infer<typeof workerSchema>;
export type ValidatedWorkerNote = z.infer<typeof workerNoteSchema>;
export type ValidatedPayment = z.infer<typeof paymentSchema>;
export type ValidatedTechnique = z.infer<typeof techniqueSchema>;

// Helper function to safely parse and return errors
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T; errors?: never } | { success: false; errors: Record<string, string>; data?: never } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}
