
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = "https://neqxfjcrbsfmnigszvxz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcXhmamNyYnNmbW5pZ3N6dnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTk2MjcsImV4cCI6MjA2MDgzNTYyN30.oxAs0bEfZqZyxgHZYVsBhgwAxppRUbaDeR8xFbAplrc";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
