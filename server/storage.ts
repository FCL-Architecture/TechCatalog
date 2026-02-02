import { db } from "./db";
import {
  users, categories, catalogItems, reviews, reviewCycles, categoryReviewProgress,
  type InsertUser, type User, type UpsertUser,
  type Category, type InsertCategory,
  type CatalogItem, type InsertCatalogItem,
  type Review, type InsertReview,
  type ReviewCycle, type InsertReviewCycle,
  type CategoryReviewProgress, type InsertCategoryReviewProgress,
  type UpdateItemRequest, type UpdateCategoryRequest
} from "@shared/schema";
import { eq, ilike, or, desc, and as sql_and_drizzle } from "drizzle-orm";

export interface IStorage {
  // Auth (from replit auth integration expectations)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getCategories(): Promise<(Category & { teamLeader: User | null })[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: UpdateCategoryRequest): Promise<Category>;

  // Catalog Items
  getCatalogItems(filters?: { status?: string, categoryId?: number, search?: string }): Promise<(CatalogItem & { category: Category | null })[]>;
  getCatalogItem(id: number): Promise<(CatalogItem & { category: Category | null, reviews: (Review & { reviewer: User })[] }) | undefined>;
  createCatalogItem(item: InsertCatalogItem): Promise<CatalogItem>;
  updateCatalogItem(id: number, updates: UpdateItemRequest): Promise<CatalogItem>;
  deleteCatalogItem(id: number): Promise<void>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByItemId(itemId: number): Promise<Review[]>;

  // Review Cycles
  getReviewCycles(): Promise<ReviewCycle[]>;
  getReviewCycle(id: number): Promise<(ReviewCycle & { progress: (CategoryReviewProgress & { category: Category | null, teamLeader: User | null })[] }) | undefined>;
  getActiveReviewCycle(): Promise<ReviewCycle | undefined>;
  createReviewCycle(cycle: InsertReviewCycle): Promise<ReviewCycle>;
  updateReviewCycle(id: number, updates: Partial<ReviewCycle>): Promise<ReviewCycle>;
  
  // Category Review Progress
  getCategoryProgress(cycleId: number, categoryId: number): Promise<CategoryReviewProgress | undefined>;
  getProgressByCycle(cycleId: number): Promise<(CategoryReviewProgress & { category: Category | null, teamLeader: User | null })[]>;
  getProgressByTeamLeader(teamLeaderId: string): Promise<(CategoryReviewProgress & { category: Category | null, cycle: ReviewCycle | null })[]>;
  createCategoryProgress(progress: InsertCategoryReviewProgress): Promise<CategoryReviewProgress>;
  updateCategoryProgress(id: number, updates: Partial<CategoryReviewProgress>): Promise<CategoryReviewProgress>;
  
