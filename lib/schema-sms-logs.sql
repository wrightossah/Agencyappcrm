-- Create function to create SMS logs table if it doesn't exist
CREATE OR REPLACE FUNCTION create_sms_logs_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'sms_logs'
  ) THEN
    -- Create the table
    CREATE TABLE public.sms_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'attempted',
      message_id VARCHAR(255),
      error_message TEXT,
      error_code VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add RLS policies
    ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for authenticated users
    CREATE POLICY "Allow authenticated users to view SMS logs"
      ON public.sms_logs
      FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Allow authenticated users to insert SMS logs"
      ON public.sms_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
      
    CREATE POLICY "Allow authenticated users to update SMS logs"
      ON public.sms_logs
      FOR UPDATE
      TO authenticated
      USING (true);
      
    -- Policy for viewing SMS logs
    CREATE POLICY sms_logs_select_policy ON public.sms_logs
        FOR SELECT USING (agent_id = auth.uid());

    -- Policy for inserting SMS logs
    CREATE POLICY sms_logs_insert_policy ON public.sms_logs
        FOR INSERT WITH CHECK (agent_id = auth.uid());

    -- Policy for updating SMS logs
    CREATE POLICY sms_logs_update_policy ON public.sms_logs
        FOR UPDATE USING (agent_id = auth.uid());

    -- Create indexes
    CREATE INDEX idx_sms_logs_client_id ON public.sms_logs(client_id);
    CREATE INDEX idx_sms_logs_agent_id ON public.sms_logs(agent_id);
    CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);
    CREATE INDEX idx_sms_logs_created_at ON public.sms_logs(created_at);
  END IF;
END;
$$ LANGUAGE plpgsql;
