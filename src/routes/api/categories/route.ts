import { createAPIRouter } from '@/lib/api/router';
import { prisma } from '@/lib/prisma';

export const router = createAPIRouter({
  GET: {
    '/': async (req) => {
      // Implement category listing endpoint
      const categories = await prisma.category.findMany();
      return { data: categories };
    }
  }
});