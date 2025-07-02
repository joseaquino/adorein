# Local Plans Viewer UI - Implementation Plan

## Plan Status

| Field | Value |
|-------|-------|
| **Status** | Planning Phase |
| **Percent Done** | 0% |
| **Title** | Local Plans Viewer UI |
| **Start Date** | 2025-01-07 |
| **End Date** | TBD |
| **Plan Slug** | local-plans-viewer-ui |
| **Unique Identifier** | `plan_20250107_plans_viewer_ui` |

## Phase Completion Status

### 🚧 Phase 1: Backend Infrastructure (PENDING)
- [ ] Create plan parser service to extract metadata from markdown files
- [ ] Implement filesystem scanner for plans directory
- [ ] Create API endpoints for listing and retrieving plans
- [ ] Add route handlers for plans API
- [ ] Implement markdown to HTML conversion service

### 🚧 Phase 2: Frontend Components (PENDING)
- [ ] Create plans list page component
- [ ] Implement individual plan viewer component
- [ ] Add markdown HTML renderer with syntax highlighting
- [ ] Create navigation components for plans interface
- [ ] Add loading states and error handling

### 🚧 Phase 3: Integration & Polish (PENDING)
- [ ] Connect frontend components to backend API
- [ ] Add search and filtering functionality
- [ ] Implement responsive design
- [ ] Add keyboard navigation support
- [ ] Test complete user flow

## Overview

This plan outlines the implementation of a local-only UI for viewing and browsing project plans. The system will parse markdown files from the `/plans/` directory, extract metadata (status, completion percentage, phases), and present them in a user-friendly web interface accessible only during local development.

**Business Value**: Provides developers with an easy way to browse, review, and track progress on technical implementation plans without leaving the development environment.

## Current State Analysis

### Existing Infrastructure
- **Plans Directory**: `/plans/` contains markdown files following established guidelines
- **Plan Structure**: Standardized format with status tables, phase tracking, and comprehensive documentation
- **Backend Framework**: AdonisJS 6 with established routing and handler patterns in `app/handlers/`
- **Frontend Stack**: React 19 with Inertia.js, Tailwind CSS 4, and established component patterns in `inertia/`

### Integration Points
- **Route Registration**: `start/routes.ts:1-30` - Add development-only routes following existing patterns
- **Handler Pattern**: `app/handlers/auth.ts:1-100` - Follow existing handler conventions and error handling
- **Frontend Pages**: `inertia/pages/auth/login.tsx:1-50` - Add new pages following existing structure and layout patterns
- **Component Library**: `inertia/components/` - Reuse existing UI components and Tailwind patterns

### Dependencies & Constraints
- **Development Only**: Feature should only be available in development environment
- **File System Access**: Backend needs to read files from `/plans/` directory
- **Markdown Processing**: Requires markdown parsing and HTML conversion
- **Security**: Ensure no sensitive information exposure through plans

## Updated Flow Summary

### Plans Browsing Flow
1. **Plans List View** (`/dev/plans`):
   - Display all plans from `/plans/` directory
   - Show metadata: title, status, completion percentage
   - Filter by status (completed, in progress, pending)
   - Search by plan title or content
   - Click to view individual plan

2. **Individual Plan View** (`/dev/plans/:slug`):
   - Parse and display markdown content as formatted HTML
   - Show plan metadata in header section
   - Render phase completion status with visual indicators
   - Support code syntax highlighting
   - Navigation between plans

3. **Plan Metadata Extraction**:
   - Parse markdown frontmatter and status tables
   - Extract phase completion data
   - Calculate progress percentages
   - Generate plan slugs from filenames

### Visual Flow Diagram

```
Plans Viewer User Flow:

Developer    Frontend     Backend      FileSystem   Plans
    |           |            |                    |    |
    |--access-->|            |                    |    |
    |           |---------GET /dev/plans--------->|    |
    |           |            |-----env check----->|    |
    |           |            |<-----authorized----|    |
    |           |            |--scan dir--------->|    |
    |           |            |<-file list----------|    |
    |           |            |--parse metadata-------->|
    |           |            |<--plan data-------------|
    |           |<-plans list-|                   |    |
    |<-UI-------|            |                    |    |
    |           |            |                    |    |
    |--click--->|            |                    |    |
    |           |--------GET /plans/:slug-------->|    |
    |           |            |--read file--------->|    |
    |           |            |<-content-----------|    |
    |           |            |--parse & convert------->|
    |           |            |<--HTML content----------|
    |           |<-plan view-|                    |    |
    |<-display--|            |                    |    |
```

