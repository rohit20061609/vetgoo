# VetGo Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     VetGo Application                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   Frontend (Web)     │         │  Mobile Ready        │     │
│  ├──────────────────────┤         └──────────────────────┘     │
│  │ • Next.js 14         │                                      │
│  │ • Tailwind CSS       │         ┌────────────────────────┐   │
│  │ • React 18           │         │  External Services   │   │
│  │ • TypeScript         │         ├────────────────────────┤   │
│  │ • Framer Motion      │         │ • Anthropic Claude   │   │
│  │ • shadcn/ui          │         │ • Google OAuth       │   │
│  └──────────────────────┘         │ • Stripe             │   │
│           │                       │ • Uploadthing        │   │
│           │                       │ • Resend             │   │
│           │                       │ • Leaflet + OSM      │   │
│           ▼                       └────────────────────────┘   │
│  ┌──────────────────────────────────────┐                     │
│  │   API Layer (Next.js Routes)        │                     │
│  ├──────────────────────────────────────┤                     │
│  │ • /api/auth - Authentication        │                     │
│  │ • /api/chat/stream - AI Chat        │                     │
│  │ • /api/pets - Pet Management        │                     │
│  │ • /api/appointments - Appointments  │                     │
│  │ • /api/medical - Medical Records    │                     │
│  │ • /api/user/profile - User Profile  │                     │
│  └──────────────────────────────────────┘                     │
│           │                                                    │
│           ▼                                                    │
│  ┌──────────────────────────────────────┐                     │
│  │   Business Logic Layer               │                     │
│  ├──────────────────────────────────────┤                     │
│  │ • NextAuth.js (Authentication)      │                     │
│  │ • Prisma ORM (Database)             │                     │
│  │ • Claude API Client (AI)            │                     │
│  └──────────────────────────────────────┘                     │
│           │                                                    │
│           ▼                                                    │
│  ┌──────────────────────────────────────┐                     │
│  │   Database Layer                     │                     │
│  ├──────────────────────────────────────┤                     │
│  │ PostgreSQL (Supabase)                │                     │
│  │ • Users & Profiles                   │                     │
│  │ • Pets & Medical Records             │                     │
│  │ • Appointments                       │                     │
│  │ • Conversations                      │                     │
│  │ • Payments & Subscriptions           │                     │
│  └──────────────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser   │      │  API Routes  │      │   Database   │
│             │────▶ │              │────▶ │ (PostgreSQL) │
│ (React)     │      │ (Next.js)    │      │ (Prisma)     │
└─────────────┘      └──────────────┘      └──────────────┘
     │                      │
     │                      │
     │              ┌───────▼────────┐
     │              │  Auth Check    │
     │              │ (NextAuth.js)  │
     │              └────────────────┘
     │                      │
     └──────────────────────┤
                            │
                   ┌────────▼────────┐
                   │ AI Integration  │
                   │ (Claude API)    │
                   └─────────────────┘
```

## Frontend Component Architecture

```
Layout
├── RootLayout
│   ├── SessionProvider (NextAuth)
│   ├── QueryProvider (TanStack Query)
│   └── Metadata
│
├── Auth Pages
│   ├── /auth/signin
│   └── /auth/signup
│
└── Dashboard (Protected)
    ├── DashboardLayout
    │   ├── Sidebar (Navigation)
    │   ├── Header (User Info)
    │   └── Main Content
    │
    ├── /dashboard
    │   └── Stats + Quick Actions
    │
    ├── /dashboard/pets
    │   ├── Pet List
    │   ├── Pet Details
    │   └── Add Pet Form
    │
    ├── /dashboard/appointments
    │   ├── Appointment List
    │   └── Schedule Form
    │
    ├── /dashboard/medical
    │   └── Medical Records List
    │
    ├── /dashboard/chat
    │   ├── Conversation List
    │   ├── Message Display
    │   └── Input Form
    │
    └── /dashboard/settings
        └── User Profile Form

