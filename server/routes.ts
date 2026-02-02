import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import multer from "multer";
import * as XLSX from "xlsx";
import nodemailer from "nodemailer";

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Users for Team Leader selection
  app.get('/api/users', isAuthenticated, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get('/api/users/search', isAuthenticated, async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.json([]);
    const users = await storage.searchUsers(query);
    res.json(users);
  });

  // Catalog
  app.get(api.catalog.list.path, isAuthenticated, async (req, res) => {
    const filters = {
        status: req.query.status as string,
        categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
        search: req.query.search as string
    };
    const items = await storage.getCatalogItems(filters);
    res.json(items);
  });

  app.get(api.catalog.get.path, isAuthenticated, async (req, res) => {
    const item = await storage.getCatalogItem(Number(req.params.id));
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  });

  app.post(api.catalog.create.path, isAuthenticated, async (req, res) => {
    try {
        const input = api.catalog.create.input.parse(req.body);
        const item = await storage.createCatalogItem(input);
        res.status(201).json(item);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.catalog.update.path, isAuthenticated, async (req, res) => {
    try {
        const input = api.catalog.update.input.parse(req.body);
        const item = await storage.updateCatalogItem(Number(req.params.id), input);
        res.json(item);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.catalog.delete.path, isAuthenticated, async (req, res) => {
    try {
        await storage.deleteCatalogItem(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Categories
  app.get(api.categories.list.path, isAuthenticated, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.put(api.categories.update.path, isAuthenticated, async (req, res) => {
     try {
        console.log("Received body:", JSON.stringify(req.body));
        // Handle null teamLeaderId (when "none" is selected)
        const body = { ...req.body };
        if (body.teamLeaderId === null || body.teamLeaderId === "none") {
          body.teamLeaderId = null;
        }
        console.log("After processing:", JSON.stringify(body));
        const input = api.categories.update.input.parse(body);
        console.log("Parsed input:", JSON.stringify(input));
        const category = await storage.updateCategory(Number(req.params.id), input);
        res.json(category);
     } catch (err) {
         console.error("Error updating category:", err);
         res.status(500).json({ message: "Internal Error" });
     }
  });

  // Reviews
  app.post(api.reviews.create.path, isAuthenticated, async (req, res) => {
      try {
          const input = api.reviews.create.input.parse(req.body);
          const reviewWithUser = { ...input, reviewerId: (req.user as any).claims.sub };
          const review = await storage.createReview(reviewWithUser);
          res.status(201).json(review);
      } catch (err) {
          res.status(500).json({ message: "Internal Error" });
      }
  });

  // Import - Parse Excel file
  app.post(api.import.parse.path, isAuthenticated, upload.single('file'), async (req, res) => {
      if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
      }

      try {
          const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          // Map SharePoint columns to our schema
          const parsedItems = jsonData.map((row) => {
              const name = row['Technology Name'] || row['Name'] || row['name'] || row['Technology'] || row['Title'] || "";
              
              // Convert Excel date serial number to ISO string if present
              let lastCatalogUpdate: string | undefined;
              if (row['Last Catalog Update']) {
                  if (typeof row['Last Catalog Update'] === 'number') {
                      const date = XLSX.SSF.parse_date_code(row['Last Catalog Update']);
                      lastCatalogUpdate = new Date(date.y, date.m - 1, date.d).toISOString();
                  } else {
                      lastCatalogUpdate = String(row['Last Catalog Update']);
                  }
              }

              return {
                  name,
                  description: row['Description'] || row['desc'] || "",
                  categoryName: row['Technology Domain'] || row['Category'] || row['category'] || "Uncategorized",
                  technologyDomain: row['Technology Domain'] || "",
                  technologySubcategories: row['Technology Subcategories'] || "",
                  serviceCategory: row['Service Category'] || "",
                  serviceComponent: row['Service Component'] || "",
                  vendorName: row['Vendor Name'] || "",
                  versionModel: row['Version / Model (Optional)'] || row['Version / Model'] || "",
                  deploymentModel: row['Deployment Model'] || "",
                  operationalLifecycle: row['Operational Lifecycle'] || "",
                  strategicDirection: row['Strategic Direction'] || "",
                  aiCapabilityType: row['AI Capability Type'] || "",
                  aiProviders: row['AI Providers'] || "",
                  canAiProviderBeSwitched: row['Can AI Provider Be Switched'] || "",
                  technologyCapability: row['Technology Capability (Reference Only)'] || row['Technology Capability'] || "",
                  governanceGroup: row['Governance Group'] || "",
                  standardsReviewer: row['Standards Reviewer'] || "",
                  standardApprover: row['Standard Approver'] || "",
                  businessReviewer: row['Business Reviewer (Optional)'] || row['Business Reviewer'] || "",
                  complianceAssetId: row['Compliance Asset Id'] || "",
                  source: row['Source'] || "",
                  lastCatalogUpdate,
                  comments: row['Comments'] || "",
                  owner: row['Owner'] || row['owner'] || row['Governance Group'] || "",
                  isValid: !!name,
                  validationError: !name ? "Technology Name is missing" : undefined
              };
          });

          res.json(parsedItems);
      } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Failed to parse file" });
      }
  });

  // Import - Commit parsed items to database
  app.post(api.import.commit.path, isAuthenticated, async (req, res) => {
      try {
          const { items } = req.body;
          let importedCount = 0;
          let categoryCount = 0;

          for (const item of items) {
              // Find or create category based on Technology Domain
              const categoryName = item.categoryName || item.technologyDomain || "Uncategorized";
              let category = await storage.getCategoryByName(categoryName);
              if (!category) {
                  category = await storage.createCategory({ name: categoryName, teamLeaderId: null });
                  categoryCount++;
              }

              // Create catalog item with all fields
              await storage.createCatalogItem({
                  name: item.name,
                  description: item.description,
                  categoryId: category.id,
                  status: 'draft',
                  technologyDomain: item.technologyDomain,
                  technologySubcategories: item.technologySubcategories,
                  serviceCategory: item.serviceCategory,
                  serviceComponent: item.serviceComponent,
                  vendorName: item.vendorName,
                  versionModel: item.versionModel,
                  deploymentModel: item.deploymentModel,
                  operationalLifecycle: item.operationalLifecycle,
                  strategicDirection: item.strategicDirection,
                  aiCapabilityType: item.aiCapabilityType,
                  aiProviders: item.aiProviders,
                  canAiProviderBeSwitched: item.canAiProviderBeSwitched,
                  technologyCapability: item.technologyCapability,
                  governanceGroup: item.governanceGroup,
                  standardsReviewer: item.standardsReviewer,
                  standardApprover: item.standardApprover,
                  businessReviewer: item.businessReviewer,
                  complianceAssetId: item.complianceAssetId,
                  source: item.source,
                  lastCatalogUpdate: item.lastCatalogUpdate ? new Date(item.lastCatalogUpdate) : null,
                  comments: item.comments,
                  owner: item.owner,
              });
              importedCount++;
          }
          res.json({ importedCount, categoryCount });

      } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Failed to commit import" });
      }
  });

  // Review Cycles
  app.get('/api/review-cycles', isAuthenticated, async (req, res) => {
    const cycles = await storage.getReviewCycles();
    res.json(cycles);
  });

  app.get('/api/review-cycles/active', isAuthenticated, async (req, res) => {
    const cycle = await storage.getActiveReviewCycle();
    res.json(cycle || null);
  });

  app.get('/api/review-cycles/:id', isAuthenticated, async (req, res) => {
    const cycle = await storage.getReviewCycle(Number(req.params.id));
    if (!cycle) {
      return res.status(404).json({ message: "Cycle not found" });
    }
    res.json(cycle);
  });

  app.post('/api/review-cycles', isAuthenticated, async (req, res) => {
    try {
      const { name, quarter, year, startDate, endDate } = req.body;
      
      const activeCycle = await storage.getActiveReviewCycle();
      if (activeCycle) {
        return res.status(400).json({ message: "There is already an active review cycle. Complete it first." });
      }

      const cycle = await storage.createReviewCycle({
        name,
        quarter,
        year,
        status: 'active',
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });

      const categories = await storage.getCategories();
      for (const category of categories) {
        const itemCount = await storage.getItemCountByCategory(category.id);
        await storage.createCategoryProgress({
          cycleId: cycle.id,
          categoryId: category.id,
          teamLeaderId: category.teamLeaderId,
          totalItems: itemCount,
          reviewedItems: 0,
          approvedItems: 0,
          status: 'not_started'
        });

        if (itemCount > 0) {
          await storage.setItemsToStatus(category.id, 'pending_review');
        }
      }

      res.status(201).json(cycle);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create review cycle" });
    }
  });

  app.post('/api/review-cycles/:id/send-reminders', isAuthenticated, async (req, res) => {
    try {
      const cycleId = Number(req.params.id);
      const cycle = await storage.getReviewCycle(cycleId);
      
      if (!cycle) {
        return res.status(404).json({ message: "Cycle not found" });
      }

      const progress = await storage.getProgressByCycle(cycleId);
      const emailsSent: string[] = [];
      const emailsFailed: string[] = [];

      for (const p of progress) {
        if (p.teamLeader?.email && p.totalItems && p.totalItems > 0) {
          try {
            if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
              await emailTransporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: p.teamLeader.email,
                subject: `Quarterly Review Reminder: ${cycle.name}`,
                html: `
                  <h2>Quarterly Technology Catalog Review</h2>
                  <p>Hello ${p.teamLeader.firstName || 'Team Leader'},</p>
                  <p>The ${cycle.quarter} ${cycle.year} quarterly review cycle has started.</p>
                  <p>You have <strong>${p.totalItems} items</strong> in the <strong>${p.category?.name}</strong> category to review.</p>
                  <p>Please complete your review by ${new Date(cycle.endDate).toLocaleDateString()}.</p>
                  <p>Login to the Technology Catalog to begin your review.</p>
                  <p>Thank you!</p>
                `
              });
              emailsSent.push(p.teamLeader.email);
            } else {
              emailsSent.push(`(mock) ${p.teamLeader.email}`);
            }
          } catch (emailError) {
            console.error(`Failed to send email to ${p.teamLeader.email}:`, emailError);
            emailsFailed.push(p.teamLeader.email);
          }
        }
      }

      await storage.updateReviewCycle(cycleId, { remindersSent: true });

      res.json({ 
        message: "Reminders sent", 
        sent: emailsSent.length, 
        failed: emailsFailed.length,
        emails: emailsSent
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send reminders" });
    }
  });

  app.post('/api/review-cycles/:id/complete', isAuthenticated, async (req, res) => {
    try {
      const cycleId = Number(req.params.id);
      const cycle = await storage.updateReviewCycle(cycleId, { 
        status: 'completed', 
        completedAt: new Date() 
      });
      res.json(cycle);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete cycle" });
    }
  });

  // Team Leader Dashboard - My Progress
  app.get('/api/my-reviews', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const progress = await storage.getProgressByTeamLeader(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Update category progress (when team leader completes review)
  app.put('/api/category-progress/:id', isAuthenticated, async (req, res) => {
    try {
      const progressId = Number(req.params.id);
      const userId = (req.user as any).claims.sub;
      const { status, reviewedItems, approvedItems } = req.body;
      
      // Verify the user is the team leader for this category progress
      const allProgress = await storage.getProgressByTeamLeader(userId);
      const userProgress = allProgress.find(p => p.id === progressId);
      
      if (!userProgress) {
        return res.status(403).json({ message: "You are not authorized to update this progress" });
      }
      
      const updates: any = { status };
      if (reviewedItems !== undefined) updates.reviewedItems = reviewedItems;
      if (approvedItems !== undefined) updates.approvedItems = approvedItems;
      if (status === 'completed') updates.completedAt = new Date();
      
      // Update catalog item statuses based on progress status change
      if (userProgress.categoryId) {
        if (status === 'in_progress') {
          // Team leader started review - set items to in_review
          await storage.setItemsToStatus(userProgress.categoryId, 'in_review');
        } else if (status === 'completed') {
          // Team leader completed review - set items to approved
          await storage.setItemsToStatus(userProgress.categoryId, 'approved');
        }
      }
      
      const progress = await storage.updateCategoryProgress(progressId, updates);
      res.json(progress);
    } catch (error) {
      console.error("Error updating category progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Get items for team leader's category in current cycle
  app.get('/api/my-category-items/:categoryId', isAuthenticated, async (req, res) => {
    try {
      const categoryId = Number(req.params.categoryId);
      const items = await storage.getCatalogItems({ categoryId });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Mark individual item as reviewed by team leader
  app.put('/api/catalog/:id/review', isAuthenticated, async (req, res) => {
    try {
      const itemId = Number(req.params.id);
      const userId = (req.user as any).claims.sub;
      const { verdict, comments } = req.body;
      
      // Get the item to find its category
      const item = await storage.getCatalogItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Verify the user is the team leader for this category
      const userProgress = await storage.getProgressByTeamLeader(userId);
      const categoryProgress = userProgress.find(p => p.categoryId === item.categoryId && p.cycle?.status === 'active');
      
      if (!categoryProgress) {
        return res.status(403).json({ message: "You are not authorized to review this item" });
      }
      
      // Create a review record
      const review = await storage.createReview({
        catalogItemId: itemId,
        cycleId: categoryProgress.cycleId,
        reviewerId: userId,
        verdict: verdict || 'approved',
        comments: comments || ''
      });
      
      // Update item status to reviewed
      const updatedItem = await storage.updateCatalogItem(itemId, { status: 'reviewed' });
      
      // Update progress count
      const currentReviewedCount = categoryProgress.reviewedItems || 0;
      await storage.updateCategoryProgress(categoryProgress.id, {
        reviewedItems: currentReviewedCount + 1
      });
      
      res.json({ item: updatedItem, review });
    } catch (error) {
      console.error("Error reviewing item:", error);
      res.status(500).json({ message: "Failed to review item" });
    }
  });

  // Approve all reviewed items in a category (team leader action)
  app.post('/api/category-progress/:id/approve-all', isAuthenticated, async (req, res) => {
    try {
      const progressId = Number(req.params.id);
      const userId = (req.user as any).claims.sub;
      
      // Verify the user is the team leader for this progress
      const allProgress = await storage.getProgressByTeamLeader(userId);
      const userProgress = allProgress.find(p => p.id === progressId);
      
      if (!userProgress) {
        return res.status(403).json({ message: "You are not authorized to approve these items" });
      }
      
      if (!userProgress.categoryId) {
        return res.status(400).json({ message: "No category associated with this progress" });
      }
      
      // Set all items in category to approved
      await storage.setItemsToStatus(userProgress.categoryId, 'approved');
      
      // Update progress to completed
      const progress = await storage.updateCategoryProgress(progressId, {
        status: 'completed',
        completedAt: new Date(),
        approvedItems: userProgress.totalItems
      });
      
      res.json(progress);
    } catch (error) {
      console.error("Error approving all items:", error);
      res.status(500).json({ message: "Failed to approve items" });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
    const cats = await storage.getCategories();
    if (cats.length === 0) {
        const catCloud = await storage.createCategory({ name: "Cloud & Infrastructure", teamLeaderId: null });
        const catDev = await storage.createCategory({ name: "Development Tools", teamLeaderId: null });
        
        await storage.createCatalogItem({
            name: "Azure Kubernetes Service",
            description: "Managed Kubernetes service for container orchestration",
            categoryId: catCloud.id,
            status: "approved",
            owner: "IT Ops",
            vendorName: "Microsoft",
            deploymentModel: "Cloud",
            operationalLifecycle: "Standard (Current)",
            strategicDirection: "Invest",
            technologyDomain: "Cloud & Infrastructure",
            serviceCategory: "Container Services"
        });

        await storage.createCatalogItem({
            name: "Visual Studio Code",
            description: "Source code editor with integrated development environment features",
            categoryId: catDev.id,
            status: "approved",
            owner: "DevRel",
            vendorName: "Microsoft",
            deploymentModel: "On-Prem",
            operationalLifecycle: "Standard (Current)",
            strategicDirection: "Invest",
            technologyDomain: "Development Tools"
        });
    }
}
