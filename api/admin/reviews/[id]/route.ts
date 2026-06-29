import { PrismaClient } from '@prisma/client'
import { H3Event } from 'h3'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// DELETE /api/admin/reviews/[id]
export async function DELETE(event: H3Event) {
  try {
    // Get review ID from route parameter
    const id = event.context.params.id

    // Get session
    const session = await getServerSession(event, authOptions)
    if (!session || !session.user.isAdmin) {
      return {
        status: 401,
        body: { error: 'Unauthorized' }
      }
    }

    // Find review
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    })

    if (!review) {
      return {
        status: 404,
        body: { error: 'Review not found' }
      }
    }

    // Delete review
    await prisma.review.delete({
      where: { id: parseInt(id) }
    })

    return {
      status: 200,
      body: { message: 'Review deleted successfully' }
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