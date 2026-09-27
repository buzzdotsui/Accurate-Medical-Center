-- Fix branchId column type and assign to staff users
ALTER TABLE users ALTER COLUMN "branchId" TYPE TEXT USING "branchId"::TEXT;

DO $$
DECLARE
  branch_id TEXT;
  updated_count INTEGER;
BEGIN
  SELECT id INTO branch_id FROM branches WHERE "isActive" = true LIMIT 1;
  IF branch_id IS NOT NULL THEN
    UPDATE users
    SET "branchId" = branch_id
    WHERE role IN ('NURSE', 'DOCTOR', 'RECEPTIONIST', 'ADMIN')
      AND "branchId" IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % users with branchId %', updated_count, branch_id;
  ELSE
    RAISE EXCEPTION 'No active branch found';
  END IF;
END $$;