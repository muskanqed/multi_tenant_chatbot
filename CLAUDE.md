# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multi-tenant AI chatbot** built with Next.js 15, MongoDB (Mongoose), NextAuth, and Google Gemini AI. Each tenant gets an isolated, branded chatbot experience with customizable themes, AI personas, and chat history.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with increased memory allocation

# Build & Deploy
npm run build           # Production build with Turbopack
npm start              # Start production server

# Code Quality
npm run lint           # Lint with Biome
npm run format         # Format code with Biome
```

## Architecture

### Multi-Tenancy System

The application isolates data and branding per tenant using a `tenantId` field:

- **Tenant Model** (`src/models/Tenant.ts`): Stores tenant configuration including name, logo, theme colors, AI persona, and Gemini model selection
- **Tenant Config** (`src/lib/tenantConfig.ts`): CRUD operations for tenant management
- **User Model** (`src/models/User.ts`): Associates users with tenants via optional `tenantId` field
- **Chat History** (`src/models/ChatHistory.ts`): Stores conversations per tenant/session pair

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
- Password hashing with bcryptjs (12 rounds)
- JWT session strategy (30-day expiration)
- SessionProvider wraps app in `src/app/layout.tsx`

User sessions include: `id`, `email`, `name`, `role`, and `tenantId`

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
```

### Key Technical Decisions

1. **Biome over ESLint/Prettier**: Using Biome for linting and formatting
2. **Turbopack**: Enabled for faster builds (`--turbopack` flag)
3. **Memory allocation**: Dev server runs with `--max-old-space-size=2048`
4. **Streaming responses**: Chat API uses ReadableStream for real-time AI responses
5. **Session isolation**: Chat history uses `tenantId + sessionId` composite key
6. **Theme customization**: Inline styles with tenant colors, falls back to defaults

### Adding New Tenants

Tenants can be created via:
1. Admin UI (if implemented at `/admin/register`)
2. API: `POST /api/tenants` with body:
   ```json
   {
     "tenantId": "unique-id",
     "name": "Company Name",
     "logoUrl": "https://...",
     "themeColor": "#hex",
     "welcomeMessage": "...",
     "aiPersona": "...",
     "model": "gemini-1.5-flash"
   }
   ```

### Chat Session Flow

1. Client sends message to `/api/chat` with `message`, `tenantId`, `sessionId`
2. API validates tenant exists, saves user message to ChatHistory
3. Gemini streams response using tenant's AI persona and model
4. Client receives streaming chunks, displays in real-time
5. Complete response saved to ChatHistory when stream closes

### Type Safety

- NextAuth types extended in `src/types/next-auth.d.ts`
- All Mongoose models export TypeScript interfaces
- Use `ITenant`, `IUser`, `IChatHistory` interfaces when working with documents
