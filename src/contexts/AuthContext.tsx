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

// ユーザーデータをキャッシュするためのキー
const USER_CACHE_KEY = 'truss-app-user-cache';

// キャッシュからユーザーを取得
const getCachedUser = (): AppUser | null => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      console.log('📦 Cached user found:', parsed.email);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse cached user:', e);
  }
  return null;
};

// ユーザーをキャッシュに保存
const setCachedUser = (user: AppUser | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      console.log('💾 User cached:', user.email);
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
      console.log('🗑️ User cache cleared');
    }
  } catch (e) {
    console.error('Failed to cache user:', e);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  // キャッシュからユーザーを初期化
  const [user, setUser] = useState<AppUser | null>(() => getCachedUser());
  const [loading, setLoading] = useState(true);

  // Fetch app user from database
  const fetchAppUser = async (authId: string): Promise<AppUser | null> => {
    console.log('🔍 fetchAppUser called with authId:', authId);
    const startTime = Date.now();
    
    try {
      // Add timeout to detect hanging queries (reduced to 15 seconds for cold start)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 15s')), 15000);
      });

      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      console.log(`📊 Query completed in ${Date.now() - startTime}ms`);

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
        membershipYear: data.membership_year || undefined,
        isRenewal: data.is_renewal || false,
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
    let mounted = true;
    
    const initAuth = async () => {
      const startTime = Date.now();
      console.log('🚀 initAuth starting...');
      
      // キャッシュがあればすぐにローディングを完了
      const cachedUser = getCachedUser();
      const storedSession = localStorage.getItem('truss-app-auth');
      
      if (cachedUser && storedSession) {
        console.log('⚡ Using cached user data for instant load');
        setLoading(false);
        // バックグラウンドでデータを更新
      }
      
      console.log('💾 Stored session in localStorage:', storedSession ? 'Found' : 'Not found');
      
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          console.log('💾 Stored session details:', {
            hasAccessToken: !!parsed?.access_token,
            hasRefreshToken: !!parsed?.refresh_token,
            expiresAt: parsed?.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'N/A'
          });
        } catch (e) {
          console.log('💾 Could not parse stored session');
        }
      }
      
      try {
        // Get current session
        const sessionStart = Date.now();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
        }
        
        console.log(`📋 Session retrieved in ${Date.now() - sessionStart}ms:`, session ? `Found (${session.user?.email})` : 'None');
        
        if (session) {
          console.log('🔑 Session expires at:', new Date(session.expires_at! * 1000).toLocaleString());
          console.log('🔑 Session is expired:', session.expires_at! * 1000 < Date.now());
        }
        
        if (!mounted) return;
        
        setSession(session);
        setSupabaseUser(session?.user || null);

        if (session?.user) {
          console.log('👤 User ID from session:', session.user.id);
          const appUser = await fetchAppUser(session.user.id);
          console.log('📦 App user result:', appUser ? `Found (${appUser.email})` : 'null');
          if (mounted && appUser) {
            setUser(appUser);
            setCachedUser(appUser); // キャッシュを更新
          }
        } else {
          console.log('⚠️ No session user - checking if we can refresh...');
          
          // Try to refresh the session if we have a stored session
          if (storedSession) {
            console.log('🔄 Attempting to refresh session...');
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error('❌ Refresh failed:', refreshError);
              // リフレッシュ失敗時はキャッシュをクリア
              setCachedUser(null);
              if (mounted) {
                setUser(null);
              }
            } else if (refreshData.session) {
              console.log('✅ Session refreshed successfully!');
              if (mounted) {
                setSession(refreshData.session);
                setSupabaseUser(refreshData.session.user);
                const appUser = await fetchAppUser(refreshData.session.user.id);
                if (appUser && mounted) {
                  setUser(appUser);
                  setCachedUser(appUser); // キャッシュを更新
                }
              }
            }
          } else {
            // セッションがない場合はキャッシュもクリア
            setCachedUser(null);
            if (mounted) {
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log(`✅ initAuth complete in ${Date.now() - startTime}ms`);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        // INITIAL_SESSIONは initAuth で処理済みなのでスキップ
        if (event === 'INITIAL_SESSION') {
          console.log('Skipping INITIAL_SESSION (already handled)');
          return;
        }
        
        setSession(session);
        setSupabaseUser(session?.user || null);

        // TOKEN_REFRESHEDイベントの場合は、既存のユーザー情報を保持
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed - keeping existing user data');
          return;
        }

        if (session?.user) {
          // 既存のユーザー情報がある場合は保持（fetchAppUserが失敗しても）
          const appUser = await fetchAppUser(session.user.id);
          if (appUser && mounted) {
            setUser(appUser);
            setCachedUser(appUser); // キャッシュを更新
          } else {
            console.log('fetchAppUser returned null, keeping existing user');
            // 既存のユーザーを保持する（nullで上書きしない）
          }
        } else if (event === 'SIGNED_OUT') {
          // 明示的なサインアウトの場合のみユーザーをクリア
          console.log('User signed out explicitly');
          setUser(null);
          setCachedUser(null); // キャッシュもクリア
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
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
          emailRedirectTo: window.location.origin,
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
      console.log('🔐 Starting Google OAuth sign in...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          // access_type: 'offline' でリフレッシュトークンを取得
          queryParams: {
            access_type: 'offline',
          },
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
      }
      return { error: error || null };
    } catch (error) {
      console.error('❌ Google OAuth exception:', error);
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCachedUser(null); // キャッシュもクリア
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

      // Update local state and cache
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setCachedUser(updatedUser);

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
    if (appUser) {
      setCachedUser(appUser);
    }
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