### Security Considerations
- **Access Control**: Development environment middleware prevents production access
- **File System Security**: Read-only access restricted to `/plans/` directory only
- **Input Validation**: Validate plan slugs to prevent directory traversal attacks
- **Content Sanitization**: Sanitize HTML output to prevent XSS vulnerabilities
- **No Authentication Required**: Feature relies on development environment restriction
- **Audit Logging**: Log file access attempts for security monitoring

## Implementation Details

### Backend Components

#### **File**: `app/services/plan_parser_service.ts` (NEW)
- Line 1-150 (estimated): Parse markdown files and extract metadata using unified
- Add: `parseMarkdownFile()` function using unified pipeline with remark and rehype
- Add: `extractPlanMetadata()` function for status table and frontmatter parsing
- Add: `convertToHTML()` function with rehype-highlight for syntax highlighting
- Add: `generateSlug()` function for URL-friendly identifiers
- Add: `generateTableOfContents()` function using rehype-toc
- Add: Cache layer for parsed content performance optimization

#### **File**: `app/handlers/dev/plans.ts` (NEW)
- Line 1-100 (estimated): Handler functions for plans API
- Add: `listPlans()` method - scan directory and return plan metadata array
- Add: `showPlan()` method - retrieve and parse individual plan content
- Add: Environment check middleware integration
- Add: Error handling for file not found, parse errors, and invalid slugs

#### **File**: `app/middleware/dev_environment_middleware.ts` (NEW)
- Line 1-40 (estimated): Development environment check middleware
- Add: Environment validation to ensure NODE_ENV !== 'production'
- Add: Feature flag check for DEV_PLANS_VIEWER_ENABLED
- Add: Error responses for unauthorized access attempts
- Add: Integration with existing middleware patterns

#### **File**: `start/routes.ts` (UPDATE)
- Line 50-60 (estimated): Add development route group
- Add: Route group with development environment middleware
- Add: `GET /dev/plans` -> `DevPlansHandler.listPlans`
- Add: `GET /dev/plans/:slug` -> `DevPlansHandler.showPlan`
- Modify: Import statement for new dev plans handler

### Frontend Components

#### **File**: `inertia/pages/dev/plans/index.tsx` (NEW)
- Line 1-200 (estimated): Plans listing page component
- Add: Search input component with debounced filtering
- Add: Status filter dropdown (All, Completed, Pending, In Progress)
- Add: Grid/list view toggle with state management
- Add: Progress indicators using existing UI patterns
- Add: Responsive layout with Tailwind grid system

#### **File**: `inertia/pages/dev/plans/show.tsx` (NEW)
- Line 1-250 (estimated): Individual plan viewer component
- Add: Markdown HTML renderer with syntax highlighting
- Add: Table of contents navigation sidebar
- Add: Phase progress visualization with completion indicators
- Add: Print stylesheet and optimized print layout
- Add: Navigation breadcrumbs and back button

#### **File**: `inertia/components/plans/plan-card.tsx` (NEW)
- Line 1-80 (estimated): Reusable plan card component
- Add: Plan metadata display (title, status, progress percentage)
- Add: Status badge with color coding based on completion
- Add: Progress bar component with percentage indicator
- Add: Click handler for navigation to plan detail view

#### **File**: `inertia/components/plans/markdown-renderer.tsx` (NEW)
- Line 1-120 (estimated): Markdown HTML renderer component
- Add: HTML content sanitization and safe rendering
- Add: Syntax highlighting for code blocks using existing theme
- Add: Responsive table formatting with horizontal scroll
- Add: Typography styles consistent with existing design system

### Data Schemas

#### Plan Metadata Interface
```typescript
interface PlanMetadata {
  slug: string
  title: string
  status: string
  percentDone: number
  startDate?: string
  endDate?: string
  uniqueId: string
  fileName: string
  phases: PhaseStatus[]
  lastModified: Date
  frontmatter?: Record<string, any> // Parsed frontmatter data
}

interface PhaseStatus {
  name: string
  status: 'completed' | 'pending' | 'blocked'
  tasks: TaskStatus[]
  emoji: string
}

interface TaskStatus {
  description: string
  completed: boolean
}

interface TOCItem {
  id: string
  text: string
  level: number
  children: TOCItem[]
}
```

