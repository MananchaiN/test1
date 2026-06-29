import { createAPIRouter } from '@/lib/api/router';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ProductQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sortBy: z.enum(['new', 'price', 'popularity']).optional(),
  page: z.number().min(1).optional(),
});

export const router = createAPIRouter({
  GET: {
    '/': async (req) => {
      const { search, category, minPrice, maxPrice, sortBy, page } = ProductQuerySchema.parse(req.query);
      
      const products = await prisma.product.findMany({
        where: {
          name: search ? { contains: search } : undefined,
          category: category ? { name: category } : undefined,
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
        orderBy: {
          [sortBy || 'createdAt']: 'desc'
        },
        skip: (page - 1) * 20,
        take: 20,
        include: { images: true }
      });
      
      return { data: products };
    },
    '/:slug': async (req) => {
      const product = await prisma.product.findUnique({
        where: { slug: req.params.slug },
        include: { images: true, variants: true }
      });
      
      if (!product) {
        return { error: 'Product not found' };
      }
      
      return { data: product };
    }
  }
});