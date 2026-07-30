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



const AuthContext =
  createContext<AuthContextValue | null>(null);





export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {


  const [session, setSession] =
    useState<Session | null>(null);


  const [loading, setLoading] =
    useState(true);





  useEffect(() => {


    let mounted = true;



    async function loadSession() {


      const {
        data
      } = await supabase.auth.getSession();



      if (!mounted) return;


      setSession(data.session);

      setLoading(false);


    }



    loadSession();




    const {
      data: listener
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession)=>{


          setSession(newSession);


        }
      );





    return ()=>{


      mounted = false;


      listener.subscription.unsubscribe();


    };



  }, []);








  const signIn = useCallback(

    async (
      email:string,
      password:string
    )=>{


      const {
        error
      } =
      await supabase.auth.signInWithPassword({

        email,

        password,

      });





      return {

        error:
          error
          ? error.message
          : null,

      };


    },

    []

  );









  const signUp = useCallback(

    async (
      email:string,
      password:string
    )=>{


      const {
        error
      } =
      await supabase.auth.signUp({

        email,

        password,

      });






      return {

        error:
          error
          ? error.message
          : null,

      };


    },

    []

  );









  const signOut = useCallback(

    async ()=>{


      await supabase.auth.signOut();


      setSession(null);


    },

    []

  );









  const getRole = useCallback(

    async ()=>{


      if (!session) {

        return 'customer';

      }






      const {
        data,
        error
      } = await supabase

        .from('profiles')

        .select('role')

        .eq(
          'id',
          session.user.id
        )

        .single();







      if (error || !data) {

        return 'customer';

      }





      return data.role;


    },

    [session]

  );









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


  const context =
    useContext(AuthContext);




  if (!context) {


    throw new Error(
      'useAuth must be used inside AuthProvider'
    );


  }




  return context;


}