import { z } from 'zod';
import { insertCatalogItemSchema, insertCategorySchema, insertReviewSchema, catalogItems, categories, reviews, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Parsed import item schema - matches SharePoint columns
export const parsedImportItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  categoryName: z.string(),
  technologyDomain: z.string().optional(),
  technologySubcategories: z.string().optional(),
  serviceCategory: z.string().optional(),
  serviceComponent: z.string().optional(),
  vendorName: z.string().optional(),
  versionModel: z.string().optional(),
  deploymentModel: z.string().optional(),
  operationalLifecycle: z.string().optional(),
  strategicDirection: z.string().optional(),
  aiCapabilityType: z.string().optional(),
  aiProviders: z.string().optional(),
  canAiProviderBeSwitched: z.string().optional(),
  technologyCapability: z.string().optional(),
  governanceGroup: z.string().optional(),
  standardsReviewer: z.string().optional(),
  standardApprover: z.string().optional(),
  businessReviewer: z.string().optional(),
  complianceAssetId: z.string().optional(),
  source: z.string().optional(),
  lastCatalogUpdate: z.string().optional(),
  comments: z.string().optional(),
  owner: z.string().optional(),
  isValid: z.boolean(),
  validationError: z.string().optional()
});

export type ParsedImportItem = z.infer<typeof parsedImportItemSchema>;

export const api = {
  catalog: {
    list: {
      method: 'GET' as const,
      path: '/api/catalog',
      input: z.object({
        status: z.enum(["draft", "review", "approved", "rejected", "archived"]).optional(),
        categoryId: z.coerce.number().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof catalogItems.$inferSelect & { category: typeof categories.$inferSelect | null }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/catalog/:id',
      responses: {
        200: z.custom<typeof catalogItems.$inferSelect & { category: typeof categories.$inferSelect | null, reviews: (typeof reviews.$inferSelect & { reviewer: typeof users.$inferSelect })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/catalog',
      input: insertCatalogItemSchema,
      responses: {
        201: z.custom<typeof catalogItems.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/catalog/:id',
      input: insertCatalogItemSchema.partial(),
      responses: {
        200: z.custom<typeof catalogItems.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/catalog/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect & { teamLeader: typeof users.$inferSelect | null }>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/categories/:id',
      input: z.object({
        name: z.string().optional(),
        teamLeaderId: z.string().nullable().optional(),
      }),
      responses: {
        200: z.custom<typeof categories.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
        method: 'POST' as const,
        path: '/api/categories',
        input: insertCategorySchema,
        responses: {
            201: z.custom<typeof categories.$inferSelect>(),
            400: errorSchemas.validation,
            401: errorSchemas.unauthorized,
        }
    }
  },
  reviews: {
    create: {
      method: 'POST' as const,
      path: '/api/reviews',
      input: insertReviewSchema,
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  import: {
    parse: {
      method: 'POST' as const,
      path: '/api/import/parse',
      responses: {
        200: z.array(parsedImportItemSchema),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    commit: {
        method: 'POST' as const,
        path: '/api/import/commit',
        input: z.object({
            items: z.array(parsedImportItemSchema.omit({ isValid: true, validationError: true }))
        }),
        responses: {
            200: z.object({ importedCount: z.number(), categoryCount: z.number() }),
            401: errorSchemas.unauthorized,
        }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
