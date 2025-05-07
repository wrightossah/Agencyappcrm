-- Create policies table if it doesn't exist
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_number TEXT NOT NULL UNIQUE,
  policy_type TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  premium DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_client
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_user
    FOREIGN KEY (created_by)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON policies(client_id);
CREATE INDEX IF NOT EXISTS idx_policies_created_by ON policies(created_by);
CREATE INDEX IF NOT EXISTS idx_policies_policy_type ON policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_policies_start_date ON policies(start_date);
CREATE INDEX IF NOT EXISTS idx_policies_end_date ON policies(end_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_policies_updated_at
BEFORE UPDATE ON policies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
