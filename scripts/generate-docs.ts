import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import * as fs from 'fs';

async function generateBRD() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Business Requirements Document (BRD)",
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          text: "Technology Standards Catalog Review & Approval System",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Version: ", bold: true }), new TextRun("1.0"),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Date: ", bold: true }), new TextRun("January 2026"),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Author: ", bold: true }), new TextRun("Technology Architecture Team"),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Classification: ", bold: true }), new TextRun("Internal Use"),
          ]
        }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "1. Executive Summary", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({
          text: "The Technology Standards Catalog Review & Approval System is a full-stack web application designed to replace the existing SharePoint-based technology catalog management process. The system provides a centralized platform for managing, reviewing, and approving technology standards across the organization, with proper governance workflows and role-based access."
        }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2. Business Objectives", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "2.1 Primary Objectives", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Centralize Technology Management: Consolidate technology catalog data from SharePoint into a single, authoritative Azure SQL database", bullet: { level: 0 } }),
        new Paragraph({ text: "Streamline Review Process: Implement quarterly review workflows with automatic routing to appropriate team leaders", bullet: { level: 0 } }),
        new Paragraph({ text: "Improve Data Quality: Enforce standardized data entry with dropdown selections based on organizational guidance", bullet: { level: 0 } }),
        new Paragraph({ text: "Enable Governance: Provide clear audit trails and approval workflows for technology standards", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2.2 Success Metrics", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "100% migration of existing SharePoint catalog data", bullet: { level: 0 } }),
        new Paragraph({ text: "Reduction in catalog update cycle time by 50%", bullet: { level: 0 } }),
        new Paragraph({ text: "Improved data consistency through standardized dropdown fields", bullet: { level: 0 } }),
        new Paragraph({ text: "Complete audit trail for all technology approval decisions", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "3. Business Problem Statement", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "Current State", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Technology catalog is maintained in SharePoint Excel exports", bullet: { level: 0 } }),
        new Paragraph({ text: "No standardized review and approval workflow", bullet: { level: 0 } }),
        new Paragraph({ text: "Inconsistent data entry (free text vs. standardized values)", bullet: { level: 0 } }),
        new Paragraph({ text: "Manual coordination required between governance teams", bullet: { level: 0 } }),
        new Paragraph({ text: "Limited visibility into technology lifecycle and strategic direction", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "Future State", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Web-based application with Azure SQL as single source of truth", bullet: { level: 0 } }),
        new Paragraph({ text: "Automated routing of reviews to category team leaders", bullet: { level: 0 } }),
        new Paragraph({ text: "Dropdown-based data entry aligned with FCL Technology Catalog Guidance", bullet: { level: 0 } }),
        new Paragraph({ text: "Dashboard visibility into technology portfolio status", bullet: { level: 0 } }),
        new Paragraph({ text: "Complete review history and audit trail", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "4. Stakeholders", heading: HeadingLevel.HEADING_1 }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Stakeholder", children: [new TextRun({ text: "Stakeholder", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Role", children: [new TextRun({ text: "Role", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Interest", children: [new TextRun({ text: "Interest", bold: true })] })] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Enterprise Architecture")] }),
                new TableCell({ children: [new Paragraph("System Owner")] }),
                new TableCell({ children: [new Paragraph("Overall governance and catalog accuracy")] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Technology Architecture Team")] }),
                new TableCell({ children: [new Paragraph("Primary Users")] }),
                new TableCell({ children: [new Paragraph("Day-to-day catalog management")] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Governance Teams")] }),
                new TableCell({ children: [new Paragraph("Reviewers")] }),
                new TableCell({ children: [new Paragraph("Review and approve technology standards")] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("IT Leadership")] }),
                new TableCell({ children: [new Paragraph("Executive Sponsor")] }),
                new TableCell({ children: [new Paragraph("Strategic oversight of technology portfolio")] }),
              ]
            }),
          ]
        }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "5. Business Requirements", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "BR-001: One-Time Data Migration", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun({ text: "Priority: ", bold: true }), new TextRun("Critical")] }),
        new Paragraph({ text: "The system must support a one-time migration from SharePoint Excel exports to Azure SQL. After migration, Azure SQL becomes the single source of truth." }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "BR-002: Category-Based Team Leader Mapping", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun({ text: "Priority: ", bold: true }), new TextRun("High")] }),
        new Paragraph({ text: "Each technology domain/category must be assignable to a Team Leader who is responsible for quarterly reviews of items in that category." }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "BR-003: Quarterly Review Workflow", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun({ text: "Priority: ", bold: true }), new TextRun("High")] }),
        new Paragraph({ text: "Technology items must support a review workflow where items can be submitted for review, approved, or rejected with comments." }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "BR-004: Standardized Data Entry", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun({ text: "Priority: ", bold: true }), new TextRun("High")] }),
        new Paragraph({ text: "Key classification fields must use dropdown selections based on the FCL Technology Catalog Guidance document to ensure data consistency." }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "BR-005: Technology Portfolio Visibility", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun({ text: "Priority: ", bold: true }), new TextRun("Medium")] }),
        new Paragraph({ text: "Dashboard must provide at-a-glance visibility into technology portfolio status including counts by status, lifecycle, and strategic direction." }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "BR-006: Authentication & Authorization", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun({ text: "Priority: ", bold: true }), new TextRun("Critical")] }),
        new Paragraph({ text: "Users must authenticate via Replit Auth (development) with planned Azure AD integration for production deployment." }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "6. Scope", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "In Scope", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Technology catalog item management (CRUD operations)", bullet: { level: 0 } }),
        new Paragraph({ text: "Category/Domain management with team leader assignment", bullet: { level: 0 } }),
        new Paragraph({ text: "Review and approval workflow", bullet: { level: 0 } }),
        new Paragraph({ text: "Excel file import for initial migration", bullet: { level: 0 } }),
        new Paragraph({ text: "User authentication", bullet: { level: 0 } }),
        new Paragraph({ text: "Dashboard with portfolio metrics", bullet: { level: 0 } }),
        new Paragraph({ text: "All 25+ fields from SharePoint schema", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "Out of Scope", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Integration with external CMDB systems", bullet: { level: 0 } }),
        new Paragraph({ text: "Automated vendor notifications", bullet: { level: 0 } }),
        new Paragraph({ text: "Mobile application", bullet: { level: 0 } }),
        new Paragraph({ text: "Multi-language support", bullet: { level: 0 } }),
        new Paragraph({ text: "Production Azure deployment (future phase)", bullet: { level: 0 } }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('docs/BRD_Technology_Catalog.docx', buffer);
  console.log('BRD document created: docs/BRD_Technology_Catalog.docx');
}

async function generatePRD() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Product Requirements Document (PRD)",
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          text: "Technology Standards Catalog Review & Approval System",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Version: ", bold: true }), new TextRun("1.0"),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Date: ", bold: true }), new TextRun("January 2026"),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Author: ", bold: true }), new TextRun("Technology Architecture Team"),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Status: ", bold: true }), new TextRun("In Development"),
          ]
        }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "1. Product Overview", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "1.1 Purpose", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "A full-stack web application for managing the organization's technology standards catalog. The system enables technology governance teams to maintain, review, and approve technology items with proper workflow controls and audit trails." }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "1.2 Target Users", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Enterprise Architects", bullet: { level: 0 } }),
        new Paragraph({ text: "Technology Architecture Team members", bullet: { level: 0 } }),
        new Paragraph({ text: "Governance Team Leaders", bullet: { level: 0 } }),
        new Paragraph({ text: "Standards Reviewers and Approvers", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "1.3 Technology Stack", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Frontend: React 18 with TypeScript, TanStack Query, Tailwind CSS, shadcn/ui", bullet: { level: 0 } }),
        new Paragraph({ text: "Backend: Express.js with TypeScript", bullet: { level: 0 } }),
        new Paragraph({ text: "Database: PostgreSQL (development) / Azure SQL (production) via Drizzle ORM", bullet: { level: 0 } }),
        new Paragraph({ text: "Authentication: Replit Auth (OIDC-based)", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2. Features & Requirements", heading: HeadingLevel.HEADING_1 }),

        new Paragraph({ text: "2.1 User Authentication (F-001) - Priority: P0", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "FR-001.1: Users can sign in via Replit Auth", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-001.2: User profile stored with email, name, and profile image", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-001.3: Session management with secure cookies", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-001.4: Unauthenticated users redirected to landing page", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2.2 Dashboard (F-002) - Priority: P1", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "FR-002.1: Display total count of catalog items", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-002.2: Show count of items pending review", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-002.3: Show count of approved items", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-002.4: Display count of categories/domains", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-002.5: Quick navigation to catalog, categories, and import", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2.3 Catalog Management (F-003) - Priority: P0", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "FR-003.1: List all catalog items in a sortable table", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-003.2: Display key columns: Name, Domain, Vendor, Deployment, Lifecycle, Status", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-003.3: Filter items by status (draft, review, approved, rejected)", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-003.4: Filter items by category", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-003.5: Search items by name", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-003.6: Create new catalog items with all fields", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-003.7: View item details with all 25+ fields", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-003.8: Edit existing catalog items", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-003.9: Delete catalog items", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2.4 Catalog Item Fields (F-004) - Priority: P0", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "All fields from SharePoint schema must be supported:" }),
        new Paragraph({ text: "" }),

        new Paragraph({ children: [new TextRun({ text: "Basic Information:", bold: true })] }),
        new Paragraph({ text: "Technology Name (required, text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Description (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Category (dropdown, linked to categories table)", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ children: [new TextRun({ text: "Classification:", bold: true })] }),
        new Paragraph({ text: "Technology Domain (dropdown - 11 options per guidance)", bullet: { level: 0 } }),
        new Paragraph({ text: "Technology Subcategories (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Service Category (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Service Component (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ children: [new TextRun({ text: "Technology Details:", bold: true })] }),
        new Paragraph({ text: "Vendor Name (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Version / Model (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Deployment Model (dropdown: On-Prem, Cloud, Hybrid, SaaS)", bullet: { level: 0 } }),
        new Paragraph({ text: "Operational Lifecycle (dropdown: Evaluate, Introduce, Standard, Maintain, Contain, Retire)", bullet: { level: 0 } }),
        new Paragraph({ text: "Strategic Direction TIME (dropdown: Tolerate, Invest, Migrate, Eliminate)", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ children: [new TextRun({ text: "AI Capabilities:", bold: true })] }),
        new Paragraph({ text: "AI Capability Type (dropdown: No AI, Native AI, AI via API, AI Configurable, AI Embedded)", bullet: { level: 0 } }),
        new Paragraph({ text: "AI Providers (dropdown: OpenAI, Google Gemini, Microsoft Copilot, AWS Bedrock, IBM Watson, Custom, Other)", bullet: { level: 0 } }),
        new Paragraph({ text: "Can AI Provider Be Switched (dropdown: Yes, No)", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ children: [new TextRun({ text: "Governance:", bold: true })] }),
        new Paragraph({ text: "Governance Group (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Standards Reviewer (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Standard Approver (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Business Reviewer (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Owner (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "Compliance Asset ID (text)", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2.5 Review Workflow (F-006) - Priority: P1", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "FR-006.1: Items created in 'draft' status", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-006.2: Owner can submit item for review (status: review)", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-006.3: Reviewers can approve or reject items", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-006.4: Review requires verdict and comments", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-006.5: Review history displayed on item detail page", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2.6 Data Import (F-007) - Priority: P0", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "FR-007.1: Upload Excel file (.xlsx, .xls)", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-007.2: Parse all 25 SharePoint columns", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-007.3: Display preview table before commit", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-007.4: Show validation status per row", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-007.5: Auto-create categories based on Technology Domain", bullet: { level: 0 } }),
        new Paragraph({ text: "FR-007.6: Commit imports to database", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "3. User Interface Design", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "3.1 Layout", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Sidebar navigation with links to all pages", bullet: { level: 0 } }),
        new Paragraph({ text: "Header with user profile and sign out", bullet: { level: 0 } }),
        new Paragraph({ text: "Main content area with responsive design", bullet: { level: 0 } }),
        new Paragraph({ text: "Support for light/dark mode", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "3.2 Pages", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "Landing (/) - Public page with sign-in button", bullet: { level: 0 } }),
        new Paragraph({ text: "Dashboard (/dashboard) - Portfolio metrics and quick actions", bullet: { level: 0 } }),
        new Paragraph({ text: "Catalog (/catalog) - List and manage all items", bullet: { level: 0 } }),
        new Paragraph({ text: "Item Detail (/catalog/:id) - View/edit single item", bullet: { level: 0 } }),
        new Paragraph({ text: "Categories (/categories) - Manage categories and team leaders", bullet: { level: 0 } }),
        new Paragraph({ text: "Import (/import) - Upload and commit Excel files", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "4. Non-Functional Requirements", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "Performance: Page load under 3 seconds", bullet: { level: 0 } }),
        new Paragraph({ text: "Availability: 99% uptime during business hours", bullet: { level: 0 } }),
        new Paragraph({ text: "Security: HTTPS, secure session cookies, input validation", bullet: { level: 0 } }),
        new Paragraph({ text: "Compatibility: Chrome, Edge, Firefox, Safari (latest 2 versions)", bullet: { level: 0 } }),
        new Paragraph({ text: "Accessibility: WCAG 2.1 Level AA compliance", bullet: { level: 0 } }),
        new Paragraph({ text: "Scalability: Support 1000+ catalog items", bullet: { level: 0 } }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "5. Future Enhancements", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "Azure AD authentication for production", bullet: { level: 0 } }),
        new Paragraph({ text: "Email notifications for review assignments", bullet: { level: 0 } }),
        new Paragraph({ text: "Bulk edit capabilities", bullet: { level: 0 } }),
        new Paragraph({ text: "Export to Excel functionality", bullet: { level: 0 } }),
        new Paragraph({ text: "Integration with ServiceNow CMDB", bullet: { level: 0 } }),
        new Paragraph({ text: "Automated quarterly review reminders", bullet: { level: 0 } }),
        new Paragraph({ text: "Role-based access control (admin, reviewer, viewer)", bullet: { level: 0 } }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('docs/PRD_Technology_Catalog.docx', buffer);
  console.log('PRD document created: docs/PRD_Technology_Catalog.docx');
}

async function main() {
  await generateBRD();
  await generatePRD();
  console.log('Done! Word documents generated in docs/ folder.');
}

main().catch(console.error);
