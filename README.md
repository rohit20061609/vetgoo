# VetGo - AI-Powered Pet Healthcare Platform

A comprehensive fullstack web application built with modern technologies to help pet owners manage their pets' health, book appointments, and access AI-powered veterinary advice.

## 🎯 Features

### Frontend
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for responsive styling
- **shadcn/ui** component library
- **Framer Motion** for smooth animations
- **React Hook Form** + **Zod** for form validation
- **TanStack Query** for efficient data fetching
- **Zustand** for global state management
- **Leaflet.js** + **OpenStreetMap** for interactive maps
- **Recharts** for analytics dashboards

### Backend
- **Next.js API Routes** (fullstack in same repo)
- **Prisma ORM** for database management
- **PostgreSQL** (Supabase free tier)
- **NextAuth.js** for authentication
  - Google OAuth
  - Email OTP support
- **Stripe** for payment processing (test mode)
- **Uploadthing** for image uploads
- **Resend** for transactional emails

### AI Integration
- **Anthropic Claude API** (claude-sonnet-4-20250514)
- Veterinary knowledge base system prompt
- Streaming responses with real-time typing effect
- Conversation memory per session
- Multi-turn dialogue support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase free tier)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vetgo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure the following in `.env.local`:
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Anthropic Claude API
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Uploadthing (image uploads)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Resend (emails)
RESEND_API_KEY="your-resend-api-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

4. **Set up the database**
```bash
npm run db:push
```

Generate Prisma Client:
```bash
npm run db:generate
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
vetgo/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── chat/                # AI chat streaming
│   │   └── pets/                # Pet management
│   ├── dashboard/               # Protected dashboard
│   │   ├── pets/               # Pet management pages
│   │   ├── appointments/       # Appointment booking
│   │   ├── medical/            # Medical records
│   │   ├── chat/               # AI veterinarian chat
│   │   └── settings/           # User settings
│   ├── auth/                   # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   └── layout.tsx              # Root layout
├── components/
│   └── ui/                      # Reusable UI components
├── lib/                         # Utility functions
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Prisma client
│   ├── ai.ts                   # Anthropic Claude integration
│   ├── providers.tsx           # React Query provider
│   └── utils.ts                # Common utilities
├── styles/                     # Global styles and Tailwind CSS
├── store/                      # Zustand state management
├── prisma/
│   └── schema.prisma           # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

## 🎨 Key Pages

### Public Pages
- `/` - Landing page with features overview
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page

### Protected Dashboard
- `/dashboard` - Overview with statistics
- `/dashboard/pets` - Pet management
- `/dashboard/pets/new` - Add new pet
- `/dashboard/appointments` - Schedule appointments
- `/dashboard/medical` - Medical records
- `/dashboard/chat` - AI veterinarian assistant
- `/dashboard/settings` - User settings

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signout` - User sign out

### Pets
- `GET /api/pets` - List user's pets
- `POST /api/pets` - Create new pet
- `GET /api/pets/:id` - Get pet details
- `PATCH /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Chat (AI)
- `POST /api/chat/stream` - Stream chat response

### Upcoming Endpoints
- Appointments management
- Medical records CRUD
- Payments/Subscriptions
- File uploads
- User profile management

## 🤖 AI Veterinarian Features

The AI veterinarian is powered by Claude API with a specialized veterinary knowledge base. Features include:

- **Real-time responses** with streaming
- **Conversation memory** within sessions
- **Expert knowledge** about:
  - Pet health conditions and diseases
  - Nutrition and diet requirements
  - Medication and treatment options
  - Preventive care and vaccinations
  - Emergency pet care guidelines
  - Behavioral issues and training
  - Breed-specific concerns

### Example Queries
- "What should I feed my dog?"
- "Why is my cat acting strange?"
- "When should I vaccinate my puppy?"
- "How do I brush my rabbit?"

## 🔐 Security Features

- **NextAuth.js** for secure authentication
- **JWT sessions** with 30-day expiration
- **Password hashing** with bcryptjs
- **CSRF protection** via NextAuth
- **Environment variables** for sensitive data
- **Database encryption** options available

## 💳 Payment Integration

Stripe integration with test mode for:
- Subscription management
- One-time payments
- Webhook handling
- Invoice generation

## 📧 Email Service

Resend integration for:
- Verification emails
- Appointment reminders
- Medical alerts
- Newsletter updates

## 🗺️ Map Integration

Leaflet.js with OpenStreetMap for:
- Finding nearby veterinary clinics
- Distance calculation
- Location visualization
- No API key required (uses OSM)

## 📊 Analytics Dashboard

Recharts for visualizing:
- Pet health trends
- Medication adherence
- Vaccination schedule
- Appointment history

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Run linter
npm run lint
```

## 📦 Build & Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Deployment Platforms
- **Vercel** (recommended for Next.js)
- **Railway**
- **Render**
- **AWS EC2**
- **Docker** containerization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Database Schema

Key entities:
- **User** - Pet owners and veterinarians
- **Pet** - Pet information and details
- **Appointment** - Veterinary appointments
- **MedicalRecord** - Health records and test results
- **Medication** - Current and past medications
- **Vaccination** - Vaccination history
- **ConversationSession** - AI chat sessions
- **Payment** - Payment transactions
- **Subscription** - Subscription plans

See `prisma/schema.prisma` for full schema details.

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Verify network connectivity to database host

### Missing Environment Variables
- Copy all variables from .env.example
- Fill in actual values for each service
- Restart dev server after changes

### Authentication Issues
- Clear browser cookies
- Check NEXTAUTH_SECRET length (min 32 chars)
- Verify callback URLs match NEXTAUTH_URL

### AI Chat Not Working
- Verify ANTHROPIC_API_KEY is valid
- Check API rates and billing
- Ensure internet connectivity

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js](https://next-auth.js.org/)
- [Anthropic Claude API](https://www.anthropic.com/api)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

Need help? Open an issue on GitHub or contact the development team.

## 🎉 Acknowledgments

- Built with modern React patterns
- Inspired by user-centric health applications
- Community-driven development

---

**Happy coding! 🐾**