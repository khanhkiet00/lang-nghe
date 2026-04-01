ALTER TABLE "User"
ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User" u
SET "isEmailVerified" = true
WHERE EXISTS (
  SELECT 1
  FROM "Otp" o
  WHERE o.email = u.email
    AND o.purpose = 'register'
    AND o.used = true
);
