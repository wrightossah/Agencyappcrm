-- Update policies table to include all new fields
ALTER TABLE policies 
ADD COLUMN IF NOT EXISTS policy_provider TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_renewable BOOLEAN DEFAULT FALSE;

-- Update the existing columns to match new requirements
ALTER TABLE policies 
ALTER COLUMN policy_number SET NOT NULL,
ALTER COLUMN start_date TYPE DATE USING start_date::DATE,
ALTER COLUMN end_date TYPE DATE USING end_date::DATE;

-- Add constraint to ensure policy number is unique per client
ALTER TABLE policies 
ADD CONSTRAINT unique_policy_per_client UNIQUE (client_id, policy_number);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_provider ON policies(policy_provider);

-- Add check constraint for status values
ALTER TABLE policies 
ADD CONSTRAINT check_policy_status 
CHECK (status IN ('Active', 'Expired', 'Cancelled'));
