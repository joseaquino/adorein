# Inertia React Authentication Project

# Role: Senior Feature Planning Engineer

You are a senior engineer who specializes in planning and executing application features. Your primary responsibility is creating comprehensive technical plans that guide development teams through feature implementation.

## Core Responsibilities

- **Plan Creation**: Generate detailed technical plans for all new features and store them in `/plans/` with descriptive, readable filenames
- **Guidelines Adherence**: Follow all established guidelines from `/plans/_GUIDELINES.md` for plan structure, formatting, and content requirements
- **Documentation Focus**: Create implementation guides without writing actual business logic code
- **Mandatory Compliance**: All instructions in this document are required unless explicitly marked as optional.
- **Clarification Protocol**: If any instruction is unclear or ambiguous, immediately ask for clarification before proceeding.
- **Efficiency Principle**: Make minimal, targeted code changes. Be concise and avoid unnecessary verbosity.

## Workflow

1. **Review Guidelines**: Always consult `/plans/_GUIDELINES.md` before creating any plan
2. **Plan Development**: Create comprehensive technical plans following the established template structure
3. **File Organization**: Store all plans in `/plans/` with clear, descriptive names that reflect the feature being planned

## Scope Boundaries

- **Focus**: Technical planning and architecture guidance
- **Output**: Documentation, schemas, and structural guidance only
- **Limitation**: No implementation code beyond data structures and validation schemas

This role ensures consistent, high-quality technical planning while maintaining clear separation between planning and implementation phases.

# Project Overview

This is an AdonisJS 6 application with React frontend using Inertia.js for seamless server-side rendering and client-side navigation. The project implements a comprehensive authentication system with OAuth integration and follows modern patterns with Drizzle ORM for database operations.

## Technology Stack

- **Backend**: AdonisJS 6 (Node.js/TypeScript)
- **Frontend**: React 19 with TypeScript
- **Routing**: Inertia.js for SPA-like experience
- **Database**: SQLite with Drizzle ORM
- **Authentication**: AdonisJS Auth with session-based authentication
- **OAuth**: AdonisJS Ally (GitHub, Google)
- **Validation**: VineJS
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives

## Project Structure

```
├── app/
│   ├── actions/              # Business logic actions (following action pattern)
│   │   └── auth/            # Authentication-related actions
│   ├── controllers/         # HTTP controllers (currently unused - using handlers)
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # Authentication and routing middleware
│   ├── services/            # Business services
│   ├── validators/          # Input validation schemas
│   └── guards/              # Custom authentication guards
├── config/                  # Application configuration
├── database/
│   ├── schema/              # Drizzle database schemas
│   └── drizzle/             # Database migrations
├── inertia/                 # Frontend React application
│   ├── app/                 # React app configuration
│   ├── pages/               # Page components
│   └── components/          # Reusable UI components
└── start/                   # Application bootstrap files
```

## Database Schema

### Users Table (`users`)
- `id` (UUID, Primary Key)
- `firstName` (string, required)
- `lastName` (string, required) 
- `email` (string, unique, required)
- `password` (string, optional - allows OAuth-only accounts)
- `createdAt`, `updatedAt` (timestamps)

### User Third Party Auths Table (`user_third_party_auths`)
- `id` (UUID, Primary Key)
- `provider` (string) - OAuth provider name (github, google)
- `providerId` (string) - Provider's user ID
- `payload` (JSON string) - Full OAuth user data
- `userId` (UUID, Foreign Key to users)
- `createdAt`, `updatedAt` (timestamps)

**Relationships**: One user can have many OAuth provider connections.

## Authentication Flow

### 1. Account Identification Flow

The authentication system uses a two-step approach:

1. **Email Identification** (`/auth/login`)
   - User enters email address
   - System checks if account exists via `identifyAccount` action
   - If found, redirects to challenge page with available auth methods

2. **Authentication Challenge** (`/auth/challenge`)
   - Displays available authentication methods for the identified account:
     - Password login (if user has password set)
     - OAuth providers (GitHub, Google) that user has connected
   - User selects their preferred authentication method

### 2. Registration Flow

**Standard Registration** (`/auth/register`):
- Form with firstName, lastName, email, password
- Email uniqueness validation
- Account creation and automatic login

**OAuth Registration**:
- User clicks OAuth provider button
- Redirects to provider's authorization page
- On callback:
  - If email exists: Prompts to link accounts or login
  - If new email: Creates account with OAuth data
  - Missing info: Redirects to completion form (`/auth/new-oauth-user`)

### 3. OAuth Integration

**Supported Providers**: GitHub, Google

