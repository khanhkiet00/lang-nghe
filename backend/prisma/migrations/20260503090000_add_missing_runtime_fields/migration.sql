-- Add fields that exist in the current Prisma schema but were missing from
-- older migrations. IF NOT EXISTS keeps this migration safe for local databases
-- that may already have some of these columns.

ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "material" TEXT,
ADD COLUMN IF NOT EXISTS "origin" TEXT,
ADD COLUMN IF NOT EXISTS "processingTime" INTEGER,
ADD COLUMN IF NOT EXISTS "isCustomizable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "weight" INTEGER,
ADD COLUMN IF NOT EXISTS "isOneOfAKind" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "cancelReason" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddress" JSONB,
ADD COLUMN IF NOT EXISTS "noteFromBuyer" TEXT,
ADD COLUMN IF NOT EXISTS "noteFromArtisan" TEXT,
ADD COLUMN IF NOT EXISTS "trackingCode" TEXT,
ADD COLUMN IF NOT EXISTS "shippingProvider" TEXT,
ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
