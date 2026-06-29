import { createRouter } from "../trpc"
import { z } from "zod"
import { prisma } from "../db"
import { sendEmail } from "../utils/email"
import { processRefund } from "../utils/stripe"

export const orderRouter = createRouter()
  .query("list", {
    input: z.object({
      userId: z.string().optional(),
    }),
    resolve: async ({ input }) => {
      return await prisma.order.findMany({
        where: { userId: input.userId },
        include: { statusLogs: true },
      })
    },
  })
  .query("get", {
    input: z.object({ id: z.string() }),
    resolve: async ({ input }) => {
      return await prisma.order.findUniqueOrThrow({
        where: { id: input.id },
        include: { statusLogs: true },
      })
    },
  })
  .mutation("updateStatus", {
    input: z.object({
      id: z.string(),
      newStatus: z.enum(["Pending", "Processing", "Shipped", "Delivered"])
    }),
    resolve: async ({ input, ctx }) => {
      // Admin auth check would go here
      
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: input.id }
      })

      if (input.newStatus === "Cancelled") {
        if (order.status !== "Pending") {
          throw new Error("Order can only be cancelled when pending")
        }
        // Handle refund if needed
      }

      const oldStatus = order.status
      
      await prisma.$transaction(async (prisma) => {
        await prisma.order.update({
          where: { id: input.id },
          data: {
            status: input.newStatus,
            updatedAt: new Date(),
            trackingNumber: input.newStatus === "Shipped" ? input.trackingNumber : undefined
          }
        })

        await prisma.orderStatusLog.create({
          data: {
            orderId: input.id,
            oldStatus,
            newStatus: input.newStatus,
          }
        })
      })

      await sendEmail({
        to: order.user.email,
        subject: `Order Status Changed: ${input.newStatus}`,
        body: `Your order status has been updated to ${input.newStatus}`
      })

      if (input.newStatus === "Delivered" && input.refundRequested) {
        await processRefund(order.id)
      }

      return {
        success: true,
        message: "Order status updated successfully"
      }
    }
  })