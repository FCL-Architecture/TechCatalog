# Product Requirements Document (PRD)
# Technology Standards Catalog Review & Approval System

**Version:** 1.0  
**Date:** January 2026  
**Author:** Technology Architecture Team  
**Status:** In Development

---

## 1. Product Overview

### 1.1 Purpose
A full-stack web application for managing the organization's technology standards catalog. The system enables technology governance teams to maintain, review, and approve technology items with proper workflow controls and audit trails.

### 1.2 Target Users
- Enterprise Architects
- Technology Architecture Team members
- Governance Team Leaders
- Standards Reviewers and Approvers

### 1.3 Technology Stack
- **Frontend:** React 18 with TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend:** Express.js with TypeScript
- **Database:** PostgreSQL (development) / Azure SQL (production) via Drizzle ORM
- **Authentication:** Replit Auth (OIDC-based)

---

## 2. Features & Requirements

### 2.1 User Authentication (F-001)
**Priority:** P0 - Critical

| Requirement | Description |
|-------------|-------------|
| FR-001.1 | Users can sign in via Replit Auth |
| FR-001.2 | User profile stored with email, name, and profile image |
| FR-001.3 | Session management with secure cookies |
| FR-001.4 | Unauthenticated users redirected to landing page |

### 2.2 Dashboard (F-002)
**Priority:** P1 - High

| Requirement | Description |
|-------------|-------------|
| FR-002.1 | Display total count of catalog items |
| FR-002.2 | Show count of items pending review |
| FR-002.3 | Show count of approved items |
| FR-002.4 | Display count of categories/domains |
| FR-002.5 | Quick navigation to catalog, categories, and import |

### 2.3 Catalog Management (F-003)
**Priority:** P0 - Critical

| Requirement | Description |
|-------------|-------------|
| FR-003.1 | List all catalog items in a sortable table |
| FR-003.2 | Display key columns: Name, Domain, Vendor, Deployment, Lifecycle, Status |
| FR-003.3 | Filter items by status (draft, review, approved, rejected) |
| FR-003.4 | Filter items by category |
| FR-003.5 | Search items by name |
| FR-003.6 | Create new catalog items with all fields |
| FR-003.7 | View item details with all 25+ fields |
| FR-003.8 | Edit existing catalog items |
| FR-003.9 | Delete catalog items |

### 2.4 Catalog Item Fields (F-004)
**Priority:** P0 - Critical

All fields from SharePoint schema must be supported:

**Basic Information:**
- Technology Name (required, text)
- Description (text)
- Category (dropdown, linked to categories table)

**Classification:**
- Technology Domain (dropdown - 11 options per guidance)
- Technology Subcategories (text)
- Service Category (text)
- Service Component (text)

**Technology Details:**
- Vendor Name (text)
- Version / Model (text)
- Deployment Model (dropdown: On-Prem, Cloud, Hybrid, SaaS)
- Operational Lifecycle (dropdown: Evaluate, Introduce, Standard, Maintain, Contain, Retire)
- Strategic Direction TIME (dropdown: Tolerate, Invest, Migrate, Eliminate)
- Technology Capability (text)

**AI Capabilities:**
- AI Capability Type (dropdown: No AI Capabilities, Native AI, AI via API, AI Configurable, AI Embedded)
- AI Providers (dropdown: OpenAI, Google Gemini, Microsoft Copilot, AWS Bedrock, IBM Watson, Custom AI Models, Other)
- Can AI Provider Be Switched (dropdown: Yes, No)

**Governance:**
- Governance Group (text)
- Standards Reviewer (text)
- Standard Approver (text)
- Business Reviewer (text)
- Owner (text)
- Compliance Asset ID (text)

**Metadata:**
- Source (text)
- Last Catalog Update (date)
- Comments (text)
- Status (system: draft, review, approved, rejected, archived)
- Created At (system, auto)
- Updated At (system, auto)

### 2.5 Category Management (F-005)
**Priority:** P1 - High

| Requirement | Description |
|-------------|-------------|
| FR-005.1 | List all categories |
| FR-005.2 | Display item count per category |
| FR-005.3 | Assign Team Leader to each category |
| FR-005.4 | Team Leader selection via user search |
| FR-005.5 | Categories auto-created during import based on Technology Domain |

