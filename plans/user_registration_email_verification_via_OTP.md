# User Registration Email Verification via OTP - Implementation Plan

## Table of Contents

### Core Structure

- [Plan Status](#plan-status)
- [Phase Completion Status](#phase-completion-status)
- [Overview](#overview)
- [Current Registration Flow Analysis](#current-registration-flow-analysis)
- [Updated Flow Summary](#updated-flow-summary)
- [Security Considerations](#security-considerations)

### Implementation Details

- [Database Schema Changes](#database-schema-changes)
- [Modified Registration Flow](#modified-registration-flow)
- [New Actions Required](#new-actions-required)
- [Middleware Updates](#middleware-updates)
- [New Routes Required](#new-routes-required)
- [Updated Handlers](#updated-handlers)
- [Updated Frontend Pages](#updated-frontend-pages)
- [Validation Updates](#validation-updates)

### Email Integration

- [Resend Email Integration](#resend-email-integration)
- [Configuration Variables](#configuration-variables)

### Quality & Review

- [Database Maintenance](#database-maintenance)
- [Automated Testing Plan](#automated-testing-plan)
- [Risk Assessment & Rollback Strategy](#risk-assessment--rollback-strategy)
- [Change Size Estimation](#change-size-estimation)
- [Visual Flow Documentation](#visual-flow-documentation)
- [Functionality Review Plan](#functionality-review-plan)

### Additional Information

- [Success Metrics](#success-metrics)
- [Future Enhancements](#future-enhancements)

## Plan Status

| Field                 | Value                                        |
| --------------------- | -------------------------------------------- |
| **Status**            | Phase 4 Complete                             |
| **Percent Done**      | 95%                                          |
| **Title**             | User Registration Email Verification via OTP |
| **Start Date**        | 2025-01-07                                   |
| **End Date**          | TBD                                          |
| **Plan Slug**         | user-registration-email-verification-via-OTP |
| **Unique Identifier** | `plan_20250107_143522_otp_verification`      |

## Phase Completion Status

### ✅ Phase 1: Database Schema (COMPLETED)

- [x] Database migration for `user_email_verifications` table
- [x] Updated `users` schema with `emailVerifiedAt` and `verificationSource` fields
- [x] Created `user_email_verifications` schema file
- [x] Added database indexes for performance
- [x] Created Drizzle schema definitions
- [x] Generated migration files

### ✅ Phase 2: Backend Logic (COMPLETED)

- [x] Implemented `generate_email_verification_otp` action
- [x] Implemented `verify_email_otp` action
- [x] Implemented `resend_email_verification` action
- [x] Updated `register_user` action to create unverified accounts
- [x] Created email verification middleware
- [x] Updated auth middleware to check email verification
- [x] Added new authentication handlers for email verification
- [x] Updated registration handler to generate OTP
- [x] Added new routes for email verification

### ✅ Phase 3: Frontend (COMPLETED)

- [x] Create email verification page component
- [x] Implement OTP input component with individual input boxes
- [x] Add real-time countdown timers for expiration and resend
- [x] Implement comprehensive error handling and user feedback
- [x] Create reusable Alert component for notifications
- [x] Extract timer logic into reusable custom hooks
- [x] Add validation schema for OTP verification
- [x] Test complete user verification flow

### ✅ Phase 4: AdonisJS Mail Integration with Edge Templates (COMPLETED)

- [x] Install and configure @adonisjs/mail package with Resend driver
- [x] Create Edge email templates (HTML and text versions)
- [x] Implement AdonisJS Mail notification class
- [x] Update email actions to use AdonisJS Mail service
- [x] Add shared utility functions for time calculations
- [x] Configure mail service with environment variables
- [x] Add email verification illustration assets
- [x] Update TypeScript and Vite configurations for shared paths
- [x] Test email delivery with professional templates
- [x] Add Prettier exclusions for auto-generated files

### 🚧 Phase 5: Production Deployment (PENDING)

- [ ] Run database migrations in production
- [ ] Deploy code changes
- [ ] Configure email service credentials
- [ ] Monitor and adjust rate limits

## Overview

This document outlines the implementation plan for adding 6-digit OTP (One-Time Password) email verification to the user registration flow. The feature will ensure email ownership verification before completing account creation.

## Current Registration Flow Analysis

### Existing Flow

1. User fills registration form (`/auth/register`)
2. Form validates with `newAccountValidator`
3. `RegisterUser.handle()` creates account immediately
4. User is logged in automatically
5. Redirect to home page

### Integration Points Identified

- **Handler**: `app/handlers/register.ts:35-46` - `registerNewUser()`
- **Action**: `app/actions/auth/register_user.ts:11-25` - `handle()`
- **Validator**: `app/validators/account_validator.ts` - `newAccountValidator`
- **Frontend**: `inertia/pages/auth/register.tsx:45-48` - form submission

## Updated Flow Summary

### Registration Flow (Email/Password)

1. **User Registration** (`/auth/register`):

   - User fills form with firstName, lastName, email, password
   - Account created as unverified (`emailVerifiedAt: null`)
   - User logged in immediately
   - OTP generated and sent (TBD: email delivery)
   - Redirect to `/` (home)

2. **Auth Middleware Redirect**:

   - Auth middleware detects unverified email user
   - Redirects to `/auth/verify-email`

3. **Email Verification** (`/auth/verify-email`):
   - User enters 6-digit OTP
   - Real-time countdown for resend (exponential backoff)
   - On success: `emailVerifiedAt` set, redirect to home
   - On failure: Show error, attempts remaining

### Login Flow (Email/Password)

1. **Existing User Login**:
   - User enters email/password
   - Login successful, user authenticated
   - If unverified: Generate new OTP, send email
   - Auth middleware redirects to verification page

### OAuth Flow (GitHub/Google)

1. **OAuth Registration/Login**:
   - User clicks OAuth provider
   - OAuth callback creates user with `emailVerifiedAt: now`
   - No verification needed - direct to home page

### Key Features

- **Incremental Backoff**: 30s → 1m → 2m → 4m → 8m → 10m (max)
- **Attempt Limiting**: 3 attempts per OTP code
- **Real-time Countdown**: Visual feedback for resend availability
- **Seamless UX**: Users can login but are guided to verification
- **OAuth Bypass**: Social logins skip verification entirely

## Security Considerations

### 1. Rate Limiting

- Limit OTP generation: 1 per minute per email
- Limit verification attempts: 3 attempts per OTP
- Limit resend requests: 1 per minute per email

### 2. OTP Security

- 6-digit numeric codes for user-friendliness
- 15-minute expiration time
- Single-use codes (deleted after verification)
- No reuse of expired codes

### 3. Data Protection

- Registration data temporarily stored (encrypted if needed)
- Automatic cleanup of expired verification records
- No logging of OTP codes

## Database Schema Changes

### Updated Users Table

**File**: `database/schema/users.ts`

- Add `emailVerifiedAt` field: `integer('email_verified_at', { mode: 'timestamp' })`
- Add `verificationSource` field: `text('verification_source').default('email')`
- Create index: `idx_users_email_verified` on `email_verified_at`

**SQL Migration**:

```sql
-- Add columns to existing users table
ALTER TABLE users ADD COLUMN email_verified_at INTEGER; -- timestamp, null until verified
ALTER TABLE users ADD COLUMN verification_source TEXT DEFAULT 'email'; -- 'email' or 'oauth'

CREATE INDEX idx_users_email_verified ON users(email_verified_at);
```

**Drizzle Schema Update**:

```typescript
// database/schema/users.ts - Add to existing schema
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$default(() => randomUUID()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp' }), // NEW
  verificationSource: text('verification_source').default('email'), // NEW: 'email' or 'oauth'
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
})
```

### New Table: `user_email_verifications`

**File**: `database/schema/user_email_verifications.ts` (NEW)

**SQL Migration**:

```sql
CREATE TABLE user_email_verifications (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  expires_at INTEGER NOT NULL, -- timestamp
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_sent_at INTEGER NOT NULL, -- timestamp for backoff logic
  resend_count INTEGER DEFAULT 0, -- for incremental backoff
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_email_verifications_user_id ON user_email_verifications(user_id);
CREATE INDEX idx_email_verifications_otp ON user_email_verifications(otp_code);
CREATE INDEX idx_email_verifications_expires ON user_email_verifications(expires_at);
```

**Drizzle Schema**:

```typescript
// database/schema/user_email_verifications.ts - NEW FILE
export const userEmailVerifications = sqliteTable('user_email_verifications', {
  id: text('id')
    .primaryKey()
    .$default(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  otpCode: text('otp_code').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  lastSentAt: integer('last_sent_at', { mode: 'timestamp' }).notNull(),
  resendCount: integer('resend_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
})

export const userEmailVerificationsRelations = relations(userEmailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [userEmailVerifications.userId],
    references: [users.id],
  }),
}))
```

**Database Migration Required**:

- Create migration file for users table alterations
- Create migration file for new user_email_verifications table
- Add Drizzle relations between tables

## Modified Registration Flow

### 1. Registration Form Submission

**File**: `app/handlers/register.ts` (UPDATE)

- Line 35-46: Modify `registerNewUser` function
- Change: Create unverified user account instead of verified
- Add: Call to generate OTP action after user creation
- Add: Flash message for email verification requirement
- Add: Redirect to home (auth middleware will handle verification redirect)

### 2. Email Verification Step

**New Route**: `/auth/verify-email`
**Purpose**: Collect and validate 6-digit OTP for current user

### 3. Login Flow for Unverified Users

**Enhancement**: Redirect unverified users to verification page after login
**Middleware**: Check email verification status in auth middleware

## New Actions Required

### 1. `app/actions/auth/register_user.ts` (UPDATE)

- Line 11-25: Modify `handle` function
- Change: Set `emailVerifiedAt` to `null` instead of current timestamp
- Add: Set `verificationSource` to 'email'
- Remove: Automatic user login after registration

### 2. `app/actions/auth/generate_email_verification_otp.ts` (NEW FILE)

- Create new action file
- Input parameters: `{ userId: string }`
- Generate 6-digit numeric OTP code
- Set 15-minute expiration time
- Clean up existing verification records for user
- Insert new verification record with OTP and metadata
- Return success status and verification object

### 3. `app/actions/auth/verify_email_otp.ts` (NEW FILE)

- Create new action file
- Input parameters: `{ userId: string, otpCode: string }`
- Find active verification record for user
- Validate expiration and attempt limits
- Compare provided OTP with stored code
- Update user's `emailVerifiedAt` on successful verification
- Clean up verification record after success
- Return success/error status with appropriate messages

### 4. `app/actions/auth/resend_email_verification.ts` (NEW FILE)

- Input parameters: `{ userId: string }`
- Find existing verification record for user
- Calculate exponential backoff timing (30s → 10m max)
- Generate new OTP code if cooldown period passed
- Update verification record with new OTP and reset attempts
- Call Resend service to send new verification email
- Return success/error status with wait time information

## Middleware Updates

### Enhanced Auth Middleware

**File**: `app/middleware/auth_middleware.ts` (UPDATE)

- Line 12-15: Add email verification check after authentication
- Add: Check if `user.verificationSource === 'email'` and `!user.emailVerifiedAt`
- Add: Redirect unverified email users to `/auth/verify-email`

### New Email Verification Middleware

**File**: `app/middleware/email_verification_middleware.ts` (NEW FILE)

- Create new middleware class
- Check: User must be authenticated to access verification pages
- Redirect: Already verified users to home page
- Handle: OAuth users by marking them as verified
- Protect: Verification routes from unauthenticated access

## New Routes Required

**File**: `start/routes.ts` (UPDATE)

- Line 15-25: Add new route group for email verification
- Add: `GET /auth/verify-email` → `auth.renderEmailVerification` handler
- Add: `POST /auth/verify-email` → `auth.handleEmailVerification` handler
- Add: `POST /auth/resend-verification` → `auth.handleResendVerification` handler
- Apply: `emailVerification` middleware to verification route group
- Name: Routes with `auth.verify-email` naming pattern for easy redirects

## Updated Handlers

### Registration Handler Updates

**File**: `app/handlers/register.ts` (UPDATE)

- Line 35-46: Modify `registerNewUser` function
- Add: User login after account creation
- Add: Call to `generateEmailVerificationOtp` action
- Change: Redirect to home (auth middleware will handle verification redirect)

### New Email Verification Handlers

**File**: `app/handlers/auth.ts` (UPDATE)

- Add: `renderEmailVerification` function

  - Get current verification record for authenticated user
  - Calculate resend cooldown timing
  - Render verification page with user data and timing info

- Add: `handleEmailVerification` function

  - Extract OTP code from request body
  - Call `verifyEmailOtp` action
  - Handle success/error responses with appropriate redirects

- Add: `handleResendVerification` function
  - Call `resendEmailVerification` action
  - Handle success/error responses
  - Flash appropriate success/error messages

### Login Handler Updates

**File**: `app/handlers/auth.ts` (UPDATE)

- Line 585-612: Modify `handleUserLogin` function
- Add: Check if logged-in user needs email verification
- Add: Generate new OTP for unverified users using `generateEmailVerificationOtp`
- Add: ResendService call for email delivery

### OAuth Handler Updates

**File**: `app/actions/auth/register_user_with_social_provider.ts`

- Line 620-630: Modify user creation
- Add: Set `emailVerifiedAt` to current timestamp for OAuth users
- Add: Set `verificationSource` to 'oauth'

## Updated Frontend Pages

### Email Verification Page

**File**: `inertia/pages/auth/verify-email.tsx` (NEW FILE)

- Create new React component for email verification
- Props interface: `email`, `attemptsRemaining`, `waitTimeSeconds`, `resendCount`
- Form handling: Use Inertia useForm hook for OTP submission
- State management: Countdown timer for resend functionality
- Input validation: 6-digit numeric OTP with pattern validation
- UI elements: Verification form, resend button with cooldown, error handling
- Layout: Use AuthLayout wrapper
- Styling: Tailwind CSS classes for responsive design

## Validation Updates

### New OTP Validator

**File**: `app/validators/auth_validator.ts` (NEW FILE)

**Validation Schema**:

```typescript
import vine from '@vinejs/vine'

export const emailVerificationValidator = vine.compile(
  vine.object({
    otpCode: vine
      .string()
      .fixedLength(6)
      .regex(/^\d{6}$/),
  })
)

// No email needed since we get user from auth context
```

- Create `emailVerificationValidator` using VineJS
- OTP code validation: Fixed 6-character length, numeric digits only
- Pattern: Regex `/^\d{6}$/` for strict validation
- No email field required (user context from authentication)

## Database Maintenance

### Cleanup Task

**File**: `app/tasks/cleanup_expired_verifications.ts` (NEW FILE)

- Create scheduled task for maintenance
- Delete expired verification records where `expiresAt < now()`
- Log cleanup statistics
- Schedule: Run periodically (hourly/daily) via task scheduler

## Automated Testing Plan

### Unit Tests

- OTP generation and validation logic
- Expiration handling
- Attempt limiting
- Data cleanup

### Integration Tests

- Full registration flow with email verification
- Resend functionality
- Error handling scenarios
- Security limits

## Risk Assessment & Rollback Strategy

### Risk Assessment

#### High Risk Items

- **Database Migration Failure**: Adding new columns to existing users table may timeout on large datasets

  - _Mitigation_: Run migration during low-traffic window with extended timeout, test on staging with production data volume
  - _Rollback_: Revert migration using rollback script, restore from backup if data corruption occurs

- **Authentication Flow Changes**: Modifications to auth middleware could lock out users
  - _Mitigation_: Comprehensive testing in staging, gradual rollout with feature flags
  - _Rollback_: Disable email verification via feature flag, revert auth middleware to previous version

#### Medium Risk Items

- **Email Delivery Dependencies**: OTP emails may fail to send due to SMTP issues

  - _Mitigation_: Implement retry logic, fallback to manual verification for critical users
  - _Rollback_: Disable OTP requirement temporarily, allow direct email verification bypass

- **Session Management Changes**: Login flow modifications could affect existing sessions
  - _Mitigation_: Test session persistence across authentication changes
  - _Rollback_: Clear all sessions and force re-login if issues detected

#### Low Risk Items

- **UI Changes**: New verification page has minimal impact on existing flows
  - _Mitigation_: A/B testing and responsive design validation
  - _Rollback_: CSS-only changes can be reverted instantly

### Rollback Strategy

#### If Deployment Fails During Migration:

1. **Immediate**: Stop deployment pipeline and prevent further changes
2. **Database**: Execute rollback migration to remove new columns and tables
3. **Application**: Revert to previous stable version using blue-green deployment
4. **Verification**: Run health checks on login, registration, and OAuth flows
5. **Communication**: Notify stakeholders of rollback completion and estimated fix time

#### If Issues Discovered Post-Deployment:

1. **Assessment**: Determine if issue is critical (affects > 10% of users, < 5 minutes)
2. **Feature Flag**: Disable email verification requirement via `REQUIRE_EMAIL_VERIFICATION=false`
3. **Partial Rollback**: If feature flag unavailable, rollback auth middleware only
4. **Full Rollback**: If issues persist, initiate complete rollback to previous version
5. **Monitoring**: Watch error rates, login success rates, and user support tickets
6. **Root Cause**: Begin immediate investigation while system is stable

#### Rollback Success Criteria:

- [ ] Login flow works for all user types (email/password, OAuth)
- [ ] Registration creates accounts successfully
- [ ] Error rates below 1% baseline
- [ ] Database consistency verified (no orphaned records)
- [ ] No data loss confirmed via spot checks
- [ ] All critical user flows completing end-to-end

### Monitoring Requirements

#### Key Metrics During Deployment:

- **Authentication Success Rate**: > 95% for login attempts
- **Registration Completion Rate**: > 90% for new accounts
- **Email Delivery Rate**: > 98% for OTP emails
- **API Response Times**: < 500ms for auth endpoints
- **Database Connection Pool**: < 80% utilization

#### Health Checks:

- **Database Connectivity**: Verify read/write operations to all affected tables
- **Authentication Service**: Test login with email/password and OAuth
- **Email Service**: Send test OTP and verify delivery
- **Session Management**: Validate session creation and persistence

#### Alerting Thresholds:

- **Critical**: Auth success rate < 90% (immediate rollback)
- **Warning**: Email delivery rate < 95% (investigate SMTP)
- **Info**: Registration rate decrease > 20% (monitor user behavior)

## Change Size Estimation

### Phase 1: Database Schema (Estimated: 185 lines | Actual: 88 lines +75/-30) - COMPLETED

**Git Commit**: `e822358578ea3048e5df9c03d4d88c9251b2fbc5`

**Estimated vs Actual**:

- **File**: `database/schema/users.ts` (UPDATE) - Estimated: 25 lines | Actual: 8 net lines (+25/-17)
- **File**: `database/schema/user_email_verifications.ts` (NEW) - Estimated: 85 lines | Actual: 43 lines (+43/-0)
- **File**: `database/drizzle/0001_add_email_verification_table.sql` (NEW) - Estimated: 75 lines | Actual: 20 lines (+20/-0)
- **File**: `database/schema/index.ts` (UPDATE) - Not estimated | Actual: 4 net lines (+5/-1)
- **Other files**: Configuration and meta files (package.json, drizzle config, etc.) - 13 net lines (+13/-0)

**Total**: Estimated 185 lines | Actual 88 lines (+75/-30, 52% less than estimated)

**Why Fewer Changes**:

- The Drizzle schema definitions were more concise than anticipated due to efficient use of Drizzle's declarative syntax
- The SQL migration file was streamlined with focused DDL statements rather than verbose schema definitions
- Existing users table modifications were minimal, only adding the two new columns with proper defaults
- Schema relations and indexes were defined more compactly than initially estimated

### Phase 2: Backend Logic (Estimated: 430 lines | Actual: 405 lines +552/-147) - COMPLETED

**Git Commit**: `3e4f2ee7ddfba6720cbc3457c963f6de695253b8`

**Estimated vs Actual**:

- **File**: `app/actions/auth/generate_email_verification_otp.ts` (NEW) - Estimated: 85 lines | Actual: 62 lines (+62/-0)
- **File**: `app/actions/auth/verify_email_otp.ts` (NEW) - Estimated: 95 lines | Actual: 53 lines (+53/-0)
- **File**: `app/actions/auth/resend_email_verification.ts` (NEW) - Estimated: 65 lines | Actual: 82 lines (+82/-0)
- **File**: `app/middleware/email_verification_middleware.ts` (NEW) - Estimated: 85 lines | Actual: 18 lines (+18/-0)
- **File**: `app/handlers/auth.ts` (UPDATE) - Estimated: 55 lines | Actual: 86 net lines (+87/-1)
- **File**: `app/handlers/register.ts` (UPDATE) - Estimated: 45 lines | Actual: 4 net lines (+8/-4)
- **File**: `app/actions/auth/find_or_create_email_verification.ts` (NEW) - Not estimated | Actual: 61 lines (+61/-0)
- **File**: `app/actions/auth/index.ts` (UPDATE) - Not estimated | Actual: 8 lines (+8/-0)
- **File**: `app/actions/auth/handle_oauth_callback.ts` (UPDATE) - Not estimated | Actual: 5 net lines (+106/-101)
- **File**: `app/actions/auth/register_user.ts` (UPDATE) - Not estimated | Actual: 7 net lines (+12/-5)
- **File**: `app/actions/auth/register_user_with_social_provider.ts` (UPDATE) - Not estimated | Actual: 0 net lines (+9/-9)
- **File**: `app/actions/auth/update_new_oauth_user.ts` (UPDATE) - Not estimated | Actual: 0 net lines (+17/-17)
- **File**: `app/middleware/auth_middleware.ts` (UPDATE) - Not estimated | Actual: 5 net lines (+6/-1)
- **File**: `start/routes.ts` (UPDATE) - Not estimated | Actual: 13 lines (+13/-0)
- **File**: `start/kernel.ts` (UPDATE) - Not estimated | Actual: 1 line (+1/-0)
- **Other files**: Configuration and formatting changes - 10 net lines (+14/-4)

**Total**: Estimated 430 lines | Actual 405 lines (+552/-147, 6% less than estimated)

**Why Different**:

- The middleware was much simpler than anticipated due to OAuth verification being handled during user creation
- Additional refactoring actions (`find_or_create_email_verification`) were created for better code organization
- OAuth callback handler required significant refactoring to support proper email verification flags
- Route definitions and kernel updates were not originally estimated but required for functionality

### Phase 3: Frontend (Estimated: 165 lines | Actual: 346 lines +346/-0) - COMPLETED

**Git Commit**: `d46c74149c25e9c2e8fa46ffbca7bc3f0ad3be6b`

**Estimated vs Actual**:

- **File**: `inertia/pages/auth/verify-email.tsx` (NEW) - Estimated: 125 lines | Actual: 176 lines (+176/-0)
- **File**: `app/validators/auth_validator.ts` (NEW) - Estimated: 15 lines | Actual: 8 lines (+8/-0)
- **File**: `inertia/app/components/form/otp-input.tsx` (NEW) - Not estimated | Actual: 255 lines (+255/-0)
- **File**: `inertia/app/components/feedback/alert.tsx` (NEW) - Not estimated | Actual: 107 lines (+107/-0)
- **File**: `inertia/app/hooks/use_timer.ts` (NEW) - Not estimated | Actual: 47 lines (+47/-0)
- **File**: `inertia/app/utils/time.ts` (NEW) - Not estimated | Actual: 23 lines (+23/-0)
- **Note**: `start/routes.ts` was completed in Phase 2 (+13 lines)

**Total**: Estimated 165 lines | Actual 346 lines (+346/-0, 110% more than estimated)

**Why Different**:

- Added sophisticated OTP input component with individual input boxes and smart focus management (255 lines)
- Created reusable Alert component for better UX and code organization (107 lines)
- Extracted timer functionality into reusable hooks and utilities for better architecture (70 lines)
- Enhanced error handling and user feedback beyond initial scope
- Implemented real-time countdown timers and expiration handling not originally estimated

### Phase 4: AdonisJS Mail Integration with Edge Templates (Estimated: 200 lines | Actual: 939 lines +939/-53) - COMPLETED

**Git Commit**: `1e63fd93ad6b2d7ad10843563b4f02cffd6dba49`

**Implementation Summary**: Complete AdonisJS mail integration with Edge templating, shared utilities, and professional email design

**Files Created**:

- **File**: `app/mails/verify_email_notification.ts` (NEW) - 36 lines (+36/-0)
- **File**: `config/mail.ts` (NEW) - 24 lines (+24/-0)
- **File**: `resources/views/emails/verify_email.edge` (NEW) - 373 lines (+373/-0)
- **File**: `resources/views/emails/verify_email_text.edge` (NEW) - 18 lines (+18/-0)
- **File**: `database/schema/types.ts` (NEW) - 16 lines (+16/-0)
- **File**: `.prettierignore` (NEW) - 8 lines (+8/-0)
- **File**: `plans/assets/email_verification_email_idea.jpg` (NEW) - Binary asset
- **File**: `plans/assets/email_verification_illustration_idea.jpg` (NEW) - Binary asset
- **File**: `shared/utils/time.ts` (MOVED) - Moved from `inertia/app/utils/time.ts`

**Files Updated**:

- **File**: `app/actions/auth/generate_email_verification_otp.ts` (UPDATE) - 58 net lines (+58/-0)
- **File**: `app/actions/auth/resend_email_verification.ts` (UPDATE) - 22 net lines (+22/-0)
- **File**: `.env.example` (UPDATE) - 9 net lines (+9/-0)
- **File**: `adonisrc.ts` (UPDATE) - 2 net lines (+2/-0)
- **File**: `package.json` (UPDATE) - 6 net lines (+6/-0)
- **File**: `package-lock.json` (UPDATE) - 300 net lines (+300/-0)
- **File**: `start/env.ts` (UPDATE) - 9 net lines (+9/-0)
- **File**: `vite.config.ts` (UPDATE) - 1 net line (+1/-0)
- **File**: `inertia/tsconfig.json` (UPDATE) - 7 net lines (+7/-0)
- **File**: Database schema files (UPDATE) - 72 net lines (+72/-0) - Added generic type utilities
- **File**: Various frontend files (UPDATE) - 53 net lines (+0/-53) - Path updates for shared utilities

**Total**: 939 net lines (+939/-53, 369% more than estimated)

**⚠️ Guideline Compliance Note**: This phase exceeded the 500-line limit due to comprehensive email template implementation (373 lines) and enhanced scope including shared utilities and type system improvements. In future implementations, this phase should be split into:
- Phase 4a: Basic AdonisJS Mail Integration (< 500 lines)
- Phase 4b: Professional Email Templates and Advanced Features (< 500 lines)

**Implementation Highlights**:

- **Professional Email Design**: 373-line Edge template with table-based layout for cross-client compatibility
- **AdonisJS Mail Integration**: Native mail service with Resend driver configuration
- **Shared Utilities**: Moved time calculation functions to shared location for backend/frontend reuse
- **Generic Type System**: Added SchemaWith utility for reusable database relation types
- **Email Assets**: Professional email verification illustrations and design references
- **Enhanced Configuration**: Comprehensive mail service setup with environment variables
- **Dark Theme Support**: CSS media queries for proper dark theme email rendering
- **Cross-Client Compatibility**: Table-based HTML layout tested across Gmail, Spark, Outlook
- **Code Organization**: Prettier exclusions and TypeScript path mapping for shared modules

**Migration Benefits**:

- Native AdonisJS mail integration with proper Edge templating
- Professional email design with cross-client compatibility
- Shared utility functions accessible to both backend and frontend
- Enhanced type system for database relations
- Comprehensive email template with dark theme support
- Better maintainability and testing support through AdonisJS patterns

### Phase 5: Production Deployment (Estimated: 50 lines) - PENDING

- **File**: `database/migrations/production_migration.sql` (NEW) - 30 lines
- **File**: `.env.production` (UPDATE) - 10 lines
- **File**: `app/tasks/cleanup_expired_verifications.ts` (NEW) - 10 lines

**Total Estimated**: 1030 lines across 17 files | **Total Actual (Phases 1-4)**: 1788 lines across 29 files (+1912/-187, 73% more than estimated)
**Compliance**: ⚠️ Phase 4 exceeded 500-line limit (939 lines) and 200-line file limit (373-line template) due to enhanced scope
**Lessons Learned**: Large email templates and comprehensive features should be split into separate phases to maintain reviewability and deployment safety
**Rationale**: Enhanced scope included professional email design, shared utilities, generic type system, and cross-client compatibility testing

## Visual Flow Documentation

### User Registration with Email Verification Flow

```
User Registration Flow:

User          Frontend       Backend        Database       Email
 |              |              |              |             |
 |--register--->|              |              |             |
 |              |--POST /auth->|              |             |
 |              |              |--create----->|             |
 |              |              |<--user-------|             |
 |              |              |--login------>|             |
 |              |              |<--session----|             |
 |              |              |--gen OTP---->|             |
 |              |              |<--OTP--------|             |
 |              |              |--send OTP----------------->|
 |              |<--redirect---|              |             |
 |<--to home----|              |              |             |
 |              |              |              |             |
 |              |   [Auth Middleware Intercept]             |
 |              |              |              |             |
 |              |<--redirect to verify-email--|             |
 |<--verify-----|              |              |             |
 |              |              |              |             |
 |--enter OTP-->|              |              |             |
 |              |--POST verify>|              |             |
 |              |              |--validate--->|             |
 |              |              |<--success----|             |
 |              |              |--update----->|             |
 |              |<--success----|              |             |
 |<--to home----|              |              |             |
```

### Email Verification State Machine

```
Email Verification States:

[Unverified] --register--> [OTP_Generated]
     |                          |
     |                     send_email
     |                          |
     |                          v
     |                    [OTP_Sent] --verify_success--> [Verified] (terminal)
     |                          |                           ^
     |                          |                           |
     |                    verify_fail                       |
     |                          |                           |
     |                          v                           |
     |                   [Attempts_Used]                    |
     |                          |                           |
     |                     resend_otp                      |
     |                          |                           |
     |                          v                           |
[OTP_Generated] <--regenerate-- [OTP_Expired] --new_otp----+
     |                                                      |
     +--max_attempts_reached--> [Blocked] --manual_verify--+
```

### Login Decision Tree

```
User Login Decision Tree:

User enters email
    |
    +--> Account exists?
            |
            +--> YES: Email verified?
            |       |
            |       +--> YES: Show password/OAuth options
            |       +--> NO: Show password, generate new OTP on login
            |
            +--> NO: Redirect to registration
                    |
                    +--> OAuth signup: Auto-verify email
                    +--> Email signup: Require verification
```

## Functionality Review Plan

### Scenario 1: Happy Path - New User Registration with Email Verification

**Steps to Test:**

1. Navigate to `/auth/register`
2. Fill registration form with valid data (firstName, lastName, email, password)
3. Submit form
4. Verify user is logged in and redirected to home page
5. Verify auth middleware redirects to `/auth/verify-email`
6. Check verification page shows correct email address
7. Check database for unverified user record (`emailVerifiedAt: null`)
8. Check database for OTP verification record
9. Enter correct 6-digit OTP code
10. Submit verification form
11. Verify success message and redirect to home page
12. Verify user can access protected routes without further redirects
13. Check database: user has `emailVerifiedAt` timestamp set
14. Check database: verification record is cleaned up

**Expected Results:**

- Registration creates unverified account
- OTP verification completes account setup
- User gains full access to application

### Scenario 2: Login with Unverified Account

**Steps to Test:**

1. Create unverified user account (via registration or direct database)
2. Navigate to `/auth/login`
3. Enter email address and click continue
4. Enter correct password
5. Verify login success and redirect to home
6. Verify auth middleware redirects to `/auth/verify-email`
7. Check that new OTP was generated for existing user
8. Complete verification with correct OTP
9. Verify full access granted

**Expected Results:**

- Existing unverified users can login
- New OTP generated for each login attempt
- Verification required before full access

### Scenario 3: OAuth Registration (Bypass Verification)

**Steps to Test:**

1. Navigate to `/auth/register`
2. Click GitHub or Google OAuth button
3. Complete OAuth flow with provider
4. Verify immediate redirect to home page (no verification step)
5. Check database: user has `emailVerifiedAt` set and `verificationSource: 'oauth'`
6. Verify full access to protected routes

**Expected Results:**

- OAuth users skip email verification
- Immediate access to full application functionality

### Scenario 4: Invalid OTP Code Entry

**Steps to Test:**

1. Complete registration to reach verification page
2. Enter incorrect 6-digit code (e.g., "123456")
3. Submit form
4. Verify error message displayed
5. Check attempts counter decremented
6. Repeat with different incorrect codes
7. Verify attempts remaining updates correctly
8. On 3rd incorrect attempt, verify account locked from further attempts

**Expected Results:**

- Clear error messages for incorrect codes
- Attempt limiting prevents brute force attacks
- User informed of remaining attempts

### Scenario 5: OTP Code Expiration

**Steps to Test:**

1. Complete registration to generate OTP
2. Wait 16+ minutes (past 15-minute expiration)
3. Enter the original (now expired) OTP code
4. Submit verification form
5. Verify "expired code" error message
6. Click "Resend verification code"
7. Verify new OTP generated with fresh expiration
8. Enter new valid OTP within expiration window
9. Verify successful verification

**Expected Results:**

- Expired codes properly rejected
- Resend functionality generates fresh codes
- New codes work within expiration period

### Scenario 6: Resend Functionality and Backoff

**Steps to Test:**

1. Complete registration to reach verification page
2. Immediately click "Resend verification code"
3. Verify new code sent and 30-second cooldown starts
4. Attempt to resend again before cooldown expires
5. Verify error message about waiting time
6. Wait for cooldown to expire and resend again
7. Verify backoff time increases (1 minute)
8. Repeat process to test exponential backoff (2m, 4m, 8m, max 10m)
9. Verify countdown timer displays correctly

**Expected Results:**

- Resend cooldown prevents spam
- Exponential backoff increases wait times
- Visual countdown helps user understand timing

### Scenario 7: Multiple Browser Sessions

**Steps to Test:**

1. Register account in Browser A, reach verification page
2. Open Browser B, login with same unverified account
3. Verify both browsers redirect to verification page
4. In Browser A, enter correct OTP and verify account
5. In Browser B, refresh page or navigate
6. Verify Browser B now has full access (no verification needed)

**Expected Results:**

- Account verification applies across all sessions
- No duplicate verification required

### Scenario 8: Direct URL Access Attempts

**Steps to Test:**

1. Without logging in, navigate directly to `/auth/verify-email`
2. Verify redirect to login page
3. Login with verified account, then navigate to `/auth/verify-email`
4. Verify redirect to home page (already verified)
5. Login with unverified account, then navigate away from verification page
6. Navigate to any protected route
7. Verify redirect back to verification page

**Expected Results:**

- Proper middleware protection of verification routes
- Verified users cannot access verification pages
- Unverified users always redirected to verification

### Scenario 9: Account Registration Edge Cases

**Steps to Test:**

1. **Duplicate Email**: Try registering with existing email address
2. Verify proper error handling
3. **Invalid Email Format**: Use malformed email addresses
4. Verify validation errors displayed
5. **Weak Password**: Test password validation rules
6. Verify appropriate error messages
7. **Missing Required Fields**: Submit form with empty fields
8. Verify all required field validations work

**Expected Results:**

- All validation rules properly enforced
- Clear, helpful error messages displayed
- No account creation with invalid data

### Scenario 10: Database Cleanup and Maintenance

**Steps to Test:**

1. Create several verification records with different expiration times
2. Set some records to expired status (modify `expiresAt` to past time)
3. Run cleanup task: `node ace cleanup:expired-verifications`
4. Verify only expired records are removed
5. Verify active verification records remain untouched
6. Check cleanup logs show correct count of removed records

**Expected Results:**

- Cleanup task removes only expired records
- Active verifications preserved
- Proper logging of cleanup operations

### Scenario 11: Email Delivery Integration (When Implemented)

**Steps to Test:**

1. Configure email service with test/staging credentials
2. Register new account
3. Check email inbox for OTP delivery
4. Verify email format and content
5. Test OTP from email in verification form
6. Test resend functionality delivers new email
7. Verify different email addresses receive correct personalized emails

**Expected Results:**

- OTP emails delivered promptly (< 30 seconds)
- Email content clear and properly formatted
- Personalization (email address) correct

### Scenario 12: Security and Rate Limiting

**Steps to Test:**

1. **Rapid Registration Attempts**: Try multiple registrations with same email
2. Verify rate limiting prevents abuse
3. **Rapid OTP Requests**: Request multiple OTP resends quickly
4. Verify exponential backoff enforced
5. **Brute Force OTP**: Try many incorrect OTP codes rapidly
6. Verify attempt limiting blocks further tries
7. **SQL Injection**: Test OTP input with SQL injection patterns
8. Verify input sanitization prevents attacks

**Expected Results:**

- All rate limiting mechanisms function correctly
- No security vulnerabilities in OTP handling
- Proper input validation and sanitization

### Review Checklist

**Before approving functionality:**

- [ ] All happy path scenarios work smoothly
- [ ] Error messages are clear and helpful
- [ ] Security measures prevent abuse
- [ ] Database cleanup works correctly
- [ ] UI/UX provides good user experience
- [ ] Email integration delivers reliably (when implemented)
- [ ] Performance is acceptable under normal load
- [ ] Mobile/responsive design works properly
- [ ] Browser compatibility tested
- [ ] All edge cases handled gracefully

**Documentation Review:**

- [ ] User-facing error messages are user-friendly
- [ ] Admin/developer logs contain sufficient detail
- [ ] Configuration options properly documented
- [ ] Environment variables clearly specified

## Resend Email Integration

The following components need to be implemented for email sending using Resend:

### Resend Service Integration

- **Location**: `app/services/resend_service.ts`
- **Methods**: `sendOTPVerification(email: string, otpCode: string, firstName: string)`
- **Features**:
  - Resend API client initialization
  - OTP email template rendering
  - Error handling and retry logic
  - Development/production environment support

### Email Templates

- **Location**: `app/templates/otp_verification_email.ts`
- **Design Reference**: Based on HubSpot-style email layout pattern
- **Reference Files**:
  - Layout inspiration: [`@plans/assets/email_verification_email_idea.jpg`](./assets/email_verification_email_idea.jpg)
  - Illustration reference: [`@plans/assets/email_verification_illustration_idea.jpg`](./assets/email_verification_illustration_idea.jpg)
- **Content**:
  - HTML and text versions of OTP email
  - Brand header with company logo and colors (similar to orange HubSpot header)
  - Central email verification illustration (envelope with green checkmark and decorative elements)
  - Decorative elements (geometric shapes, subtle patterns, stars, plus signs)
  - 6-digit OTP code prominently displayed in large, styled format
  - Expiration time (15 minutes) clearly stated
  - Professional typography and spacing matching reference design
  - Security warning about not sharing codes
  - Personalized greeting with user's first name
  - Clean footer with company information and support links

### Configuration

- **Location**: `config/resend.ts`
- **Settings**: Resend API key, from addresses, default templates

### Package Dependencies

- **Package**: `resend` - Official Resend SDK for Node.js
- **Installation**: `npm install resend`
- **TypeScript**: Built-in TypeScript support

### Implementation Details

#### 1. Resend Service (`app/services/resend_service.ts`)

**File**: `app/services/resend_service.ts` (NEW)

- Resend API client initialization
- `sendOTPVerification(email, otpCode, firstName)` method
- Error handling and retry logic
- Template rendering integration with enhanced design
- Environment configuration support

#### 2. Email Template (`app/templates/otp_verification_email.ts`)

**File**: `app/templates/otp_verification_email.ts` (NEW)

- `OTPEmailTemplateData` interface definition
- `otpVerificationEmailTemplate()` function
- HTML template following HubSpot-style design pattern
- **Design References**:
  - Layout based on [`@plans/assets/email_verification_email_idea.jpg`](./assets/email_verification_email_idea.jpg)
  - Illustration inspired by [`@plans/assets/email_verification_illustration_idea.jpg`](./assets/email_verification_illustration_idea.jpg)
- Clean layout with brand header, centered content, and professional styling
- Email verification illustration (envelope with green checkmark and decorative elements)
- Text template for accessibility compliance
- Personalized greeting with user's first name
- Large, prominent 6-digit OTP code display
- Clear call-to-action styling
- Security warning and expiration notice
- Footer with company information and support links

#### 3. Configuration (`config/resend.ts`)

**File**: `config/resend.ts` (NEW)

- Resend API key configuration
- From email and name settings
- Development/production environment detection
- Test mode configuration option
- Default value specifications

#### 4. Integration Points

**File**: `app/actions/auth/generate_email_verification_otp.ts` (UPDATE)

- Add import for ResendService
- Call ResendService.sendOTPVerification() after OTP creation
- Handle email delivery errors gracefully

**File**: `app/actions/auth/resend_email_verification.ts` (UPDATE)

- Add import for ResendService
- Call ResendService.sendOTPVerification() for resend requests
- Return email delivery status to frontend

**File**: `start/container.ts` (UPDATE) - if applicable

- Register ResendService for dependency injection
- Configure service bindings

### Development Setup

1. **Get Resend API Key**: Sign up at [resend.com](https://resend.com) and get API key
2. **Configure Environment**: Add Resend credentials to `.env` file
3. **Test Email Delivery**: Use Resend's test domain or configure custom domain
4. **Monitor Delivery**: Use Resend dashboard to track email delivery status

### Production Considerations

- **Domain Setup**: Configure custom domain for professional email addresses
- **Rate Limits**: Monitor Resend API rate limits and plan accordingly
- **Delivery Monitoring**: Set up webhooks for delivery status tracking
- **Error Handling**: Implement retry logic for failed email deliveries
- **Compliance**: Ensure email templates meet accessibility and compliance standards
- **Design Assets**: Implement email verification illustration based on [`@plans/assets/email_verification_illustration_idea.jpg`](./assets/email_verification_illustration_idea.jpg)
- **Brand Consistency**: Maintain HubSpot-style layout pattern from [`@plans/assets/email_verification_email_idea.jpg`](./assets/email_verification_email_idea.jpg)
- **Mobile Optimization**: Ensure email template renders properly on mobile devices

## Configuration Variables

### Environment Variables Required

```bash
# Resend Email Service Configuration
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourapp.com
RESEND_FROM_NAME=Your App Name
RESEND_TEST_MODE=false

# OTP Configuration
OTP_EXPIRATION_MINUTES=15
OTP_MAX_ATTEMPTS=3
OTP_RESEND_COOLDOWN_MINUTES=1
```

## Success Metrics

### Performance Metrics

- Email delivery time < 30 seconds
- OTP verification success rate > 95%
- Registration completion rate improvement

### Security Metrics

- Zero successful brute force attempts
- No OTP code exposure in logs
- Proper cleanup of expired records

### User Experience Metrics

- Time to complete verification < 5 minutes
- Resend request rate < 20%
- Support tickets related to verification < 1%

## Future Enhancements

### Potential Improvements

1. **SMS OTP Alternative**: Option to receive OTP via SMS
2. **Email Template Customization**: Admin panel for template editing
3. **Advanced Rate Limiting**: Per-IP and per-email combined limits
4. **Audit Logging**: Track all verification attempts for security monitoring
5. **Bulk Verification**: Admin tools for manual email verification
6. **Recovery Options**: Alternative verification methods for email issues

This plan provides a comprehensive implementation strategy for email verification via OTP while maintaining security best practices and user experience standards.
