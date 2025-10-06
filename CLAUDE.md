# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multi-tenant AI chatbot** built with Next.js 15, MongoDB (Mongoose), NextAuth, and Google Gemini AI. Each tenant gets an isolated, branded chatbot experience with customizable themes, AI personas, and chat history.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with increased memory allocation

# Build & Deploy
npm run build           # Production build (webpack for Vercel compatibility)
npm start              # Start production server

# Code Quality
npm run lint           # Lint with Biome
npm run format         # Format code with Biome
```

## Architecture

### Multi-Tenancy System

The application uses a three-tier architecture:

1. **Admin** (single, env-based): One admin user configured via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables. Does not require database access.
2. **Tenants** (multiple organizations): Each tenant represents a company/organization with isolated branding and configuration.
3. **Users/Clients** (per tenant): Each tenant has multiple users/clients who interact with the chatbot.

**Database Models:**

- **Tenant Model** (`src/models/Tenant.ts`): Stores tenant configuration including name, unique domain (for whitelabeling), logo, theme colors, AI persona, and Gemini model selection
- **Tenant Config** (`src/lib/tenantConfig.ts`): CRUD operations for tenant management
- **User Model** (`src/models/User.ts`): All users belong to a tenant (required `tenantId` field). Email uniqueness is scoped per tenant using compound index `{email, tenantId}`.
- **Chat History** (`src/models/ChatHistory.ts`): Stores conversations per user (userId + sessionId composite key)
- **Chat Session** (`src/models/ChatSession.ts`): Stores session metadata per user for sidebar display

### Database Layer

MongoDB connection uses **cached connection pattern** (`src/lib/mongoose.ts`) to prevent connection pool exhaustion in serverless environments. All database operations should use `await connectDB()` before Mongoose queries.

Models follow this pattern:
```typescript
const Model = mongoose.models.ModelName || mongoose.model('ModelName', schema);
```

This prevents "Cannot overwrite model" errors during hot reload.

### Authentication

NextAuth v4 with credentials provider:
- Configuration: `src/lib/auth.ts`
- API route: `src/app/api/auth/[...nextauth]/route.ts`
- Custom sign-in/up pages: `src/app/auth/signin` and `src/app/auth/signup`
- Password hashing with bcryptjs (12 rounds) for tenant users
- JWT session strategy (30-day expiration)
- SessionProvider wraps app in `src/app/layout.tsx`

**Authentication Flow:**
1. Admin login: Checks `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env (no DB query)
2. Tenant user login: Queries database for user credentials, validates against bcrypt hash

User sessions include: `id`, `email`, `name`, `role` (`'admin'` or `'user'`), and `tenantId` (optional, only for tenant users)

### AI Integration

Google Gemini AI integration (`src/lib/gemini.ts`):
- `streamGeminiResponse()`: Returns streaming response for real-time chat
- `getGeminiResponse()`: Returns complete response as string
- Uses tenant-specific model and AI persona from tenant config
- Requires `GEMINI_API_KEY` environment variable

### API Routes Structure

**Chat API** (`/api/chat`):
- Validates tenant, saves user message, streams AI response, saves assistant message
- Uses ReadableStream for chunked responses

**Tenant Management** (`/api/tenants`):
- GET: List all tenants
- POST: Create tenant (validates unique tenantId)
- GET `/api/tenants/[tenantId]`: Fetch specific tenant
- PUT `/api/tenants/[tenantId]`: Update tenant
- DELETE `/api/tenants/[tenantId]`: Delete tenant

**Auth** (`/api/auth`):
- `/api/auth/signup`: User registration with bcrypt hashing
- `/api/auth/[...nextauth]`: NextAuth handlers

### Component Architecture

**Feature Components** (in `src/components/`):
- `ChatUI.tsx`: Main chat interface with message state and API integration
- `MessageBubble.tsx`: Individual message display with theme support
- `TenantHeader.tsx`: Branded header with logo and theme colors
- `TenantStats.tsx`: Analytics widget fetching from `/api/stats/[tenantId]`
- `ThemePreview.tsx`: Live preview of tenant theme customization
- `ChatExportButton.tsx`: Export chat history to TXT/MD/JSON
- `ErrorBoundary.tsx`: Class component for error recovery
- `SessionProvider.tsx`: NextAuth client wrapper

**UI Components**: Radix UI + Tailwind (in `src/components/ui/`)

### Environment Variables

Required in `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/multi_tenant_chatbot
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
GEMINI_API_KEY=<your-gemini-api-key>
ADMIN_EMAIL=<admin-email-address>
ADMIN_PASSWORD=<admin-password>
```

**Note**: Admin credentials are stored in environment variables and do not require database access. The admin role is separate from tenant users.

### Key Technical Decisions

1. **Biome over ESLint/Prettier**: Using Biome for linting and formatting
2. **Turbopack**: Only enabled for development (production builds use webpack to avoid lightningcss native module issues on Vercel)
3. **Memory allocation**: Dev server runs with `--max-old-space-size=2048`
4. **Streaming responses**: Chat API uses ReadableStream for real-time AI responses
5. **User isolation**: Chat history uses `userId + sessionId` composite key for complete user-level isolation
6. **Theme customization**: Inline styles with tenant colors, falls back to defaults
7. **Domain-based whitelabeling**: Each tenant has a unique domain for verification and customization
8. **Base64 logo storage**: Tenant logos are stored as base64-encoded strings in the database for simplified management

### Adding New Tenants

Tenants can be created via:
1. Admin UI at `/admin` (admin credentials required)
2. API: `POST /api/tenants` with body:
   ```json
   {
     "tenantId": "unique-id",
     "name": "Company Name",
     "domain": "example.com",
     "logoUrl": "https://...",
     "themeColor": "#hex",
     "welcomeMessage": "...",
     "aiPersona": "...",
     "model": "gemini-2.0-flash-exp"
   }
   ```

**Required Fields:**
- `tenantId`: Unique identifier (lowercase, no spaces)
- `name`: Company/organization name
- `domain`: Unique domain for whitelabeling (e.g., "example.com")

**Optional Fields:**
- `logoUrl`: Company logo as base64-encoded string (uploaded via file input in admin UI)
- `themeColor`: Primary theme color (hex code)
- `welcomeMessage`: Custom welcome message for chatbot
- `aiPersona`: AI assistant personality/instructions
- `model`: Gemini model to use (default: "gemini-2.0-flash-exp")

**Logo Upload:**
- Logos are uploaded via file input in the admin dashboard
- Automatically converted to base64 and stored in the database
- Max size: 2MB
- Supported formats: JPG, PNG, GIF

### Chat Session Flow

1. Client sends message to `/api/chat` with `message`, `userId`, `sessionId`, and optionally `tenantId`
2. API validates tenant exists (if provided), saves user message to ChatHistory (linked to userId)
3. Gemini streams response using tenant's AI persona and model
4. Client receives streaming chunks, displays in real-time
5. Complete response saved to ChatHistory (linked to userId) when stream closes

**Note**: Chat history is stored per user (not per tenant), ensuring complete user-level data isolation.

### Type Safety

- NextAuth types extended in `src/types/next-auth.d.ts`
- All Mongoose models export TypeScript interfaces
- Use `ITenant`, `IUser`, `IChatHistory` interfaces when working with documents
