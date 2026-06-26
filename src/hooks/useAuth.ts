import { useEffect, useState } from 'react';
import { supabase } from '../data/supabase';

export interface AuthState {
  email: string | null; // e-mail вошедшего редактора, иначе null
  ready: boolean; // инициализация завершена
  signIn: (email: string) => Promise<{ ok: boolean; message: string }>;
  signOut: () => Promise<void>;
}

/** Авторизация редакторов через magic-link (письмо со ссылкой входа). */
export function useAuth(): AuthState {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (addr: string) => {
    if (!supabase) return { ok: false, message: 'Облако не настроено' };
    const { error } = await supabase.auth.signInWithOtp({
      email: addr.trim(),
      options: { emailRedirectTo: window.location.href },
    });
    return error
      ? { ok: false, message: error.message }
      : { ok: true, message: 'Письмо со ссылкой входа отправлено — проверь почту.' };
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setEmail(null);
  };

  return { email, ready, signIn, signOut };
}
