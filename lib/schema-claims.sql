-- Function to create claims table if it doesn't exist
CREATE OR REPLACE FUNCTION create_claims_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if the claims table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'claims') THEN
        -- Create the claims table
        CREATE TABLE public.claims (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            claim_type TEXT NOT NULL,
            claim_date DATE NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX idx_claims_client_id ON claims(client_id);
        CREATE INDEX idx_claims_status ON claims(status);
        CREATE INDEX idx_claims_claim_date ON claims(claim_date);
    END IF;
END;
$$ LANGUAGE plpgsql;
