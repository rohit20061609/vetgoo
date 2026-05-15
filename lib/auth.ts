import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // SECURITY: Disabled - prevents account linking attacks
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Email and OTP are required");
        }

        // Verify OTP
        const isValid = await verifyOTP(credentials.email, credentials.otp);

        if (!isValid) {
          throw new Error("Invalid OTP");
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
            },
          });
        }

        // Return user with guaranteed non-null email
        return {
          id: user.id,
          email: user.email || credentials.email,
          name: user.name,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`User ${user.email} signed in`);
    },
    async signOut() {
      console.log("User signed out");
    },
  },
  // SECURITY: Configure secure cookies for production
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS-only in production
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
    pkceCodeVerifier: {
      name: `__Secure-next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60, // 15 minutes
      },
    },
  },
};

// OTP verification function - MUST be implemented with real logic
// This is a placeholder that should connect to your OTP storage (Redis, DB, etc.)
async function verifyOTP(_email: string, _otp: string): Promise<boolean> {
  // TODO: Implement actual OTP verification logic:
  // 1. Look up OTP record in Redis or database by email
  // 2. Check if OTP matches and hasn't expired (typically 5-10 min)
  // 3. Delete the OTP record after verification (one-time use)
  // 4. Return true only if valid and not expired, false otherwise
  
  // For now, always return false to prevent unauthorized access
  // Remove this line once OTP service is implemented
  return false;
}