### 2.6 Review Workflow (F-006)
**Priority:** P1 - High

| Requirement | Description |
|-------------|-------------|
| FR-006.1 | Items created in "draft" status |
| FR-006.2 | Owner can submit item for review (status: review) |
| FR-006.3 | Reviewers can approve or reject items |
| FR-006.4 | Review requires verdict and comments |
| FR-006.5 | Review history displayed on item detail page |
| FR-006.6 | Reviews timestamped and attributed to reviewer |

### 2.7 Data Import (F-007)
**Priority:** P0 - Critical

| Requirement | Description |
|-------------|-------------|
| FR-007.1 | Upload Excel file (.xlsx, .xls) |
| FR-007.2 | Parse all 25 SharePoint columns |
| FR-007.3 | Display preview table before commit |
| FR-007.4 | Show validation status per row |
| FR-007.5 | Auto-create categories based on Technology Domain |
| FR-007.6 | Commit imports to database |
| FR-007.7 | Show import results (items created, categories created) |

---

## 3. User Interface Design

### 3.1 Layout
- Sidebar navigation with links to all pages
- Header with user profile and sign out
- Main content area with responsive design
- Support for light/dark mode

### 3.2 Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | / | Public page with sign-in button |
| Dashboard | /dashboard | Portfolio metrics and quick actions |
| Catalog | /catalog | List and manage all items |
| Item Detail | /catalog/:id | View/edit single item with all fields |
| Categories | /categories | Manage categories and team leaders |
| Import | /import | Upload and commit Excel files |

### 3.3 Components
- Status badges with color coding (draft=gray, review=yellow, approved=green, rejected=red)
- Data tables with sorting and filtering
- Forms with validation using react-hook-form + Zod
- Dialog modals for create/edit operations
- Toast notifications for user feedback

---

## 4. API Specification

### 4.1 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/auth/user | Get current authenticated user |
| GET | /api/login | Initiate OAuth login |
| GET | /api/logout | End user session |
| GET | /api/catalog | List catalog items with filters |
| GET | /api/catalog/:id | Get single catalog item with reviews |
| POST | /api/catalog | Create new catalog item |
| PUT | /api/catalog/:id | Update catalog item |
| DELETE | /api/catalog/:id | Delete catalog item |
| GET | /api/categories | List all categories |
| PUT | /api/categories/:id | Update category (team leader) |
| POST | /api/reviews | Create review for item |
| POST | /api/import/parse | Parse uploaded Excel file |
| POST | /api/import/commit | Commit parsed items to database |

---

## 5. Data Model

### 5.1 Entity Relationship

```
users (1) ----< (M) reviews
users (1) ----< (M) categories (team_leader)
categories (1) ----< (M) catalog_items
catalog_items (1) ----< (M) reviews
```

### 5.2 Tables

**users**
- id (PK, varchar)
- email, firstName, lastName, profileImageUrl
- createdAt, updatedAt

**categories**
- id (PK, serial)
- name
- teamLeaderId (FK -> users)

**catalog_items**
- id (PK, serial)
- categoryId (FK -> categories)
- All 25+ catalog fields
- status, createdAt, updatedAt

**reviews**
- id (PK, serial)
- catalogItemId (FK -> catalog_items)
- reviewerId (FK -> users)
- verdict, comments
- createdAt

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Page load under 3 seconds |
| Availability | 99% uptime during business hours |
| Security | HTTPS, secure session cookies, input validation |
| Compatibility | Chrome, Edge, Firefox, Safari (latest 2 versions) |
| Accessibility | WCAG 2.1 Level AA compliance |
| Scalability | Support 1000+ catalog items |

---

## 7. Future Enhancements

- Azure AD authentication for production
- Email notifications for review assignments
- Bulk edit capabilities
- Export to Excel functionality
- Integration with ServiceNow CMDB
- Automated quarterly review reminders
- Role-based access control (admin, reviewer, viewer)

---

## 8. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Tech Architecture | Initial document |
