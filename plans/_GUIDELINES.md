# Technical Plan Guidelines

These guidelines ensure consistency, clarity, and completeness across all technical implementation plans in this project.

## Table of Contents

### Core Structure & Templates
- [Plan Template Structure](#plan-template-structure)
- [Visual Flow Documentation](#visual-flow-documentation)
- [Content Guidelines](#content-guidelines)

### Change Management
- [Change Granularity Limits](#change-granularity-limits)
- [File Change Documentation Format](#file-change-documentation-format)

### Quality & Review
- [Testing Plan Requirements](#testing-plan-requirements)
- [Risk Assessment & Rollback Strategy](#risk-assessment--rollback-strategy)
- [Author Quality Checklist](#author-quality-checklist)
- [Reviewer Checklist](#reviewer-checklist)

### Technical Specifications
- [Database Schema Documentation](#database-schema-documentation)
- [Security Considerations](#security-considerations)
- [Performance Guidelines](#performance-guidelines)
- [Configuration Management](#configuration-management)

### Process & Standards
- [Section Management Protocol](#section-management-protocol)
- [Canonical Plan Examples](#canonical-plan-examples)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)
- [Plan Filename Convention](#plan-filename-convention)

## Plan Template Structure

This structure ensures every plan contains the essential information needed for implementation and review, preventing missing requirements and scope creep.

All plans must follow this standardized structure:

### 1. Plan Status (Required)
Provides at-a-glance tracking of implementation progress and timeline accountability.

- Status table with current phase and completion percentage
- Unique identifier and tracking information
- Start/end dates for timeline management

### 2. Phase Completion Status (Required)
Breaks complex features into manageable chunks and enables parallel work streams while tracking dependencies.

- Break implementation into logical phases
- Use checkboxes for task tracking: `- [x]` (complete) or `- [ ]` (pending)
- Phase emojis: ✅ (completed), 🚧 (pending), ⚠️ (blocked)
- **Follow change size limits**: Max 500 lines changed per phase, 200 lines per file

### 3. Overview (Required)
Establishes clear business context and user value to ensure everyone understands the "why" behind the implementation.

- Brief description of feature/change being implemented
- Business justification and user value

### 4. Current State Analysis (Required)
Documents what exists today so reviewers can understand the scope of changes and identify potential integration issues.

- Document existing implementation
- Identify integration points with specific file paths and line numbers
- List dependencies and constraints

### 5. Updated Flow Summary (Required)
Explains how the proposed changes affect existing flows so reviewers can spot regressions and validate user experience improvements.

- Describe new user flows and system behavior
- Include all affected user journeys
- Document security considerations
- **Optional**: Include diagrams for complex flows (ASCII sequence diagrams or linked images)

### 6. Database Schema Changes (If Applicable)
Ensures database changes are properly planned, indexed, and migrated without breaking existing data or causing performance issues.

- SQL migration scripts
- Drizzle/ORM schema definitions
- Index creation and optimization

### 7. Implementation Details (Required)
Provides concrete implementation guidance so developers know exactly which files to modify and what changes to make.

- File-by-file breakdown of changes
- New components, actions, middleware, routes
- Validation schemas and data contracts

### 8. Testing Plans (Required)
Ensures comprehensive testing coverage to catch bugs before production and provides reviewers with clear validation criteria.

- Automated Testing Plan (unit, integration)
- Functionality Review Plan (manual testing scenarios)

### 9. Risk Assessment & Rollback Strategy (Required)
Identifies potential deployment risks and provides clear rollback procedures so operations teams can respond quickly to issues.

- Risk identification and mitigation
- Rollback procedures and checkpoints
- Monitoring and alerting requirements
- Success/failure criteria

### 10. Additional Sections (As Needed)
Addresses feature-specific concerns like performance, configuration, and future considerations that don't fit standard sections.

- Configuration requirements
- Performance considerations
- Future enhancements
- Success metrics

## Visual Flow Documentation

Text-only plans can hide complex flow logic; diagrams help reviewers understand intricate sequences and catch integration issues.

### When to Include Diagrams
Use visual representations for:
- **Multi-step authentication flows** with decision points
- **Complex user journeys** spanning multiple pages/systems
- **Integration patterns** between services or components
- **State transitions** with multiple possible paths
- **Error handling flows** with various recovery options

### ASCII Sequence Diagram Template
For simple flows, use ASCII diagrams that render in markdown:

```
User Registration with Email Verification Flow:

User          Frontend       Backend        Database       Email
 |              |              |              |             |
 |--register--->|              |              |             |
 |              |--POST /auth->|              |             |
 |              |              |--insert----->|             |
 |              |              |<--user-------|             |
 |              |              |--generate--->|             |
 |              |              |<--OTP--------|             |
 |              |              |--send OTP----------------->|
 |              |<--redirect---|              |             |
 |<--verify-----|              |              |             |
 |              |              |              |             |
 |--enter OTP-->|              |              |             |
 |              |--POST verify>|              |             |
 |              |              |--validate--->|             |
 |              |              |<--success----|             |
 |              |              |--update----->|             |
 |              |<--success----|              |             |
 |<--access-----|              |              |             |
```

### Complex Flow Diagrams
For intricate flows, link to external diagrams:

```markdown
### OAuth Integration Flow
![OAuth Flow Diagram](./diagrams/oauth-integration-flow.png)

*Diagram shows the complete OAuth callback handling including:*
- *Account detection and merging logic*
- *Email conflict resolution steps*  
- *New user onboarding variations*
```

### State Machine Diagrams
For features with multiple states, use ASCII state diagrams:

```
Email Verification States:

[Unverified] --send_otp--> [OTP_Sent]
     |                         |
     |                    verify_otp
     |                         |
     |                         v
     |                   [Verified] (terminal)
     |                         ^
     |                         |
[OTP_Sent] --expire--> [Expired] --resend--> [OTP_Sent]
     |                         ^
     |                         |
     +----max_attempts---------+
```

### Decision Tree Format
For complex conditional logic:

```
User Login Decision Tree:

User enters email
    |
    +--> Account exists?
            |
            +--> YES: Has password?
            |       |
            |       +--> YES: Show password form
            |       +--> NO: Show OAuth options only
            |
            +--> NO: Redirect to registration
```

## Content Guidelines

Defines what belongs in technical plans to maintain focus on implementation guidance while avoiding business logic that belongs in code.

### Allowed Content ✅
- **File references and locations** with specific paths
- **Bullet-pointed change descriptions** with line numbers
- **Validation schemas** (input validation, form validation)
- **Data schemas** (API contracts, database models, TypeScript interfaces)
- **Database changes** (table structures, migrations, indexes)
- **SQL migration scripts** and DDL statements
- **Configuration schemas** and environment variables
- **Route definitions** and API endpoint specifications
- **Error handling patterns** and validation rules

### Prohibited Content ❌
- **Business logic implementation code** (actual function bodies)
- **Function implementations** with complete logic
- **Component implementation logic** (React component internals)
- **Algorithm implementations** (sorting, calculations, etc.)
- **Complex conditional logic** and control flow
- **State management implementation** (Redux reducers, etc.)

### Gray Area - Context Matters 🤔
- **Simple validation rules**: Allowed as schemas
- **Basic CRUD operations**: Reference only, no implementation
- **Configuration objects**: Allowed as data contracts
- **Interface definitions**: Allowed as data schemas

## Change Granularity Limits

Enforces manageable change sizes to improve code review quality, reduce deployment risk, and enable faster iteration cycles.

### Maximum Change Sizes
Adhere to these limits to maintain reviewability and deployment safety:

#### Per-File Limits
- **New Files**: Max 300 lines (excluding generated code/migrations)
- **File Updates**: Max 200 lines changed (additions + deletions)
- **File Moves/Renames**: Count as full file size toward limits

#### Per-Phase Limits  
- **Total Lines Changed**: Max 500 lines across all files in a phase
- **Files Modified**: Max 8 files per phase (excluding config/migration files)
- **New Components**: Max 3 new major components per phase

#### Per-Plan Limits
- **Database Tables**: Max 2 new tables per plan
- **API Endpoints**: Max 5 new routes per plan
- **Major Integrations**: 1 external service integration per plan

### When to Split Plans

#### Automatic Split Triggers 🚨
Split into multiple plans when any of these thresholds are exceeded:

**Large File Changes:**
```
❌ Single file > 200 lines changed
✅ Split into: Refactor plan + Feature plan

Example:
- Plan A: "Refactor Authentication Middleware" (cleanup existing)  
- Plan B: "Add Email Verification to Auth" (new feature)
```

**Database Heavy Changes:**
```
❌ 3+ new tables + major schema changes
✅ Split into: Schema plan + Logic plan  

Example:
- Plan A: "User Verification Database Schema" (tables, indexes, migrations)
- Plan B: "Email Verification Business Logic" (actions, handlers, frontend)
```

**Multi-System Integration:**
```
❌ Authentication + Payment + Notification systems in one plan
✅ Split into: Per-system plans with defined interfaces

Example:  
- Plan A: "User Authentication with Email Verification"
- Plan B: "Payment Processing Integration" 
- Plan C: "Notification System Integration"
```

### Recommended Split Strategies

#### Horizontal Splits (By Layer)
```
Plan 1: "Database Schema Changes"
- Migration files
- Schema definitions  
- Index optimizations

Plan 2: "Backend API Implementation"  
- Actions and handlers
- Validation schemas
- Route definitions

Plan 3: "Frontend Integration"
- React components
- Form handling
- User experience flows
```

#### Vertical Splits (By Feature)
```
Plan 1: "Core Email Verification"
- Basic OTP generation and validation
- Database integration
- Simple UI

Plan 2: "Advanced Verification Features" 
- Rate limiting and backoff
- Resend functionality
- Enhanced error handling

Plan 3: "Email Service Integration"
- SMTP configuration
- Template system
- Delivery monitoring
```

#### Temporal Splits (By Risk)
```
Plan 1: "Low-Risk Foundation" (Phase 1)
- Database schema (reversible)
- New endpoints (backwards compatible)
- Feature flags (disabled by default)

Plan 2: "Medium-Risk Integration" (Phase 2)  
- Business logic implementation
- Frontend integration
- Internal testing

Plan 3: "High-Risk Activation" (Phase 3)
- Feature flag enablement
- User flow migration
- Legacy code removal
```

### Change Size Estimation

#### Counting Guidelines
**Include in line count:**
- All code additions and deletions
- Configuration changes
- Test files and specifications
- Documentation updates

**Exclude from line count:**
- Auto-generated migrations (but count toward database limits)
- Package-lock.json or similar dependency files
- Binary assets (images, fonts)
- Whitespace-only changes

#### Estimation Template
```markdown
### Change Size Estimation

#### Phase 1: Database Schema (Estimated: 150 lines)
- **File**: `database/schema/users.ts` (UPDATE) - 25 lines
- **File**: `database/schema/user_verifications.ts` (NEW) - 85 lines  
- **File**: `database/migrations/add_verification.sql` (NEW) - 40 lines

#### Phase 2: Backend Logic (Estimated: 420 lines)
- **File**: `app/actions/auth/verify_email.ts` (NEW) - 120 lines
- **File**: `app/actions/auth/resend_verification.ts` (NEW) - 95 lines
- **File**: `app/handlers/auth.ts` (UPDATE) - 85 lines
- **File**: `app/middleware/email_verification.ts` (NEW) - 120 lines

**Total Estimated**: 570 lines
**Recommendation**: Split Phase 2 into two phases (285 lines each)
```

#### Updating Completed Phases
When a phase is completed, update the estimation section to reflect actual vs estimated changes:

```markdown
#### Phase 1: Database Schema (Estimated: 150 lines | Actual: 88 lines +65/-12) - COMPLETED
**Git Commit**: `abc123456789abcdef0123456789abcdef01234567`

**Estimated vs Actual**:
- **File**: `database/schema/users.ts` (UPDATE) - Estimated: 25 lines | Actual: 8 net lines (+15/-7)
- **File**: `database/schema/user_verifications.ts` (NEW) - Estimated: 85 lines | Actual: 43 lines (+43/-0)
- **File**: `database/migrations/add_verification.sql` (NEW) - Estimated: 40 lines | Actual: 20 lines (+20/-0)
- **File**: `database/schema/index.ts` (UPDATE) - Not estimated | Actual: 4 net lines (+5/-1)

**Total**: Estimated 150 lines | Actual 88 lines (+65/-12, 41% less than estimated)

**Why Different**: 
- Brief explanation of why actual changes were more/less than estimated
- Lessons learned for future estimation accuracy
```

**Required Updates for Completed Phases**:
- Update phase heading with actual line counts and +/- format
- Add git commit hash for traceability
- Include estimated vs actual comparison for each file
- Add any files that weren't originally estimated
- Provide total summary with percentage difference
- Explain why actual differed from estimated (learning opportunity)

## File Change Documentation Format

Standardizes how file changes are documented so developers can quickly locate and understand exactly what needs to be modified.

### File Reference Standard
Use this exact format for all file references:

```
**File**: `{absolute_file_path}` (STATUS)
```

**Status Options:**
- `(NEW)` - File will be created
- `(UPDATE)` - Existing file will be modified
- `(DELETE)` - File will be removed
- `(MOVE)` - File will be relocated
- `(RENAME)` - File will be renamed

### Examples
```
**File**: `app/actions/auth/verify_email_otp.ts` (NEW)
**File**: `app/middleware/auth_middleware.ts` (UPDATE)
**File**: `database/schema/users.ts` (UPDATE)
**File**: `app/legacy/old_handler.ts` (DELETE)
```

### Change Description Format
For each file modification:

```
**File**: `path/to/file.ts` (UPDATE)
- Line X-Y: Description of change
- Add: New functionality description
- Modify: What's being changed
- Remove: What's being removed
```

### Line Number Guidelines
- Use specific line ranges: `Line 45-52`
- Use single lines: `Line 23`
- Use approximate ranges for new files: `Line 1-50 (estimated)`
- Always explain what's happening at those lines

## Testing Plan Requirements

Ensures every feature has comprehensive test coverage and clear manual validation steps to prevent regressions and maintain quality.

### Automated Testing Plan
Every plan must include:
- **Unit Tests**: List specific functions/modules to test
- **Integration Tests**: End-to-end scenarios
- **Security Tests**: Authentication, authorization, input validation

### Functionality Review Plan
Manual testing scenarios covering:
- **Happy Path**: Primary user flow works correctly
- **Error Cases**: Invalid inputs, network failures, etc.
- **Edge Cases**: Boundary conditions, unusual inputs
- **Security**: Rate limiting, injection attempts, privilege escalation
- **Performance**: Load testing, response times
- **Cross-browser**: Compatibility testing

### Review Scenario Format
```
### Scenario X: [Descriptive Name]

**Steps to Test:**
1. Specific action to take
2. Expected system response
3. Verification step

**Expected Results:**
- Clear success criteria
- Measurable outcomes
```

## Risk Assessment & Rollback Strategy

Prepares operations teams for potential deployment issues by identifying risks upfront and providing clear recovery procedures.

### Risk Assessment Template
Document potential risks and their mitigation strategies:

```markdown
### Risk Assessment

#### High Risk Items
- **Database Migration Failure**: Large table alterations may timeout
  - *Mitigation*: Run migration during low-traffic window with extended timeout
  - *Rollback*: Revert to previous migration state, restore from backup if needed

#### Medium Risk Items  
- **Authentication Flow Changes**: Users may be logged out unexpectedly
  - *Mitigation*: Test thoroughly in staging with production data volume
  - *Rollback*: Feature flag to disable new auth flow, revert to previous version

#### Low Risk Items
- **UI Changes**: Minor styling updates with minimal user impact
  - *Mitigation*: A/B testing and gradual rollout
  - *Rollback*: CSS-only changes can be reverted quickly
```

### Rollback Strategy Template
Provide step-by-step rollback procedures:

```markdown
### Rollback Strategy

#### If Deployment Fails During Migration:
1. **Immediate**: Stop deployment pipeline
2. **Database**: Revert to last known good migration state
3. **Application**: Roll back to previous stable version
4. **Verification**: Run health checks on all critical endpoints
5. **Communication**: Notify stakeholders of rollback completion

#### If Issues Discovered Post-Deployment:
1. **Assessment**: Determine if issue is critical (< 5 minutes)
2. **Feature Flag**: Disable problematic feature if available
3. **Full Rollback**: If feature flag unavailable, initiate full rollback
4. **Monitoring**: Watch error rates and user impact metrics
5. **Root Cause**: Begin immediate investigation while system is stable

#### Rollback Success Criteria:
- [ ] All critical user flows working
- [ ] Error rates below normal baseline  
- [ ] Database consistency verified
- [ ] No data loss confirmed
```

### Monitoring Requirements
Specify what to watch during and after deployment:

- **Key Metrics**: Response times, error rates, user conversion
- **Health Checks**: Database connectivity, authentication, core features  
- **Alerting**: Automatic notifications for threshold breaches
- **Dashboards**: Real-time visibility for ops teams

## Database Schema Documentation

Provides both the raw SQL and ORM representations so database changes can be properly reviewed, migrated, and understood by all team members.

### SQL Migrations
Always include both the SQL and ORM/schema versions:

```sql
-- Migration: Add email verification
ALTER TABLE users ADD COLUMN email_verified_at INTEGER;
CREATE INDEX idx_users_email_verified ON users(email_verified_at);
```

### Schema Definitions
Include full schema definitions for new tables:

```typescript
// Complete table definition
export const newTable = sqliteTable('table_name', {
  // All fields with types and constraints
})
```

## Security Considerations

Ensures security is considered upfront rather than bolted on later, preventing vulnerabilities and compliance issues.

Every plan involving user data or authentication must address:
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Input Validation**: Sanitization and format checking
- **Data Protection**: Encryption, secure storage
- **Access Control**: Authorization and permission checks
- **Audit Logging**: Security event tracking

## Performance Guidelines

Identifies potential performance bottlenecks early so they can be addressed during implementation rather than discovered in production.

### Database Performance
- Index all foreign keys and frequently queried columns
- Consider query performance impact
- Plan for data cleanup and maintenance

### Application Performance
- Identify potential bottlenecks
- Plan for caching where appropriate
- Consider async operations for slow tasks

## Configuration Management

Documents all configuration requirements upfront so deployment and environment setup can be planned alongside development.

### Environment Variables
Document all required configuration:

```bash
# Feature Configuration
FEATURE_ENABLED=true
API_KEY=your_key_here
TIMEOUT_SECONDS=30
```

### Default Values
Specify sensible defaults for all configuration options.

## Section Management Protocol

Maintains consistency across plans by requiring approval for template changes while allowing flexibility for unique feature requirements.

### Adding New Sections
Before adding sections not in the template:

1. **Justify the Need**: Explain why the new section is necessary
2. **Define the Content**: Describe what information it will contain
3. **Request Approval**: Wait for explicit approval before proceeding
4. **Update Guidelines**: Add approved sections to this template

### Section Naming Convention
- Use descriptive, action-oriented names
- Keep consistent with existing sections
- Use proper markdown heading hierarchy

## Author Quality Checklist

Provides a final validation step to ensure plans meet all standards before implementation begins, reducing rework and miscommunication.

Before submitting any plan, verify:

### Content Quality ✅
- [ ] All file paths are absolute and accurate
- [ ] Line numbers reference actual code locations
- [ ] Database schemas include all necessary fields
- [ ] Validation rules are complete and secure
- [ ] Error handling is comprehensive

### Structure Compliance ✅
- [ ] Follows standard template structure
- [ ] Phase tracking is detailed and accurate
- [ ] Testing plans cover all scenarios
- [ ] Security considerations are addressed
- [ ] Performance impact is evaluated
- [ ] Risk assessment identifies potential issues
- [ ] Rollback strategy provides clear procedures

### Change Size Compliance ✅
- [ ] No single file exceeds 200 lines changed
- [ ] No phase exceeds 500 lines total changes
- [ ] Plan includes change size estimation
- [ ] Large changes are split appropriately
- [ ] Split rationale is clearly documented

### Documentation Standards ✅
- [ ] File changes use proper format
- [ ] Code examples follow guidelines
- [ ] Configuration is fully documented
- [ ] Dependencies are identified
- [ ] Future considerations are noted
- [ ] Complex flows include diagrams where helpful
- [ ] Diagrams are clear and add value over text descriptions

## Reviewer Checklist

Ensures consistent review quality and helps reviewers validate all critical aspects of technical plans before approving implementation.

### Business & Technical Alignment ✅
- [ ] **Problem Statement Clear**: Plan addresses a well-defined business need
- [ ] **Scope Appropriate**: Feature scope matches business requirements without over-engineering
- [ ] **Success Criteria Defined**: Clear metrics for measuring feature success
- [ ] **User Value Articulated**: End-user benefits are clearly explained
- [ ] **Technical Approach Sound**: Proposed solution fits architectural patterns

### Implementation Feasibility ✅
- [ ] **File References Valid**: All file paths exist or are correctly planned
- [ ] **Line Numbers Accurate**: Referenced code locations are current and correct
- [ ] **Dependencies Identified**: All external dependencies and integrations noted
- [ ] **Integration Points Clear**: How new code connects to existing systems
- [ ] **Error Handling Complete**: Failure scenarios and edge cases addressed

### Database & Schema Review ✅
- [ ] **Migration Safety**: Database changes are backwards-compatible or properly staged
- [ ] **Index Strategy**: Appropriate indexes planned for performance
- [ ] **Data Consistency**: No risk of data corruption or orphaned records
- [ ] **Rollback Viable**: Database changes can be safely reverted
- [ ] **Performance Impact**: Large table changes won't cause production issues

### Security & Risk Assessment ✅
- [ ] **Authentication Secure**: No authentication bypass vulnerabilities
- [ ] **Authorization Proper**: Access controls follow principle of least privilege
- [ ] **Input Validation**: All user inputs are validated and sanitized
- [ ] **Rate Limiting**: Abuse prevention mechanisms in place
- [ ] **Data Protection**: Sensitive data is properly encrypted/protected
- [ ] **Risk Mitigation**: High-risk items have clear mitigation strategies
- [ ] **Rollback Procedures**: Clear, tested rollback procedures documented

### Code Quality & Maintainability ✅
- [ ] **Change Size Reasonable**: No file exceeds 200 lines changed, phases under 500 lines
- [ ] **Complexity Manageable**: Changes are broken into reviewable chunks
- [ ] **Pattern Consistency**: Follows existing codebase patterns and conventions
- [ ] **Documentation Adequate**: Complex logic is well-documented
- [ ] **Test Coverage**: Comprehensive testing plan covers all scenarios

### User Experience & Flow ✅
- [ ] **User Flows Logical**: User journeys make sense and are intuitive
- [ ] **Error Messages Helpful**: Users get clear guidance when things go wrong
- [ ] **Performance Acceptable**: No negative impact on user experience
- [ ] **Accessibility Considered**: Features work for users with disabilities
- [ ] **Mobile Friendly**: Responsive design considerations included

### Testing & Validation ✅
- [ ] **Test Scenarios Complete**: Happy path, error cases, and edge cases covered
- [ ] **Integration Testing**: End-to-end user flows are testable
- [ ] **Performance Testing**: Load/stress testing for high-impact features
- [ ] **Security Testing**: Penetration testing considerations for auth features
- [ ] **Manual Testing Steps**: Clear validation steps for reviewers

### Deployment & Operations ✅
- [ ] **Configuration Complete**: All environment variables and settings documented
- [ ] **Monitoring Planned**: Appropriate metrics and alerting defined
- [ ] **Rollback Tested**: Rollback procedures are feasible and tested
- [ ] **Feature Flags**: Gradual rollout strategy for high-risk changes
- [ ] **Documentation Updated**: Operational runbooks and user docs planned

### Plan Structure & Clarity ✅
- [ ] **Template Compliance**: Follows standard plan structure
- [ ] **Phase Breakdown**: Logical phases with clear dependencies
- [ ] **Diagrams Helpful**: Complex flows include clear visual representations
- [ ] **Writing Quality**: Plan is clear, concise, and free of ambiguity
- [ ] **Completeness**: All required sections present and well-developed

### Reviewer Actions

#### ✅ **Approve** - When:
- All checklist items are satisfied
- Any concerns have been addressed
- Implementation risk is acceptable
- Team has capacity for the proposed timeline

#### 🔄 **Request Changes** - When:
- Critical security or data safety issues identified
- Change size exceeds guidelines and needs splitting
- Missing essential implementation details
- Integration concerns need resolution

#### ❓ **Ask Questions** - When:
- Technical approach needs clarification
- Business requirements seem unclear
- Implementation timeline seems unrealistic
- Dependencies or risks need more detail

#### 💡 **Suggest Improvements** - When:
- Better technical approaches are available
- Performance optimizations could be included
- User experience could be enhanced
- Future considerations should be addressed

### Review Time Guidelines

#### Plan Size vs Review Time
- **Small Plans** (< 200 lines changed): 30-60 minutes
- **Medium Plans** (200-500 lines): 1-2 hours
- **Large Plans** (500+ lines): Request plan splitting

#### Review Depth by Risk
- **High Risk** (auth, payments, data migration): Deep technical review + security review
- **Medium Risk** (new features, integrations): Standard technical review
- **Low Risk** (UI updates, config changes): Focused review on specific areas

### Common Review Issues

#### 🚩 **Red Flags** (Require Changes)
- Authentication/authorization gaps
- Potential data loss scenarios  
- Performance degradation risks
- Missing rollback procedures
- Excessive change complexity

#### ⚠️ **Yellow Flags** (Need Discussion)
- Unclear integration patterns
- Missing error handling
- Incomplete testing coverage
- Vague requirements
- Timeline concerns

#### ✅ **Green Signals** (Good Quality)
- Clear problem definition
- Comprehensive testing plan
- Appropriate change sizing
- Strong security considerations
- Well-documented rollback strategy

## Common Mistakes to Avoid

Highlights frequent errors in plan writing with specific examples to help new authors avoid common pitfalls and maintain quality standards.

### ❌ Don't Do This
- Vague file references: ~~"Update the auth file"~~
- Missing line numbers: ~~"Modify the login function"~~
- Implementation code: ~~Complete function bodies~~
- Incomplete testing: ~~"Test that it works"~~
- Missing security: ~~No mention of rate limiting or validation~~

### ✅ Do This Instead
- Specific references: **File**: `app/handlers/auth.ts` (UPDATE)
- Precise locations: Line 45-52: Modify handleLogin function
- Change descriptions: Add email verification check after authentication
- Detailed scenarios: Test invalid OTP codes with attempt limiting
- Security planning: Implement rate limiting and input sanitization

## Canonical Plan Examples

Real examples demonstrate best practices more effectively than abstract guidelines. Study these approved plans to understand quality standards and formatting expectations.

### Reference Plans

#### ✅ **Email Verification Implementation**
**File**: [`user_registration_email_verification_via_OTP.md`](./user_registration_email_verification_via_OTP.md)

**What it demonstrates well:**
- **Comprehensive phase breakdown** with clear completion tracking
- **Database schema documentation** with both SQL and Drizzle examples
- **Risk assessment and rollback strategy** for authentication changes
- **Detailed testing scenarios** covering happy path, errors, and edge cases
- **Visual flow documentation** with decision trees and state diagrams
- **Proper change size estimation** and phase splitting rationale

**Key patterns to emulate:**
- File references with exact line numbers and change descriptions
- Security considerations integrated throughout (not afterthought)
- Manual testing scenarios with step-by-step validation
- Configuration requirements documented upfront
- Future enhancement considerations

#### 🚧 **Additional Examples Coming Soon**
*Once two or more plans are merged, add them to the 'examples' list below.*

**Planned canonical examples:**
- **Database Migration Plan**: Large schema changes with zero-downtime approach
- **External Integration Plan**: Third-party API integration with retry/fallback logic  
- **Performance Optimization Plan**: Query optimization with before/after metrics
- **UI Component Library Plan**: Reusable component development with design system integration

### Example Usage Patterns

#### **For New Plan Authors:**
1. **Start with a similar example**: Find a plan that matches your feature type
2. **Copy the structure**: Use the same section headings and formatting
3. **Adapt the content**: Replace example content with your specific requirements
4. **Cross-reference**: Check that your plan covers all areas the example covers

#### **For Plan Reviewers:**
1. **Compare against examples**: Does this plan meet the same quality bar?
2. **Check completeness**: Are all sections from canonical examples present?
3. **Validate patterns**: Does the plan follow established formatting conventions?
4. **Assess detail level**: Is the specificity comparable to approved examples?

### Quality Comparison Matrix

Use this matrix to compare your plan against canonical examples:

| Quality Aspect | Your Plan | Email Verification Example | Gap Analysis |
|---------------|-----------|----------------------------|--------------|
| **Phase Breakdown** | ☐ Clear phases with dependencies | ✅ 4 logical phases with completion tracking | *Fill in gaps* |
| **Database Changes** | ☐ Schema + migrations documented | ✅ SQL + Drizzle + migration strategy | *Fill in gaps* |
| **Risk Assessment** | ☐ Risks identified with mitigation | ✅ High/medium/low risk categorization | *Fill in gaps* |
| **Testing Plans** | ☐ Automated + manual scenarios | ✅ 12 comprehensive test scenarios | *Fill in gaps* |
| **Change Sizing** | ☐ Granularity within limits | ✅ Phase splitting at 500+ lines | *Fill in gaps* |
| **Visual Documentation** | ☐ Complex flows diagrammed | ✅ State machines + decision trees | *Fill in gaps* |

### Template Extraction

When creating new plans, extract these proven patterns from canonical examples:

#### **From Email Verification Plan:**
```markdown
## Plan Status
| Field | Value |
|-------|-------|
| **Status** | [Phase X Complete] |
| **Percent Done** | [X]% |
| **Title** | [Descriptive Feature Name] |

## Phase Completion Status
### ✅ Phase 1: [Phase Name] (COMPLETED)
- [x] Specific deliverable with outcome
- [x] Another deliverable with verification criteria

### 🚧 Phase 2: [Phase Name] (PENDING)  
- [ ] Future deliverable with clear definition
```

#### **Risk Assessment Template:**
```markdown
## Risk Assessment & Rollback Strategy

### Risk Assessment
#### High Risk Items
- **[Risk Name]**: [Description of potential impact]
  - *Mitigation*: [Specific prevention strategy]
  - *Rollback*: [Exact recovery procedure]

### Rollback Strategy
#### If Deployment Fails During [Critical Phase]:
1. **Immediate**: [First response action]
2. **[System]**: [System-specific recovery steps]
3. **Verification**: [How to confirm rollback success]
```

## Plan Filename Convention

Establishes consistent naming so plans are easy to locate, reference, and understand at a glance.

Use descriptive, kebab-case filenames:
- `user_registration_email_verification_via_OTP.md`
- `payment_processing_stripe_integration.md`
- `user_profile_management_system.md`
- `admin_dashboard_analytics_widgets.md`

This ensures consistency and makes plans easy to locate and reference.