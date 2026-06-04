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

  // 1. Subscribe to auth state changes. Keep callback synchronous!
  useEffect(() => {
    console.log('[useAuth] useEffect: subscribing to onAuthStateChange');
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("onAuthStateChange event:", event);
      const currentUser = session?.user ?? null;
      
      if (active) {
        console.log("auth state changed user ID:", currentUser?.id);
        setUser(currentUser);
        
        // If there's no user, clear profile and end loading immediately.
        if (!currentUser) {
          setProfile(null);
          setLoading(false);
          console.log("loading finished - no user session");
        }
      }
    });

    return () => {
      console.log('[useAuth] cleaning up auth state listener');
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 2. Fetch profile asynchronously when user state changes
  useEffect(() => {
    let active = true;
    if (!user) return;

    const fetchUserProfile = async () => {
      console.log("loading started");
      setLoading(true);
      try {
        await fetchProfile(user.id);
      } catch (err) {
        console.error('[useAuth] fetchUserProfile error:', err);
      } finally {
        if (active) {
          console.log("loading finished - profile fetch complete");
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      active = false;
    };
  }, [user, fetchProfile]);

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