#### API Response Schemas
```typescript
// GET /dev/plans
interface PlansListResponse {
  plans: PlanMetadata[]
  totalCount: number
}

// GET /dev/plans/:slug
interface PlanDetailResponse {
  plan: PlanMetadata
  content: string // HTML content processed by unified
  tableOfContents: TOCItem[]
  rawMarkdown?: string // Optional raw content for debugging
}
```

#### Unified Processing Pipeline
```typescript
interface UnifiedProcessor {
  // Core unified pipeline configuration
  processor: unified.Processor
  
  // Remark plugins for markdown parsing
  remarkPlugins: [
    'remark-parse',
    'remark-frontmatter', 
    'remark-parse-frontmatter',
    'remark-gfm' // GitHub Flavored Markdown
  ]
  
  // Rehype plugins for HTML generation
  rehypePlugins: [
    'remark-rehype',
    'rehype-highlight', // Syntax highlighting
    'rehype-toc',       // Table of contents
    'rehype-slug',      // Add IDs to headings
    'rehype-stringify'
  ]
}
```

## Testing Plans

### Automated Testing Plan

#### Unit Tests
- **Plan Parser Service**: Test unified pipeline, remark/rehype plugin chain, metadata extraction
- **Unified Processing**: Test frontmatter parsing, syntax highlighting, TOC generation
- **Plans Handler**: Test API endpoints, error handling, development middleware
- **Frontend Components**: Test rendering, user interactions, responsive behavior

#### Integration Tests
- **File System Integration**: Test reading plans directory, handling missing files
- **End-to-End Flow**: Test complete user journey from list to individual plan view
- **Error Scenarios**: Test handling of malformed markdown, missing metadata

### Functionality Review Plan

#### Scenario 1: Plans List View
**Steps to Test:**
1. Navigate to `/dev/plans` in development environment
2. Verify all plans from `/plans/` directory are displayed
3. Check that metadata (status, progress) is correctly parsed and shown
4. Test search functionality with plan titles
5. Test filtering by status categories

**Expected Results:**
- All valid plans appear in the list
- Metadata displays correctly with proper formatting
- Search returns relevant results
- Filters work correctly

#### Scenario 2: Individual Plan Viewing
**Steps to Test:**
1. Click on a plan from the list view
2. Verify plan content renders as formatted HTML via unified processing
3. Check that code blocks have syntax highlighting (rehype-highlight)
4. Test table formatting and responsive design (remark-gfm)
5. Verify phase status indicators display correctly
6. Check table of contents generation (rehype-toc)
7. Verify heading IDs are generated (rehype-slug)

**Expected Results:**
- Markdown content converts to properly formatted HTML via unified pipeline
- Code syntax highlighting works with highlight.js
- GitHub Flavored Markdown features (tables, strikethrough) render correctly
- Table of contents auto-generates with proper nesting
- Phase completion status shows accurate progress

#### Scenario 3: Development Environment Restriction
**Steps to Test:**
1. Access plans routes in production environment
2. Verify routes are not accessible
3. Test middleware protection works correctly

**Expected Results:**
- Plans routes return 404 or access denied in production
- Development middleware properly restricts access

#### Scenario 4: Error Handling
**Steps to Test:**
1. Request non-existent plan slug
2. Test with malformed markdown files
3. Test when plans directory is empty or missing

**Expected Results:**
- Proper error messages for missing plans
- Graceful handling of parsing errors
- Empty state displays correctly

## Risk Assessment & Rollback Strategy

### Risk Assessment

#### Low Risk Items
- **Read-only functionality**: No data modification reduces risk of corruption
  - *Mitigation*: Plans are only displayed, never modified through the UI
  - *Rollback*: Simple route removal if issues arise

- **Development-only feature**: Limited exposure to production environment
  - *Mitigation*: Environment middleware prevents production access
  - *Rollback*: Feature flag or route removal

#### Medium Risk Items
- **File system access**: Backend reads from file system
  - *Mitigation*: Restrict access to `/plans/` directory only, add error handling
  - *Rollback*: Remove routes and handlers, no data impact

- **Markdown parsing**: External content processing could cause errors
  - *Mitigation*: Comprehensive error handling and input validation
  - *Rollback*: Disable routes until parsing issues are resolved

### Rollback Strategy