UI Components
├── Button
└── Toaster (Toast Notifications)
```

## State Management

```
Zustand Stores
│
├── useAppStore
│   ├── sidebarOpen (boolean)
│   ├── theme (light/dark)
│   └── selectedPetId (string | null)
│
└── useConversationStore
    ├── conversationId (string | null)
    ├── messages (array)
    ├── isLoading (boolean)
    └── actions (addMessage, setMessages, etc.)

React Query (TanStack Query)
│
├── /api/pets
├── /api/appointments
├── /api/medical
└── /api/user/profile
```

## Authentication Flow

```
1. User arrives
   ↓
2. SessionProvider checks session
   ↓
3a. If authenticated → Dashboard
   ↓
3b. If not authenticated → Sign In/Sign Up
   ↓
4. Sign In Options:
   ├── Google OAuth (via NextAuth)
   └── Email + Password
   ↓
5. Credentials validated
   ↓
6. JWT created (30 days)
   ↓
7. Redirect to Dashboard
```

## API Endpoint Structure

```
/api
├── auth
│   ├── [...nextauth] - NextAuth handler
│   └── register - Custom registration
│
├── chat
│   └── stream - Streaming chat responses
│
├── pets
│   ├── GET - List user's pets
│   └── POST - Create new pet
│
├── pets/[id]
│   ├── GET - Get pet details
│   ├── PATCH - Update pet
│   └── DELETE - Delete pet
│
└── user
    └── profile
        ├── GET - Get user profile
        └── PATCH - Update profile
```

## Database Schema Relationships

```
User
├── Profile (1:1)
├── Pets (1:many)
│   ├── MedicalRecords (1:many)
│   ├── Vaccinations (1:many)
│   ├── Medications (1:many)
│   └── Appointments (1:many)
│
├── Appointments (1:many)
│   └── Reminders (1:many)
│
├── Consultations (1:many)
├── ConversationSessions (1:many)
│   └── ConversationMessages (1:many)
│
├── Subscriptions (1:many)
└── Payments (1:many)
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│          Git Repository                 │
│          (GitHub/GitLab)                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      CI/CD Pipeline                     │
│  (GitHub Actions / Vercel)              │
│  • Tests                                │
│  • Build                                │
│  • Deploy                               │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴───────┐
        │              │
        ▼              ▼
  ┌──────────┐   ┌──────────────┐
  │ Vercel   │   │ Other Hosting│
  │(Next.js) │   │(Railway/AWS) │
  └─────┬────┘   └──────┬───────┘
        │               │
        └───────┬───────┘
                ▼
         ┌─────────────┐
         │ PostgreSQL  │
         │ (Supabase)  │
         └─────────────┘
```

## Development Environment

```
Local Machine
│
├── Node.js 18+
├── npm/yarn
│
├── Docker (Optional)
│   ├── PostgreSQL Container
│   ├── App Container
│   └── Network Bridge
│
└── Environment Files
    ├── .env.local (local config)
    ├── .env.example (template)
    └── .env.production (prod config)
```

## Performance Optimization Layers

```
┌────────────────────────────────────┐
│ Browser Cache                      │
│ (Static assets, service workers)   │
└────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│ Next.js Caching                    │
│ (Static generation, ISR)           │
└────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│ React Query Caching                │
│ (API response caching)             │
└────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│ Database Query Optimization        │
│ (Indexes, relationships)           │
└────────────────────────────────────┘
```

## Security Layers

```
┌───────────────────────────────────────┐
│ HTTPS / TLS                           │
└───────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────┐
│ CORS & CSRF Protection (NextAuth)     │
└───────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────┐
│ Authentication (JWT Sessions)         │
└───────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────┐
│ Authorization (Protected Routes)      │
└───────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────┐
│ Input Validation (Zod Schemas)        │
└───────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────┐
│ SQL Injection Prevention (Prisma ORM) │
└───────────────────────────────────────┘
```

## Scale Notes

- **Small Scale**: Single server, works fine
- **Medium Scale**: Load balancer, multiple instances
- **Large Scale**: 
  - Serverless (Vercel)
  - Database replicas
  - CDN for static content
  - Message queue for async jobs
  - Caching layer (Redis)