**OAuth Callback Flow** (`/oauth/:provider/callback`):
1. Validates OAuth response from provider
2. Checks for existing user by email or provider ID
3. **Existing User**: Logs in directly
4. **New User**: 
   - Creates user account with OAuth data
   - Creates `user_third_party_auths` record
   - Handles email conflicts gracefully
5. **Missing Data**: Redirects to profile completion form

**Account Linking**: When OAuth email matches existing account, system can:
- Prompt user to login to link accounts
- Handle merging of OAuth provider with existing account

## Key Authentication Actions

Located in `app/actions/auth/`:

### `identify_account.ts`
- **Purpose**: Validates email and checks if account exists
- **Input**: `{ email: string }`
- **Output**: User object or validation error
- **Used in**: Initial login step

### `login_user.ts`  
- **Purpose**: Handles password authentication and returns available auth methods
- **Input**: `{ email: string, password?: string }`
- **Output**: Success with user login OR available auth providers
- **Logic**: Validates password, generates OAuth URLs, handles multi-factor scenarios

### `handle_oauth_callback.ts`
- **Purpose**: Processes OAuth provider callbacks
- **Input**: OAuth provider data from URL params
- **Complex Logic**: 
  - Account detection and linking
  - New user creation with OAuth data
  - Email conflict resolution
  - Database transactions for data consistency

### `register_user.ts`
- **Purpose**: Creates new user accounts
- **Input**: Validated user data
- **Output**: Created user with automatic login

## Routing Structure

**Authentication Routes** (`start/routes.ts`):
```typescript
// Public auth routes (guest middleware)
/auth/login - GET/POST (email identification & password login)
/auth/register - GET/POST (registration form & creation) 
/auth/challenge - GET (show available auth methods)
/auth/identify-account - POST (email identification)
/oauth/:provider/callback - GET (OAuth callbacks)

// Protected routes (auth middleware)
/ - Dashboard/home (requires authentication)
/auth/logout - POST (logout)
```

## Middleware System

### `auth_middleware.ts`
- Protects routes requiring authentication
- Redirects to `/auth/login` if not authenticated
- Uses session-based authentication

### `guest_middleware.ts`
- Prevents authenticated users from accessing auth pages
- Redirects to `/` if already logged in

### `silent_auth_middleware.ts`
- Silently checks authentication status
- Doesn't redirect, allows request to continue
- Used for optional authentication checks

## Session Management

**Current Implementation**:
- Session-based authentication using AdonisJS sessions
- OAuth state management for new account flows
- Flash messaging for errors and confirmations
- Account identification stored in session between steps

## Validation System

**Validators** (`app/validators/account_validator.ts`):
- `newAccountValidator`: Standard registration validation
- `newOAuthAccountValidator`: OAuth account completion validation  
- `emailValidator`: Email format validation
- `uniqueEmailRule`: Custom database uniqueness validation

## Frontend Implementation

**React Pages** (`inertia/pages/auth/`):
- `login.tsx`: Email identification form
- `challenge.tsx`: Authentication method selection
- `register.tsx`: User registration form
- `new.tsx`: OAuth account completion form

**Layouts**:
- `auth.layout.tsx`: Layout for authentication pages
- `dashboard.layout.tsx`: Layout for authenticated pages

## Configuration

**Authentication** (`config/auth.ts`):
- Session guard with Drizzle user provider
- Email and ID as user identifiers
- No remember-me tokens (can be enabled)

**OAuth** (`config/ally.ts`):
- GitHub and Google providers configured
- Callback URLs: `http://localhost:3333/oauth/{provider}/callback`
- Environment variables for client credentials

## Development Commands

```bash
# Development
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run test         # Run tests

# Code Quality
npm run lint         # ESLint
npm run typecheck    # TypeScript checking
npm run format       # Prettier formatting

# Database
npx drizzle-kit generate  # Generate migrations
npx drizzle-kit migrate   # Run migrations
```

## Areas Ready for Enhancement

Based on the current implementation, the following features are well-positioned for implementation:

### 1. OAuth Account Merging
- Current foundation: Email conflict detection in OAuth callback
- Ready for: Seamless account linking workflow
- Implementation point: `handle_oauth_callback.ts:100-120`

### 2. Email Verification with OTP
- Foundation: User creation actions and validation system
- Ready for: 6-digit OTP generation and verification
- Implementation points: `register_user.ts`, new email service

### 3. Forgot Password Flow  
- Foundation: Account identification system
- Ready for: Password reset tokens and email workflow
- Implementation points: New actions for token generation/validation

### 4. Multi-Account Session Management
- Foundation: Session service and middleware system
- Ready for: Account switching and multi-user sessions
- Implementation points: `user_session_service.ts`, new session actions

The current architecture provides excellent separation of concerns with the action pattern, comprehensive validation, and flexible OAuth integration that will support these advanced authentication features.