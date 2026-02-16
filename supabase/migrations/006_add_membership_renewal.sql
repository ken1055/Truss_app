-- =============================================
-- Truss App - Add Membership Renewal Fields
-- =============================================
-- Run this in Supabase SQL Editor

-- Add membership_year column (the fiscal year of membership, e.g., 2025)
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_year INTEGER;

-- Add is_renewal column (true if this is a renewal, entry fee not required)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;

-- Set membership_year for existing paid members to current fiscal year
-- Fiscal year starts in April, so Jan-Mar belongs to previous year
UPDATE users 
SET membership_year = CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN EXTRACT(YEAR FROM CURRENT_DATE)
    ELSE EXTRACT(YEAR FROM CURRENT_DATE) - 1
  END
WHERE fee_paid = true AND membership_year IS NULL;

-- Comment explaining the fields
COMMENT ON COLUMN users.membership_year IS 'The fiscal year of membership (April to March). E.g., 2025 means April 2025 to March 2026.';
COMMENT ON COLUMN users.is_renewal IS 'True if this member is renewing (no entry fee required). False for new members.';
