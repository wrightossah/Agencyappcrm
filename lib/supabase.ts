import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

// Re-export createClient to fix the deployment error
export { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://oemxfgoczvzdttyjualt.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbXhmZ29jenZ6ZHR0eWp1YWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTA0NzcsImV4cCI6MjA1OTE4NjQ3N30.K4mfsNAhM_xAquYSyuMQq3AHufbqbZeQz92CQqXXwLk"

export const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
}
