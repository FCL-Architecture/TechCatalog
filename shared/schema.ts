import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";
import { users } from "./models/auth";

// Enums
export const statusEnum = pgEnum("status", ["draft", "pending_review", "in_review", "reviewed", "approved", "rejected", "archived"]);
export const verdictEnum = pgEnum("verdict", ["approved", "rejected"]);
export const cycleStatusEnum = pgEnum("cycle_status", ["active", "completed", "cancelled"]);
export const deploymentModelEnum = pgEnum("deployment_model", ["On-Prem", "Cloud", "Hybrid", "SaaS"]);
export const lifecycleEnum = pgEnum("lifecycle", ["Standard (Current)", "Emerging", "Retiring", "Retired", "Exception"]);
export const strategicDirectionEnum = pgEnum("strategic_direction", ["Invest", "Maintain", "Migrate", "Retire"]);

// Tables
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  teamLeaderId: varchar("team_leader_id").references(() => users.id),
});

export const catalogItems = pgTable("catalog_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  status: statusEnum("status").default("draft").notNull(),
  
  // SharePoint fields
  technologyDomain: text("technology_domain"),
  technologySubcategories: text("technology_subcategories"),
  serviceCategory: text("service_category"),
  serviceComponent: text("service_component"),
  vendorName: text("vendor_name"),
  versionModel: text("version_model"),
  deploymentModel: text("deployment_model"),
  operationalLifecycle: text("operational_lifecycle"),
  strategicDirection: text("strategic_direction"),
  aiCapabilityType: text("ai_capability_type"),
  aiProviders: text("ai_providers"),
  canAiProviderBeSwitched: text("can_ai_provider_be_switched"),
  technologyCapability: text("technology_capability"),
  governanceGroup: text("governance_group"),
  standardsReviewer: text("standards_reviewer"),
  standardApprover: text("standard_approver"),
  businessReviewer: text("business_reviewer"),
  complianceAssetId: text("compliance_asset_id"),
  source: text("source"),
  lastCatalogUpdate: timestamp("last_catalog_update"),
  comments: text("comments"),
  
  owner: text("owner"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  catalogItemId: integer("catalog_item_id").references(() => catalogItems.id).notNull(),
  cycleId: integer("cycle_id").references(() => reviewCycles.id),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  comments: text("comments"),
  verdict: verdictEnum("verdict").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewCycles = pgTable("review_cycles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quarter: text("quarter").notNull(),
  year: integer("year").notNull(),
  status: cycleStatusEnum("status").default("active").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  remindersSent: boolean("reminders_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const categoryReviewProgress = pgTable("category_review_progress", {
  id: serial("id").primaryKey(),
  cycleId: integer("cycle_id").references(() => reviewCycles.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  teamLeaderId: varchar("team_leader_id").references(() => users.id),
  totalItems: integer("total_items").default(0),
  reviewedItems: integer("reviewed_items").default(0),
  approvedItems: integer("approved_items").default(0),
  status: text("progress_status").default("not_started"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  teamLeader: one(users, {
    fields: [categories.teamLeaderId],
    references: [users.id],
  }),
  items: many(catalogItems),
}));

export const catalogItemsRelations = relations(catalogItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [catalogItems.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  item: one(catalogItems, {
    fields: [reviews.catalogItemId],
    references: [catalogItems.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export const reviewCyclesRelations = relations(reviewCycles, ({ many }) => ({
  progress: many(categoryReviewProgress),
}));

export const categoryReviewProgressRelations = relations(categoryReviewProgress, ({ one }) => ({
  cycle: one(reviewCycles, {
    fields: [categoryReviewProgress.cycleId],
    references: [reviewCycles.id],
  }),
  category: one(categories, {
    fields: [categoryReviewProgress.categoryId],
    references: [categories.id],
  }),
  teamLeader: one(users, {
    fields: [categoryReviewProgress.teamLeaderId],
    references: [users.id],
  }),
}));

// Schemas
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertCatalogItemSchema = createInsertSchema(catalogItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertReviewCycleSchema = createInsertSchema(reviewCycles).omit({ id: true, createdAt: true, completedAt: true, remindersSent: true });
export const insertCategoryReviewProgressSchema = createInsertSchema(categoryReviewProgress).omit({ id: true, createdAt: true, completedAt: true });

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type CatalogItem = typeof catalogItems.$inferSelect;
export type InsertCatalogItem = z.infer<typeof insertCatalogItemSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ReviewCycle = typeof reviewCycles.$inferSelect;
export type InsertReviewCycle = z.infer<typeof insertReviewCycleSchema>;
export type CategoryReviewProgress = typeof categoryReviewProgress.$inferSelect;
export type InsertCategoryReviewProgress = z.infer<typeof insertCategoryReviewProgressSchema>;

// API Types
export type CreateItemRequest = InsertCatalogItem;
export type UpdateItemRequest = Partial<InsertCatalogItem>;
export type CreateReviewRequest = InsertReview;
export type UpdateCategoryRequest = Partial<InsertCategory>;

// Extended types for UI
export type CatalogItemWithCategory = CatalogItem & { category: Category | null };
export type CategoryWithLeader = Category & { teamLeader: typeof users.$inferSelect | null };
export type ReviewCycleWithProgress = ReviewCycle & { progress: (CategoryReviewProgress & { category: Category | null, teamLeader: typeof users.$inferSelect | null })[] };
export type CategoryProgressWithDetails = CategoryReviewProgress & { category: Category | null, teamLeader: typeof users.$inferSelect | null };
