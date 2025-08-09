# OAuth Account Linking Implementation - Technical Plan

## Table of Contents

### Core Structure

- [Plan Status](#plan-status)
- [Phase Completion Status](#phase-completion-status)
- [Overview](#overview)
- [Current State Analysis](#current-state-analysis)
- [Updated Flow Summary](#updated-flow-summary)
- [Security Considerations](#security-considerations)

### Implementation Details

- [Database Schema Changes](#database-schema-changes)
- [Implementation Details](#implementation-details)
- [New Actions Required](#new-actions-required)
- [Updated Handlers](#updated-handlers)
- [New Frontend Pages](#new-frontend-pages)
- [Validation Updates](#validation-updates)
- [Routing Updates](#routing-updates)

### Quality & Review

- [Testing Plans](#testing-plans)
- [Risk Assessment & Rollback Strategy](#risk-assessment--rollback-strategy)
- [Change Size Estimation](#change-size-estimation)
- [Visual Flow Documentation](#visual-flow-documentation)

### Additional Information

- [Configuration Requirements](#configuration-requirements)
- [Future Enhancements](#future-enhancements)

## Plan Status

| Field                 | Value                              |
| --------------------- | ---------------------------------- |
| **Status**            | Planning Phase                     |
| **Percent Done**      | 0%                                 |
| **Title**             | OAuth Account Linking Implementation |

## Phase Completion Status

### 🚧 Phase 1: Email Conflict Detection Enhancement (PENDING)

- [ ] Update OAuth callback handler to detect email conflicts
- [ ] Add session management for conflict resolution flow
- [ ] Implement email uniqueness validation improvements
- [ ] Add database queries for existing account detection

### 🚧 Phase 2: New Account Creation Flow (PENDING)

- [ ] Create new email prompt interface
- [ ] Implement email validation and uniqueness checking
- [ ] Update OAuth account creation with custom email
- [ ] Add session state management for new email flow

### 🚧 Phase 3: Account Linking Flow (PENDING)

- [ ] Create account linking confirmation interface
- [ ] Implement login-first authentication requirement
- [ ] Add OAuth provider association logic
- [ ] Update existing account with OAuth provider

### 🚧 Phase 4: Error Handling & Edge Cases (PENDING)

- [ ] Implement unverified email handling
- [ ] Add comprehensive error messaging
- [ ] Create rate limiting for linking attempts
- [ ] Add audit logging for account linking events

## Overview

This plan implements OAuth account linking functionality for situations where a user attempts to create an account using an OAuth provider (GitHub, Google) that matches an existing account's email address. When an email conflict is detected, users will be presented with two clear options:

1. **Create New Account**: Enter a different email address to create a separate account with the OAuth provider
2. **Link Account**: Log in with existing credentials first, then associate the OAuth provider with the existing account

This enhancement improves user experience by providing clear resolution paths for email conflicts while maintaining security through proper authentication verification.

## Current State Analysis

### Existing OAuth Implementation

**File**: `app/actions/auth/handle_oauth_callback.ts` (UPDATE)
- Lines 100-111: Currently handles email conflicts by storing session data but doesn't provide user choice
- Lines 105-110: Basic conflict detection exists but redirects to registration without options
- Lines 116-125: Creates new accounts automatically without email conflict resolution
- Lines 127-130: Links OAuth provider to newly created user account

**File**: `config/ally.ts` (REFERENCE)
- Lines 5-14: GitHub and Google providers configured
- Callback URLs: `/oauth/github/callback` and `/oauth/google/callback`

**Current Conflict Resolution**: 
- Detects existing email in `handle_oauth_callback.ts:101-103`
- Stores conflict data in session (`handle_oauth_callback.ts:106-110`)
- Redirects to registration page without clear user options

### Database Schema State

**File**: `database/schema/users.ts` (REFERENCE)
- Lines 8-28: Users table with email uniqueness constraint
- Lines 18-19: Email verification tracking with source
- Lines 30-33: Relations to OAuth providers established

**File**: `database/schema/user_third_party_auths.ts` (REFERENCE)
- Lines 7-21: OAuth provider associations table
- Lines 14: Foreign key relationship to users table
- Lines 11-13: Provider and provider ID tracking

### Integration Points

**Route Handler**: `start/routes.ts`
- OAuth callback routes already defined for both providers
- Authentication middleware properly configured

**Session Management**: 
- Session-based conflict detection in place
- Needs enhancement for multi-step flows

## Updated Flow Summary

### Email Conflict Detection Flow

When OAuth callback detects email conflict:

```
OAuth Provider --> OAuth Callback Handler --> Email Conflict Detected
                                                       |
                                                       v
                                             Conflict Resolution Page
                                                   /           \
                                          Create New     Link Existing
                                           Account         Account
                                              |              |
                                        New Email Form    Login Form
                                              |              |
                                       Account Creation   Authentication
                                                             |
                                                      Link OAuth Provider
```

### Decision Points

1. **Email Conflict Detection**: Check if OAuth email matches existing account
2. **User Choice Presentation**: Show both linking and new account options
3. **Authentication Verification**: Require login before linking to existing account
4. **Provider Association**: Link OAuth provider to authenticated account

### Security Considerations

- **Authentication Required**: Users must authenticate before linking OAuth providers
- **Email Verification**: Validate email addresses from OAuth providers
- **Rate Limiting**: Prevent abuse of linking attempts
- **Audit Logging**: Track all account linking activities
- **Session Security**: Secure session state during multi-step flows

## Database Schema Changes

No database schema changes required. The existing schema supports OAuth account linking:

### Supporting Database Fields

**Users Table** (`database/schema/users.ts`):
- `id` (text, primary key) - Referenced by OAuth associations
- `email` (text, unique, not null) - Used for conflict detection
- `emailVerifiedAt` (integer, timestamp) - Tracks email verification status
- `verificationSource` (text, default 'email') - Tracks verification method

**User Third Party Auths Table** (`database/schema/user_third_party_auths.ts`):
- `id` (text, primary key) - Unique identifier for OAuth associations
- `provider` (text, not null) - OAuth provider name (github, google)
- `providerId` (text, not null) - Provider's unique user identifier
- `userId` (text, foreign key) - References users.id for account linking
- `payload` (text, not null) - Complete OAuth user data as JSON

### Key Relationships

- `user_third_party_auths.userId` → `users.id` (one-to-many)
- Unique constraint on `users.email` enables conflict detection
- Foreign key cascade delete protects data integrity

## Implementation Details

### New Actions Required

**File**: `app/actions/auth/handle_oauth_conflict.ts` (NEW)
- Handle email conflict resolution choice
- Manage session state for conflict resolution
- Validate user choices and redirect appropriately
- Input: `{ choice: 'new' | 'link', email?: string }`
- Output: Redirect to appropriate flow

**File**: `app/actions/auth/link_oauth_provider.ts` (NEW)
- Associate OAuth provider with existing authenticated user
- Validate user is authenticated before linking
- Update `user_third_party_auths` table with user association
- Input: `{ providerId: string, userId: string }`
- Output: Success confirmation or error

**File**: `app/actions/auth/create_oauth_with_new_email.ts` (NEW)
- Create new user account with custom email and OAuth provider
- Validate email uniqueness
- Create user and OAuth provider association
- Input: `{ email: string, providerId: string, providerData: object }`
- Output: Created user and authentication

### Updated Handlers

**File**: `app/handlers/auth.ts` (UPDATE)
- Line 45-60 (estimated): Add conflict resolution handler
- Line 61-75 (estimated): Add OAuth linking confirmation handler
- Line 76-90 (estimated): Add new email account creation handler

**File**: `app/actions/auth/handle_oauth_callback.ts` (UPDATE)
- Line 105-111: Modify conflict detection to redirect to conflict resolution page
- Add session data for provider information
- Remove automatic redirect to registration

### New Frontend Pages

**File**: `inertia/pages/auth/oauth-conflict.tsx` (NEW)
- Present user with linking vs new account options
- Display existing account email and OAuth provider
- Provide clear call-to-action buttons
- Handle user choice submission

**File**: `inertia/pages/auth/oauth-new-email.tsx` (NEW)
- Email input form for new account creation
- Email validation and uniqueness checking
- Integration with OAuth account creation flow
- Error handling for invalid emails

**File**: `inertia/pages/auth/oauth-link-confirm.tsx` (NEW)
- Confirmation page after successful OAuth linking
- Display linked provider information
- Redirect to dashboard or next step

### Validation Updates

**File**: `app/validators/account_validator.ts` (UPDATE)
- Add email conflict resolution validator
- Add OAuth linking request validator
- Enhance email validation for custom OAuth emails

#### New Validation Schemas

```typescript
// OAuth conflict resolution choice validator
export const oauthConflictValidator = vine.compile(
  vine.object({
    choice: vine.enum(['new', 'link']),
    email: vine.string().trim().email().optional().requiredWhen('choice', '=', 'new'),
  })
)

// OAuth provider linking validator
export const oauthLinkingValidator = vine.compile(
  vine.object({
    providerId: vine.string().trim().uuid(),
    confirmed: vine.boolean().isTrue(),
  })
)

// Custom email for OAuth account validator
export const oauthCustomEmailValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().use(uniqueEmailRule()),
    providerId: vine.string().trim().uuid(),
  })
)
```

#### Enhanced Validation Rules

- **Email Conflict Detection**: Leverages existing `uniqueEmailRule()` from line 6-20
- **Provider Validation**: Ensures valid OAuth provider IDs
- **Choice Validation**: Enforces required email when creating new account
- **Confirmation Validation**: Requires explicit user confirmation for linking

### Routing Updates

**File**: `start/routes.ts` (UPDATE)
- Add `/auth/oauth-conflict` route (GET/POST)
- Add `/auth/oauth-new-email` route (GET/POST)
- Add `/auth/oauth-link` route (POST)
- Add `/auth/oauth-link-confirm` route (GET)

## Testing Plans

### Automated Testing Plan

#### Unit Tests

**File**: `tests/unit/actions/handle_oauth_conflict.spec.ts` (NEW)
- Test conflict resolution choice handling
- Test session state management
- Test invalid choice handling

**File**: `tests/unit/actions/link_oauth_provider.spec.ts` (NEW)
- Test OAuth provider linking to existing accounts
- Test authentication requirement validation
- Test duplicate provider prevention

**File**: `tests/unit/actions/create_oauth_with_new_email.spec.ts` (NEW)
- Test new account creation with custom email
- Test email uniqueness validation
- Test OAuth provider association

#### Integration Tests

**File**: `tests/integration/oauth_linking_flow.spec.ts` (NEW)
- Test complete OAuth conflict resolution flow
- Test email conflict detection
- Test successful account linking
- Test new account creation with custom email

### Functionality Review Plan

#### Scenario 1: Email Conflict Detection

**Steps to Test:**
1. Create user account with email `user@example.com`
2. Attempt OAuth login with GitHub using same email
3. Verify conflict resolution page appears
4. Check both options are clearly presented

**Expected Results:**
- Conflict page shows existing email and provider
- Both "Create New Account" and "Link Account" options visible
- Session contains provider information for next steps

#### Scenario 2: Link to Existing Account

**Steps to Test:**
1. From conflict page, choose "Link Account"
2. Complete login with existing credentials
3. Confirm OAuth provider linking
4. Verify OAuth provider associated with account

**Expected Results:**
- User successfully authenticates with existing credentials
- OAuth provider added to user's third-party auths
- User can log in with both password and OAuth provider

#### Scenario 3: Create New Account with Custom Email

**Steps to Test:**
1. From conflict page, choose "Create New Account"
2. Enter new unique email address
3. Complete account creation
4. Verify separate account created with OAuth provider

**Expected Results:**
- New user account created with custom email
- OAuth provider associated with new account
- Original account remains unaffected

#### Scenario 4: Error Handling

**Steps to Test:**
1. Test with unverified OAuth email
2. Test with invalid email formats
3. Test rate limiting on linking attempts
4. Test authentication failure during linking

**Expected Results:**
- Clear error messages for each failure case
- User guided to resolution steps
- No data corruption or security vulnerabilities

## Risk Assessment & Rollback Strategy

### Risk Assessment

#### High Risk Items

- **Authentication Bypass**: Improperly implemented linking could allow unauthorized account access
  - _Mitigation_: Require full authentication before any OAuth provider linking
  - _Rollback_: Disable OAuth linking feature and revert to current behavior

- **Account Takeover**: Malicious linking of OAuth providers to unauthorized accounts
  - _Mitigation_: Email verification and rate limiting on linking attempts
  - _Rollback_: Remove OAuth associations and audit account access

#### Medium Risk Items

- **User Experience Confusion**: Complex flow may confuse users about account states
  - _Mitigation_: Clear messaging and step-by-step guidance
  - _Rollback_: Revert to simple conflict error message

- **Session Management Issues**: Multi-step flow may cause session state problems
  - _Mitigation_: Comprehensive session testing and timeout handling
  - _Rollback_: Clear session state and restart OAuth flow

#### Low Risk Items

- **UI/UX Changes**: New pages may have styling inconsistencies
  - _Mitigation_: Follow existing design patterns and components
  - _Rollback_: CSS-only changes can be reverted quickly

### Rollback Strategy

#### If Deployment Fails During Implementation:

1. **Immediate**: Stop deployment pipeline and assess failure point
2. **Database**: No schema changes to rollback
3. **Application**: Revert to previous OAuth callback handler version
4. **Verification**: Test OAuth login flow with existing accounts
5. **Communication**: Notify users if OAuth temporarily unavailable

#### If Issues Discovered Post-Deployment:

1. **Assessment**: Determine if security or data integrity at risk (< 2 minutes)
2. **Feature Flag**: Disable OAuth conflict resolution if available
3. **Partial Rollback**: Revert conflict resolution handler while keeping other features
4. **Monitoring**: Watch authentication success rates and user support tickets
5. **Root Cause**: Investigate while users can still use basic OAuth flow

#### Rollback Success Criteria:

- [ ] OAuth login works for existing users
- [ ] No unauthorized account access
- [ ] User session state is clean
- [ ] All authentication flows operational

## Change Size Estimation

### Phase 1: Email Conflict Detection Enhancement (Estimated: 180 lines)

- **File**: `app/actions/auth/handle_oauth_callback.ts` (UPDATE) - 25 lines
- **File**: `app/actions/auth/handle_oauth_conflict.ts` (NEW) - 85 lines
- **File**: `app/handlers/auth.ts` (UPDATE) - 35 lines
- **File**: `start/routes.ts` (UPDATE) - 15 lines
- **File**: `inertia/pages/auth/oauth-conflict.tsx` (NEW) - 120 lines

### Phase 2: New Account Creation Flow (Estimated: 195 lines)

- **File**: `app/actions/auth/create_oauth_with_new_email.ts` (NEW) - 95 lines
- **File**: `inertia/pages/auth/oauth-new-email.tsx` (NEW) - 100 lines

### Phase 3: Account Linking Flow (Estimated: 175 lines)

- **File**: `app/actions/auth/link_oauth_provider.ts` (NEW) - 75 lines
- **File**: `inertia/pages/auth/oauth-link-confirm.tsx` (NEW) - 65 lines
- **File**: `app/validators/account_validator.ts` (UPDATE) - 35 lines

### Phase 4: Error Handling & Edge Cases (Estimated: 140 lines)

- **File**: `app/middleware/oauth_rate_limit.ts` (NEW) - 85 lines
- **File**: Error handling updates across existing files - 55 lines

**Total Estimated**: 690 lines
**Recommendation**: All phases within limits (< 500 lines per phase)

## Visual Flow Documentation

### OAuth Email Conflict Resolution Flow

```
User Initiates OAuth Login
         |
         v
OAuth Provider Authentication
         |
         v
OAuth Callback Handler
         |
         v
    Email Conflict?
    /            \
   NO             YES
   |              |
   v              v
Create Account    Conflict Resolution Page
   |              /                    \
   |         "Create New"         "Link Existing"
   |             |                      |
   |             v                      v
   |      New Email Form         Login Required
   |             |                      |
   |             v                      v
   |      Validate Email         Authenticate User
   |             |                      |
   |             v                      v
   +----> Create Account         Link OAuth Provider
                |                      |
                v                      v
         Account Created         Link Confirmed
                |                      |
                v                      v
              Login                Dashboard
```

### Decision Tree for Email Conflicts

```
OAuth Email Received
    |
    +--> Account with email exists?
            |
            +--> YES: Show Conflict Options
            |       |
            |       +--> User chooses "New Account"
            |       |       |
            |       |       +--> Email already taken?
            |       |               |
            |       |               +--> YES: Show error, retry
            |       |               +--> NO: Create new account
            |       |
            |       +--> User chooses "Link Account"
            |               |
            |               +--> User authenticated?
            |                       |
            |                       +--> NO: Require login first
            |                       +--> YES: Link OAuth provider
            |
            +--> NO: Create account normally
```

### OAuth Provider State Management

```
Initial State: [OAuth_Pending]
     |
     +--email_conflict--> [Conflict_Detected]
     |                         |
     |                    user_choice
     |                    /          \
     |           "new_account"    "link_account"
     |                  |              |
     |                  v              v
     |           [New_Email_Flow]  [Auth_Required]
     |                  |              |
     |            email_provided    authenticated
     |                  |              |
     |                  v              v
     |           [Creating_Account] [Linking_Provider]
     |                  |              |
     |                  v              v
     +-----------> [Account_Created] [Link_Complete]
```

## Configuration Requirements

### Environment Variables

No new environment variables required. Existing OAuth configuration sufficient:

```bash
# Existing OAuth Configuration
GITHUB_CLIENT_ID=existing_value
GITHUB_CLIENT_SECRET=existing_value
GOOGLE_CLIENT_ID=existing_value
GOOGLE_CLIENT_SECRET=existing_value
```

### Feature Configuration

Optional feature flag for gradual rollout:

```bash
# Optional Feature Flag
OAUTH_LINKING_ENABLED=true
```

### Monitoring Metrics

Recommended metrics to track OAuth linking success:

- **oauth_conflict_resolution_rate**: Percentage of conflicts resolved successfully
- **oauth_linking_success_rate**: Success rate of account linking attempts
- **oauth_new_account_creation_rate**: Rate of new account creation vs linking
- **oauth_authentication_failure_rate**: Failed authentication attempts during linking

## Future Enhancements

### Enhanced OAuth Management

- **Multiple Provider Linking**: Allow users to link multiple OAuth providers
- **Provider Unlinking**: Enable users to remove OAuth providers from accounts
- **Provider Management Dashboard**: UI for managing connected accounts

### Advanced Security Features

- **Account Verification**: Require email verification before OAuth linking
- **Audit Trail**: Detailed logging of all OAuth account activities
- **Suspicious Activity Detection**: Monitor for unusual linking patterns

### User Experience Improvements

- **Social Login UI**: Enhanced provider selection interface
- **Account Merge Wizard**: Guided process for complex account merging scenarios
- **Provider Sync**: Synchronize profile information from OAuth providers