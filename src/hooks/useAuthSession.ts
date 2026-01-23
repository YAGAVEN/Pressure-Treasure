import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useGame } from '@/contexts/GameContext';

export const useAuthSession = () => {
  const { setAdmin } = useGame();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const adminData = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || 'Admin',
          };
          setAdmin(adminData);
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const adminData = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || 'Admin',
          };
          setAdmin(adminData);
        } else {
          setAdmin(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
};