#### If Issues Discovered During Development:
1. **Immediate**: Disable routes by commenting out in `start/routes.ts`
2. **Assessment**: Determine if issue is with parsing, rendering, or routing
3. **Targeted Fix**: Address specific component without affecting rest of application
4. **Re-enable**: Test thoroughly before re-enabling routes

#### Rollback Success Criteria:
- [ ] Application starts and runs normally without plans features
- [ ] No impact on existing authentication and main application flows
- [ ] Development environment remains functional for other features

### Change Size Estimation

#### Phase 1: Backend Infrastructure (Estimated: 360 lines)
- **File**: `app/services/plan_parser_service.ts` (NEW) - 160 lines (unified pipeline setup)
- **File**: `app/handlers/dev/plans.ts` (NEW) - 100 lines
- **File**: `start/routes.ts` (UPDATE) - 10 lines
- **File**: `app/middleware/dev_environment_middleware.ts` (NEW) - 40 lines
- **File**: `package.json` (UPDATE) - 15 lines (unified ecosystem dependencies)
- **File**: `app/types/plans.ts` (NEW) - 35 lines (TypeScript interfaces)

#### Phase 2: Frontend Components (Estimated: 450 lines)
- **File**: `inertia/pages/dev/plans/index.tsx` (NEW) - 200 lines
- **File**: `inertia/pages/dev/plans/show.tsx` (NEW) - 250 lines

#### Phase 3: Integration & Polish (Estimated: 200 lines)
- **File**: `inertia/components/plans/plan-card.tsx` (NEW) - 80 lines
- **File**: `inertia/components/plans/markdown-renderer.tsx` (NEW) - 120 lines

**Total Estimated**: 1010 lines
**Assessment**: Within acceptable limits, phases are under 500 lines each

#### Unified Dependencies Package Changes
```json
{
  "dependencies": {
    "unified": "^11.0.4",
    "remark-parse": "^11.0.0", 
    "remark-frontmatter": "^5.0.0",
    "remark-parse-frontmatter": "^1.0.1",
    "remark-gfm": "^4.0.0",
    "remark-rehype": "^11.0.0",
    "rehype-highlight": "^7.0.0",
    "rehype-toc": "^3.0.2",
    "rehype-slug": "^6.0.0", 
    "rehype-stringify": "^10.0.0",
    "highlight.js": "^11.9.0"
  }
}

## Configuration Requirements

### Environment Variables
```bash
# Development feature toggle
DEV_PLANS_VIEWER_ENABLED=true

# Plans directory path (optional, defaults to ./plans)
PLANS_DIRECTORY_PATH=./plans
```

### Dependencies
- **Unified Ecosystem**: Add `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify` for markdown processing
- **Syntax Highlighting**: Add `rehype-highlight` with `highlight.js` for code block highlighting
- **Table of Contents**: Add `rehype-toc` for automatic TOC generation
- **Frontmatter**: Add `remark-frontmatter` and `remark-parse-frontmatter` for metadata extraction
- **File System Utilities**: Use Node.js built-in `fs` and `path` modules

## Performance Considerations

### File System Performance
- Cache parsed plan metadata to avoid re-parsing on every request
- Implement file watcher for development to invalidate cache on changes
- Lazy load plan content only when viewing individual plans

### Frontend Performance
- Virtual scrolling for large numbers of plans
- Lazy loading of plan content
- Optimized re-rendering with React keys and memoization

## Future Enhancements

### Phase 2 Potential Features
- Plan editing capabilities (create/update plans through UI)
- Plan templates for common implementation patterns
- Progress tracking and completion analytics
- Export functionality (PDF, HTML)
- Integration with development workflow (git status, deployments)

### Integration Opportunities
- Link plans to git commits/branches
- Connect to CI/CD pipeline status
- Integration with issue tracking
- Team collaboration features for plan reviews

## Success Metrics

### Functionality Metrics
- All plans in `/plans/` directory are discoverable and viewable
- Markdown content renders correctly with proper formatting
- Search and filtering work accurately
- Page load times under 500ms for plan listing
- Individual plan view loads under 1 second

### User Experience Metrics
- Intuitive navigation between plans
- Responsive design works on different screen sizes
- Keyboard navigation support
- Accessible to screen readers and assistive technology

### Development Impact
- No impact on existing application performance
- Development environment remains stable
- Feature can be easily disabled/enabled
- No security vulnerabilities introduced