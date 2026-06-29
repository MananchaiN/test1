import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query = '' } = req.query;

    // Basic full-text search
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query as string } },
          { description: { contains: query as string } }
        ]
      },
      include: {
        category: true,
        images: true
      }
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    await prisma.$disconnect();
  }
}