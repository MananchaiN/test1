import { Router } from 'express';
import { prisma } from '../../prisma';
import { adminAuth } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { z } from 'zod';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

const router = Router();

// Category validation schema
const categorySchema = z.object({
  name: z.string().min(1),
});

// POST /api/admin/categories
router.post('/categories', adminAuth, async (req, res) => {
  try {
    const { name } = categorySchema.parse(req.body);
    
    const category = await prisma.category.create({
      data: { name }
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', adminAuth, async (req, res) => {
  try {
    const { id, name } = z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
    }).parse({ ...req.params, ...req.body });

    const category = await prisma.category.update({
      where: { id },
      data: { name }
    });

    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', adminAuth, async (req, res) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);

    // Soft delete
    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Existing endpoints...
// (previous route.ts content remains unchanged)

export default router;