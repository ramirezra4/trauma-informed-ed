-- Add user profile fields for better personalization
-- Add new columns to users table

-- Create enum for academic year
DO $$ BEGIN
    CREATE TYPE academic_year AS ENUM ('freshman', 'sophomore', 'junior', 'senior', 'graduate', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS academic_year academic_year;

-- Update the display_name column to be more descriptive
COMMENT ON COLUMN users.full_name IS 'User''s full name for personalization';
COMMENT ON COLUMN users.school IS 'Name of the educational institution';
COMMENT ON COLUMN users.academic_year IS 'Current academic year/level';
COMMENT ON COLUMN users.display_name IS 'Optional display name, defaults to first name from full_name';

-- Add a function to automatically set display_name from full_name
CREATE OR REPLACE FUNCTION set_display_name_from_full_name()
RETURNS TRIGGER AS $$
BEGIN
    -- If display_name is not set but full_name is, extract first name
    IF NEW.display_name IS NULL AND NEW.full_name IS NOT NULL THEN
        NEW.display_name := split_part(NEW.full_name, ' ', 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set display_name
DROP TRIGGER IF EXISTS auto_set_display_name ON users;
CREATE TRIGGER auto_set_display_name
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_display_name_from_full_name();