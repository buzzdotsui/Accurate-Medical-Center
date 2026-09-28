import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Supabase Client dedicated primarily to Realtime subscriptions on the frontend.
 * For general database operations, continue using Prisma on the server.
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be set.
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
