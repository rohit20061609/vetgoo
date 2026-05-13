
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
  }
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  color?: string;
  microchipId?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  title: string;
  description?: string;
  status: string;
  appointmentType: string;
  scheduledFor: Date;
  duration: number;
  veterinarian?: string;
  clinic?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  type: string;
  title: string;
  description?: string;
  veterinarian?: string;
  clinic?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: Date;
}

export interface ConversationSession {
  id: string;
  userId: string;
  title?: string;
  topic?: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}
