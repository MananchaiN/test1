import { z } from "zod"

export const orderSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  status: z.enum(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"])
    .default("Pending"),
  trackingNumber: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

export const updateOrderSchema = z.object({
  id: z.string().min(1),
  newStatus: z.enum(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"])
})

export const refundSchema = z.object({
  orderId: z.string().min(1),
  refundRequested: z.boolean()
})