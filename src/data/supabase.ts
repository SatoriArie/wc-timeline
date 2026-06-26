import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ВНИМАНИЕ: это ПУБЛИЧНЫЕ клиентские значения Supabase.
// `anon`-ключ по дизайну открыт (он и так попадает в клиентский бандл) и защищён
// политиками RLS на стороне БД. Секретный `service_role` ключ сюда класть НЕЛЬЗЯ.
// Можно переопределить через переменные окружения VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const URL = import.meta.env.VITE_SUPABASE_URL || 'https://cqizcgcmvmhfnwowehlw.supabase.co';
const ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxaXpjZ2Ntdm1oZm53b3dlaGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTg0OTMsImV4cCI6MjA5ODAzNDQ5M30.3VW8S3JUXX2GkhnN9hSjtE5EOZFvrT2xSTV-27Rq2WY';

export const supabase: SupabaseClient | null = URL && ANON_KEY ? createClient(URL, ANON_KEY) : null;

/** Настроено ли облако (Supabase). Если нет — сайт работает на статических данных. */
export const isCloud = !!supabase;
