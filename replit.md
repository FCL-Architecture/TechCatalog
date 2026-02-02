# TechCatalog - Technology Standards Catalog Review & Approval System

## Overview

TechCatalog is a full-stack web application for managing enterprise technology standards catalogs. It replaces SharePoint-based technology catalog management with a centralized system that enables technology governance teams to maintain, review, and approve technology items with proper workflow controls.

The system provides:
- Centralized technology catalog management with PostgreSQL database
- Quarterly review workflows with automatic routing to category team leaders
- Standardized data entry through dropdown selections
- Dashboard visibility into technology portfolio status
- Complete audit trail for technology approval decisions
- Excel import functionality for migrating legacy SharePoint data

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Charts**: Recharts for dashboard analytics
- **Forms**: React Hook Form with Zod validation

The frontend follows a pages-based structure where each page lives in `client/src/pages/` and uses shared components from `client/src/components/`. Custom hooks in `client/src/hooks/` encapsulate API calls and business logic.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for request/response validation
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth (OIDC-based) with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **File Processing**: Multer for Excel file uploads, XLSX for parsing

The server uses a storage layer pattern (`server/storage.ts`) that abstracts database operations, making it easier to test and modify data access logic.

### Database Schema
Located in `shared/schema.ts`:
- **users**: User accounts with Replit Auth integration
- **sessions**: Session storage for authentication
- **categories**: Technology categories with assigned team leaders
- **catalogItems**: Technology catalog entries with extensive metadata fields
- **reviews**: Review records with verdicts and comments
- **reviewCycles**: Quarterly review cycle management
- **categoryReviewProgress**: Tracks review progress per category per cycle

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle database schemas and Zod validation schemas
- `routes.ts`: API route definitions with type-safe request/response schemas
- `models/auth.ts`: User and session type definitions

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Vite builds static assets to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Scripts**: Custom build script in `script/build.ts` handles both client and server builds

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database migrations stored in `migrations/` directory, push with `npm run db:push`

### Authentication
- **Replit Auth**: OIDC-based authentication configured via `ISSUER_URL` and `REPL_ID` environment variables
- **Session Secret**: Required `SESSION_SECRET` environment variable for secure session cookies

### Email (Optional)
- **Nodemailer**: SMTP integration for review notifications
- Environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

### Key NPM Dependencies
- `@tanstack/react-query`: Server state management
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `zod`: Runtime type validation for API contracts
- `xlsx`: Excel file parsing for data import
- `recharts`: Dashboard visualizations
- `react-hook-form`: Form handling with validation
- `passport` / `openid-client`: Authentication framework