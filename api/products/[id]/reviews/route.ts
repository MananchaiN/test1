import { PrismaClient } from '@prisma/client'
import { H3Event } from 'h3'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// Zod validation schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500)
})

// GET /api/products/[id]/reviews
export async function GET(event: H3Event) {
  try {
    // Get product ID from route parameter
    const id = event.context.params.id

    // Fetch all reviews for this product
    const reviews = await prisma.review.findMany({
      where: { productId: id }
    })

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
      : 0

    return {
      status: 200,
      body: {
        reviews,
        averageRating
      }
    }
  } catch (error) {
    console.error(error)
    return {
      status: 500,
      body: { error: 'Internal server error' }
    }
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/products/[id]/reviews
export async function POST(event: H3Event) {
  try {
    // Get product ID from route parameter
    const id = event.context.params.id

    // Get session
    const session = await getServerSession(event, authOptions)
    if (!session) {
      return {
        status: 401,
        body: { error: 'Unauthorized' }
      }
    }

    // Validate request body
    const body = await readBody(event)
    const result = reviewSchema.safeParse(body)
    if (!result.success) {
      return {
        status: 400,
        body: { error: 'Invalid request data', details: result.error.issues }
      }
    }

    // Check if user has purchased this product with delivered status
    const userPurchases = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        productId: id,
        status: 'Delivered'
      }
    })

    if (userPurchases.length === 0) {
      return {
        status: 403,
        body: { error: 'You must purchase the product with delivered status to review' }
      }
    }

    // Check for existing review by this user
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: id,
        userId: session.user.id
      }
    })

    if (existingReview) {
      return {
        status: 400,
        body: { error: 'You already left a review for this product' }
      }
    }

    // Check for spam keywords
    const spamKeywords = ['free', 'buy now', 'click here', 'urgent']
    const lowerCaseComment = body.comment.toLowerCase()
    if (spamKeywords.some(keyword => lowerCaseComment.includes(keyword))) {
      return {
        status: 400,
        body: { error: 'Review contains spam content' }
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: session.user.id,
        rating: body.rating,
        comment: body.comment
      }
    })

    // Calculate average rating
    const reviews = await prisma.review.findMany({
      where: { productId: id }
    })

    const averageRating = reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
      : 0

    return {
      status: 201,
      body: {
        message: 'Review created successfully',
        review,
        averageRating
      }
    }
  } catch (error) {
    console.error(error)
    return {
      status: 500,
      body: { error: 'Internal server error' }
    }
  } finally {
    await prisma.$disconnect()
  }
}