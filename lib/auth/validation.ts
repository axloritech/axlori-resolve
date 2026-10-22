import { z } from "zod";

/**
 * Shared client-side validation schemas for authentication forms.
 * Server-side validation (Supabase Auth) remains the authority; these give
 * fast, clear feedback in the UI.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address, e.g. name@example.com.");

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[a-z]/, "Add at least one lowercase letter.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/\d/, "Add at least one number.");

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your full name.")
  .max(80, "Keep your name under 80 characters.");

export const signUpSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "You must agree to the Terms and Privacy Policy to create an account.",
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
