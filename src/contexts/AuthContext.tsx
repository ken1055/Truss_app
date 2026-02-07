// =============================================
// Truss App - Auth Context (Supabase)
// =============================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User as AppUser, RegistrationStep } from '../App';

interface AuthContextType {
  // Supabase auth state
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  
  // App user state
  user: AppUser | null;
  loading: boolean;
  
  // Auth methods
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  
  // User methods
  updateUser: (updates: Partial<AppUser>) => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch app user from database
  const fetchAppUser = async (authId: string): Promise<AppUser | null> => {
    console.log('🔍 fetchAppUser called with authId:', authId);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      console.log('📊 Supabase query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching user:', error);
        return null;
      }

      if (!data) {
        console.log('⚠️ No user data found');
        return null;
      }
      
      console.log('✅ User found:', data.email);

      // Convert DB user to App user
      return {
        id: data.id,
        email: data.email,
        name: data.name || '',
        nickname: data.nickname || '',
        furigana: data.furigana || '',
        birthday: data.birthday || '',
        languages: data.languages || [],
        birthCountry: data.country || '',
        category: data.category,
        approved: data.approved,
        isAdmin: data.is_admin,
        studentIdImage: data.student_id_image || undefined,
        studentNumber: data.student_number || undefined,
        grade: data.grade || undefined,
        major: data.major || undefined,
        phone: data.phone || undefined,
        organizations: data.organizations || undefined,
        blocked: data.blocked,
        registrationStep: data.registration_step as RegistrationStep,
        emailVerified: data.email_verified,
        initialRegistered: data.initial_registered,
        profileCompleted: data.profile_completed,
        feePaid: data.fee_paid,
        studentIdReuploadRequested: data.student_id_reupload_requested,
        reuploadReason: data.reupload_reason || undefined,
        requestedAt: data.requested_at || undefined,
      };
    } catch (error) {
      console.error('Error in fetchAppUser:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 initAuth starting...');
      
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Session:', session ? `Found (${session.user?.email})` : 'None');
        
        setSession(session);
        setSupabaseUser(session?.user || null);

        if (session?.user) {
          console.log('👤 User ID from session:', session.user.id);
          const appUser = await fetchAppUser(session.user.id);
          console.log('📦 App user result:', appUser ? `Found (${appUser.email})` : 'null');
          setUser(appUser);
        } else {
          console.log('⚠️ No session user');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        setLoading(false);
        console.log('✅ initAuth complete');
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setSupabaseUser(session?.user || null);

        if (session?.user) {
          const appUser = await fetchAppUser(session.user.id);
          setUser(appUser);
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) return { error };

      // User record will be created by database trigger
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error || null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error: error || null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Update user in database
  const updateUser = async (updates: Partial<AppUser>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname;
      if (updates.furigana !== undefined) dbUpdates.furigana = updates.furigana;
      if (updates.birthday !== undefined) dbUpdates.birthday = updates.birthday || null;
      if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
      if (updates.birthCountry !== undefined) dbUpdates.country = updates.birthCountry;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.approved !== undefined) dbUpdates.approved = updates.approved;
      if (updates.studentIdImage !== undefined) dbUpdates.student_id_image = updates.studentIdImage || null;
      if (updates.studentNumber !== undefined) dbUpdates.student_number = updates.studentNumber || null;
      if (updates.grade !== undefined) dbUpdates.grade = updates.grade || null;
      if (updates.major !== undefined) dbUpdates.major = updates.major || null;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null;
      if (updates.organizations !== undefined) dbUpdates.organizations = updates.organizations || null;
      if (updates.registrationStep !== undefined) dbUpdates.registration_step = updates.registrationStep;
      if (updates.emailVerified !== undefined) dbUpdates.email_verified = updates.emailVerified;
      if (updates.initialRegistered !== undefined) dbUpdates.initial_registered = updates.initialRegistered;
      if (updates.profileCompleted !== undefined) dbUpdates.profile_completed = updates.profileCompleted;
      if (updates.feePaid !== undefined) dbUpdates.fee_paid = updates.feePaid;
      if (updates.studentIdReuploadRequested !== undefined) dbUpdates.student_id_reupload_requested = updates.studentIdReuploadRequested;
      if (updates.reuploadReason !== undefined) dbUpdates.reupload_reason = updates.reuploadReason || null;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) return { error };

      // Update local state
      setUser({ ...user, ...updates });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Refresh user data from database
  const refreshUser = async () => {
    if (!supabaseUser) return;
    
    const appUser = await fetchAppUser(supabaseUser.id);
    setUser(appUser);
  };

  const value: AuthContextType = {
    session,
    supabaseUser,
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
