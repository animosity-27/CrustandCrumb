import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  signOut: () => Promise<void>;

  getRole: () => Promise<string>;
};


const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let mounted = true;


    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setSession(data.session);
      setLoading(false);
    });


    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        setSession(sess);
      }
    );


    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };

  }, []);



  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      return {
        error: error ? error.message : null,
      };
    },
    []
  );



  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      return {
        error: error ? error.message : null,
      };
    },
    []
  );



  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);




  const getRole = useCallback(async () => {

    if (!session) {
      return 'customer';
    }


    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();



    if (error || !data) {
      return 'customer';
    }


    return data.role;

  }, [session]);




  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signIn,
        signUp,
        signOut,
        getRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}



export function useAuth() {

  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}