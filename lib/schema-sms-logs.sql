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
      recipient TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      message_id TEXT,
      error_message TEXT,
      error_code TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
      retry_count INTEGER DEFAULT 0,
      metadata JSONB
    );

    -- Add indexes
    CREATE INDEX idx_sms_logs_recipient ON public.sms_logs(recipient);
    CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);
    CREATE INDEX idx_sms_logs_created_at ON public.sms_logs(created_at);
    CREATE INDEX idx_sms_logs_message_id ON public.sms_logs(message_id);
    
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
  END IF;
END;
$$ LANGUAGE plpgsql;
