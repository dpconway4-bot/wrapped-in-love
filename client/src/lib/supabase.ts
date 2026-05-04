import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpfcyfzuemewwfwornjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZmN5Znp1ZW1ld3dmd29ybmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTMxMTksImV4cCI6MjA5MzQ4OTExOX0.OQv83L1uu20JyEFqqnL6z5-XXU54vPKimc_CHoFDYDg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type AuthUser = {
  id: string;
  email: string;
};
