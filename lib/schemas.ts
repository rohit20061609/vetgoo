import { z } from "zod";

// Pet validation schema
export const petSchema = z.object({
  name: z.string().min(1, "Pet name required").max(100, "Pet name too long"),
  type: z.enum(["DOG", "CAT", "BIRD", "RABBIT", "HAMSTER", "GUINEA_PIG", "REPTILE", "FISH", "OTHER"]),
  breed: z.string().max(100, "Breed too long").optional().or(z.null()),
  age: z.number().int().min(0, "Age must be positive").max(100, "Invalid age").optional().or(z.null()),
  weight: z.number().positive("Weight must be positive").max(1000, "Weight too high").optional().or(z.null()),
  color: z.string().max(100, "Color description too long").optional().or(z.null()),
  microchipId: z.string().max(50, "Microchip ID too long").optional().or(z.null()),
  image: z.string().url("Invalid image URL").optional().or(z.null()),
});

// Appointment validation schema
export const appointmentSchema = z.object({
  petId: z.string().min(1, "Pet ID required"),
  title: z.string().min(1, "Title required").max(200, "Title too long"),
  description: z.string().max(500, "Description too long").optional().or(z.null()),
  appointmentType: z.enum(["CHECKUP", "VACCINATION", "SURGERY", "DENTAL", "GROOMING", "BEHAVIORAL", "FOLLOW_UP", "EMERGENCY", "OTHER"]),
  scheduledFor: z.string().datetime("Invalid date format"),
  duration: z.number().int().min(15, "Minimum duration 15 min").max(480, "Maximum duration 8 hours").default(30),
  veterinarian: z.string().max(100, "Veterinarian name too long").optional().or(z.null()),
  clinic: z.string().max(200, "Clinic name too long").optional().or(z.null()),
  notes: z.string().max(1000, "Notes too long").optional().or(z.null()),
});

// User profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name required").max(100, "Name too long").optional(),
  phone: z.string().regex(/^\+?[0-9\s-()]{8,}$/, "Invalid phone format").max(20, "Phone too long").optional().or(z.null()),
  address: z.string().max(200, "Address too long").optional().or(z.null()),
  city: z.string().max(100, "City too long").optional().or(z.null()),
  state: z.string().max(100, "State too long").optional().or(z.null()),
  zipCode: z.string().regex(/^[0-9\s-]{3,20}$/, "Invalid zip code").optional().or(z.null()),
  country: z.string().max(100, "Country too long").optional().or(z.null()),
});

// Chat message schema
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message required").max(4000, "Message too long"),
  conversationId: z.string().optional(),
});

// Triage schema
export const triageSchema = z.object({
  message: z.string().min(1, "Message required").max(4000, "Message too long"),
  species: z.string().max(100, "Species too long").optional(),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(4000, "History message too long"),
    })
  ).max(20, "History too long").optional().default([]),
});

// Nearby vets query schema
export const nearbyVetsSchema = z.object({
  lat: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  lng: z.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
  radius: z.number().positive("Radius must be positive").max(500, "Radius too large").default(25),
});

// Slots schema
export const slotsSchema = z.object({
  vetId: z.string().min(1, "Vet ID required"),
  date: z.string().date("Invalid date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
});

// Create payment schema (already used in payments/create)
export const createPaymentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID required"),
});