  // Bulk operations for cycles
  setItemsToStatus(categoryId: number, status: string): Promise<void>;
  getItemCountByCategory(categoryId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: { ...userData, updatedAt: new Date() },
      })
      .returning();
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
      if (!query) return [];
      return await db.select().from(users)
        .where(or(
            ilike(users.firstName, `%${query}%`),
            ilike(users.lastName, `%${query}%`),
            ilike(users.email, `%${query}%`)
        ))
        .limit(10);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.email);
  }

  // Categories
  async getCategories(): Promise<(Category & { teamLeader: User | null })[]> {
    const rows = await db.query.categories.findMany({
      with: {
        teamLeader: true
      },
      orderBy: desc(categories.id)
    });
    return rows;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return await db.query.categories.findFirst({
      where: eq(categories.id, id)
    });
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return await db.query.categories.findFirst({
        where: ilike(categories.name, name)
    });
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: UpdateCategoryRequest): Promise<Category> {
    const [updated] = await db.update(categories)
        .set(updates)
        .where(eq(categories.id, id))
        .returning();
    return updated;
  }

  // Catalog Items
  async getCatalogItems(filters?: { status?: string, categoryId?: number, search?: string }): Promise<(CatalogItem & { category: Category | null })[]> {
    // Note: Drizzle's query builder with conditionals is a bit verbose, simplified for now
    // For complex filtering, the raw SQL or query builder chain is better.
    // Using simple client-side filtering logic for MVP or specific where clauses
    
    // Constructing conditions
    const conditions = [];
    if (filters?.status) conditions.push(eq(catalogItems.status, filters.status as any));
    if (filters?.categoryId) conditions.push(eq(catalogItems.categoryId, filters.categoryId));
    if (filters?.search) conditions.push(ilike(catalogItems.name, `%${filters.search}%`));

    // Combine with AND
    const whereClause = conditions.length > 0 ? 
        (conditions.length === 1 ? conditions[0] : sql_and(conditions)) 
        : undefined;

    return await db.query.catalogItems.findMany({
        where: whereClause,
        with: {
            category: true
        },
        orderBy: desc(catalogItems.createdAt)
    });
  }

  async getCatalogItem(id: number): Promise<(CatalogItem & { category: Category | null, reviews: (Review & { reviewer: User })[] }) | undefined> {
    return await db.query.catalogItems.findFirst({
        where: eq(catalogItems.id, id),
        with: {
            category: true,
            reviews: {
                with: {
                    reviewer: true
                },
                orderBy: desc(reviews.createdAt)
            }
        }
    });
  }

  async createCatalogItem(item: InsertCatalogItem): Promise<CatalogItem> {
    const [newItem] = await db.insert(catalogItems).values(item).returning();
    return newItem;
  }

  async updateCatalogItem(id: number, updates: UpdateItemRequest): Promise<CatalogItem> {
    const [updated] = await db.update(catalogItems)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(catalogItems.id, id))
        .returning();
    return updated;
  }

  async deleteCatalogItem(id: number): Promise<void> {
    await db.delete(catalogItems).where(eq(catalogItems.id, id));
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
      // Create review
      const [newReview] = await db.insert(reviews).values(review).returning();
      
      // Update item status based on verdict
      const status = review.verdict === 'approved' ? 'approved' : 'rejected';
      await this.updateCatalogItem(review.catalogItemId, { status });
      
      return newReview;
  }

  async getReviewsByItemId(itemId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.catalogItemId, itemId));
  }

  // Review Cycles
  async getReviewCycles(): Promise<ReviewCycle[]> {
    return await db.query.reviewCycles.findMany({
      orderBy: desc(reviewCycles.createdAt)
    });
  }

  async getReviewCycle(id: number): Promise<(ReviewCycle & { progress: (CategoryReviewProgress & { category: Category | null, teamLeader: User | null })[] }) | undefined> {
    return await db.query.reviewCycles.findFirst({
      where: eq(reviewCycles.id, id),
      with: {
        progress: {
          with: {
            category: true,
            teamLeader: true
          }
        }
      }
    });
  }

  async getActiveReviewCycle(): Promise<ReviewCycle | undefined> {
    return await db.query.reviewCycles.findFirst({
      where: eq(reviewCycles.status, 'active')
    });
  }

  async createReviewCycle(cycle: InsertReviewCycle): Promise<ReviewCycle> {
    const [newCycle] = await db.insert(reviewCycles).values(cycle).returning();
    return newCycle;
  }

  async updateReviewCycle(id: number, updates: Partial<ReviewCycle>): Promise<ReviewCycle> {
    const [updated] = await db.update(reviewCycles)
      .set(updates)
      .where(eq(reviewCycles.id, id))
      .returning();
    return updated;
  }

  // Category Review Progress
  async getCategoryProgress(cycleId: number, categoryId: number): Promise<CategoryReviewProgress | undefined> {
    return await db.query.categoryReviewProgress.findFirst({
      where: sql_and_drizzle(
        eq(categoryReviewProgress.cycleId, cycleId),
        eq(categoryReviewProgress.categoryId, categoryId)
      )
    });
  }

  async getProgressByCycle(cycleId: number): Promise<(CategoryReviewProgress & { category: Category | null, teamLeader: User | null })[]> {
    return await db.query.categoryReviewProgress.findMany({
      where: eq(categoryReviewProgress.cycleId, cycleId),
      with: {
        category: true,
        teamLeader: true
      }
    });
  }

  async getProgressByTeamLeader(teamLeaderId: string): Promise<(CategoryReviewProgress & { category: Category | null, cycle: ReviewCycle | null })[]> {
    return await db.query.categoryReviewProgress.findMany({
      where: eq(categoryReviewProgress.teamLeaderId, teamLeaderId),
      with: {
        category: true,
        cycle: true
      }
    });
  }

  async createCategoryProgress(progress: InsertCategoryReviewProgress): Promise<CategoryReviewProgress> {
    const [newProgress] = await db.insert(categoryReviewProgress).values(progress).returning();
    return newProgress;
  }

  async updateCategoryProgress(id: number, updates: Partial<CategoryReviewProgress>): Promise<CategoryReviewProgress> {
    const [updated] = await db.update(categoryReviewProgress)
      .set(updates)
      .where(eq(categoryReviewProgress.id, id))
      .returning();
    return updated;
  }

  // Bulk operations for cycles
  async setItemsToStatus(categoryId: number, status: string): Promise<void> {
    await db.update(catalogItems)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(catalogItems.categoryId, categoryId));
  }

  async getItemCountByCategory(categoryId: number): Promise<number> {
    const items = await db.select().from(catalogItems).where(eq(catalogItems.categoryId, categoryId));
    return items.length;
  }
}

function sql_and(conditions: any[]) {
    return sql_and_drizzle(...conditions);
}

// Export singleton
export const storage = new DatabaseStorage();
// Export authStorage for the auth module
export const authStorage = storage;
