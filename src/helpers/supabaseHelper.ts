import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://stzjmwfrfcoeaghehanu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0emptd2ZyZmNvZWFnaGVoYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTAzMjI5MDUsImV4cCI6MTk2NTg5ODkwNX0.1W4sbzTurU7G8oQGPdd5ul7p43gkGJPq7QLuoVZ2Ih8"
);
