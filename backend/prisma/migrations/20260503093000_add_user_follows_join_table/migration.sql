CREATE TABLE IF NOT EXISTS "_UserFollows" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_UserFollows_AB_unique" ON "_UserFollows"("A", "B");
CREATE INDEX IF NOT EXISTS "_UserFollows_B_index" ON "_UserFollows"("B");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_UserFollows_A_fkey'
  ) THEN
    ALTER TABLE "_UserFollows"
    ADD CONSTRAINT "_UserFollows_A_fkey"
    FOREIGN KEY ("A") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_UserFollows_B_fkey'
  ) THEN
    ALTER TABLE "_UserFollows"
    ADD CONSTRAINT "_UserFollows_B_fkey"
    FOREIGN KEY ("B") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
