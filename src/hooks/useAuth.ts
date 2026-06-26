import { useEffect, useState } from 'react';
import { supabase } from '../data/supabase';

export interface AuthState {
  email: string | null; // e-mail вошедшего редактора, иначе null
  ready: boolean; // инициализация завершена
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signOut: () => Promise<void>;
}

/** Авторизация редакторов по e-mail + паролю (без писем — без лимитов). */
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

  const signIn = async (addr: string, password: string) => {
    if (!supabase) return { ok: false, message: 'Облако не настроено' };
    const { error } = await supabase.auth.signInWithPassword({
      email: addr.trim(),
      password,
    });
    if (!error) return { ok: true, message: 'Вход выполнен ✓' };
    const msg = /invalid login credentials/i.test(error.message)
      ? 'Неверный e-mail или пароль'
      : error.message;
    return { ok: false, message: msg };
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setEmail(null);
  };

  return { email, ready, signIn, signOut };
}
