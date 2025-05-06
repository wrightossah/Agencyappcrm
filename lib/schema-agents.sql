-- Function to create the agents table if it doesn't exist
CREATE OR REPLACE FUNCTION create_agents_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if the agents table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'agents'
    ) THEN
        -- Create the agents table
        CREATE TABLE public.agents (
            id UUID PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

        -- Create policy to allow users to see only their own agent record
        CREATE POLICY "Users can view their own agent record"
        ON public.agents FOR SELECT
        USING (auth.uid() = id);

        -- Create policy to allow users to update their own agent record
        CREATE POLICY "Users can update their own agent record"
        ON public.agents FOR UPDATE
        USING (auth.uid() = id);

        -- Create policy to allow authenticated users to insert their own agent record
        CREATE POLICY "Users can insert their own agent record"
        ON public.agents FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;
END;
$$ LANGUAGE plpgsql;
