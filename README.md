# test1

## Reviews & Ratings API Implementation

### Endpoints
- POST /api/products/[id]/reviews
- GET /api/products/[id]/reviews
- DELETE /api/admin/reviews/[id]

### Implementation Details
- Prisma ORM for database interactions
- Zod validation for request parameters
- Order status check (must be Delivered)
- Keyword blocklist for spam filtering
- Unique review constraint per user/product

### Database Model (Prisma)
```prisma
model Review {
  id        Int    @id @default(autoincrement())
  productId String
  userId    String
  rating    Int    @default(0)
  comment   String
  createdAt DateTime @default(now())
}
```

### Validation Schemas
- Zod schemas for request validation will be implemented

### Admin Endpoint
- Requires admin authentication
- Deletes reviews by ID after validation