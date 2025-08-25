import { z } from "zod";

export const signUpFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  phoneCode: z.string(),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
  otp: z.string().refine((val) => val === "" || val.length === 6, {
    message: "OTP must be 6 digits"
  }).optional(),
});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
