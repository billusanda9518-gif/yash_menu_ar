'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize the Supabase client so it's stable across renders
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      console.log(`[useAuth] fetchProfile starting for user: ${userId}`);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('[useAuth] fetchProfile database error:', error.message);
          setProfile(null);
          return;
        }

        console.log('[useAuth] fetchProfile profile loaded successfully:', data);
        setProfile(data as Profile);
      } catch (err) {
        console.error('[useAuth] fetchProfile unexpected error:', err);
        setProfile(null);
      }
    },
    [supabase],
  );

  useEffect(() => {
    console.log('[useAuth] useEffect: auth provider initialization started');
    let active = true;

    // Get the initial session
    const initSession = async () => {
      console.log("loading started");
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.warn('[useAuth] initSession getUser returned error:', error.message);
        }

        if (active) {
          console.log("auth state", currentUser);
          setUser(currentUser);

          if (currentUser) {
            await fetchProfile(currentUser.id);
          }
        }
      } catch (err) {
        console.error('[useAuth] initSession unexpected error:', err);
      } finally {
        if (active) {
          console.log("loading finished");
          setLoading(false);
        }
      }
    };

    initSession();

    // Listen for auth state changes
    console.log('[useAuth] subscribing to onAuthStateChange');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("loading started");
      const currentUser = session?.user ?? null;
      
      if (active) {
        console.log("auth state", session);
        setUser(currentUser);
      }

      try {
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          if (active) {
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('[useAuth] onAuthStateChange profile fetch error:', err);
      } finally {
        if (active) {
          console.log("loading finished");
          setLoading(false);
        }
      }
    });

    return () => {
      console.log('[useAuth] cleaning up auth state listener');
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error?.message ?? null };
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      return { error: error?.message ?? null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { error: error?.message ?? null };
    },
    [supabase],
  );

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
