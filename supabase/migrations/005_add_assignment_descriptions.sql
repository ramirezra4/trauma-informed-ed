-- Add description field to assignments table
ALTER TABLE assignments
ADD COLUMN description TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN assignments.description IS 'Optional description or notes about the assignment';