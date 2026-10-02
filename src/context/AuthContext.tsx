import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Teacher, Student, UserRole } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DataStore } from '../lib/dataStore';

interface AuthContextType {
  currentUser: Profile | null;
  currentTeacher: Teacher | null;
  currentStudent: Student | null;
  role: UserRole | null;
  isLoading: boolean;
  isCloudConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (nama: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchTestRole: (role: UserRole) => Promise<void>;
  reloadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  const fetchRoleSpecificRecord = async (profile: Profile) => {
    if (profile.role === 'guru') {
      const teachers = await DataStore.getTeachers();
      const teacher = teachers.find(t => t.profile_id === profile.id || t.profile?.email === profile.email);
      setCurrentTeacher(teacher || null);
      setCurrentStudent(null);
    } else if (profile.role === 'siswa') {
      const students = await DataStore.getStudents();
      const student = students.find(s => s.profile_id === profile.id || s.profile?.email === profile.email);
      setCurrentStudent(student || null);
      setCurrentTeacher(null);
    } else {
      setCurrentTeacher(null);
      setCurrentStudent(null);
    }
  };

  const loadInitialSession = async () => {
    setIsLoading(true);
    const configured = isSupabaseConfigured();
    setIsCloudConnected(configured);

    if (configured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profiles = await DataStore.getProfiles();
          const userProfile = profiles.find(p => p.id === session.user.id || p.email === session.user.email);
          if (userProfile) {
            setCurrentUser(userProfile);
            await fetchRoleSpecificRecord(userProfile);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Gagal memuat sesi Supabase:', err);
      }
    }

    // Default to Guru or Admin for preview testing if no session
    const savedUserId = localStorage.getItem('lms_batudaa_active_user_id');
    const profiles = await DataStore.getProfiles();
    let activeProfile = profiles.find(p => p.id === savedUserId);
    
    // Default to Guru if none selected
    if (!activeProfile) {
      activeProfile = profiles.find(p => p.role === 'guru') || profiles[0];
    }

    if (activeProfile) {
      setCurrentUser(activeProfile);
      await fetchRoleSpecificRecord(activeProfile);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadInitialSession();

    if (isSupabaseConfigured() && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profiles = await DataStore.getProfiles();
          const prof = profiles.find(p => p.id === session.user.id || p.email === session.user.email);
          if (prof) {
            setCurrentUser(prof);
            await fetchRoleSpecificRecord(prof);
          }
        } else {
          // If signed out in supabase, don't clear demo if user is browsing demo
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured() && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Check if it exists in mock data to provide friendly demo signin
          const profiles = await DataStore.getProfiles();
          const localProfile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
          if (localProfile) {
            setCurrentUser(localProfile);
            localStorage.setItem('lms_batudaa_active_user_id', localProfile.id);
            await fetchRoleSpecificRecord(localProfile);
            setIsLoading(false);
            return { success: true };
          }
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profiles = await DataStore.getProfiles();
          const prof = profiles.find(p => p.id === data.user.id || p.email === data.user.email);
          if (prof) {
            setCurrentUser(prof);
            localStorage.setItem('lms_batudaa_active_user_id', prof.id);
            await fetchRoleSpecificRecord(prof);
          }
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local/Demo Mode login by email
      const profiles = await DataStore.getProfiles();
      const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('lms_batudaa_active_user_id', user.id);
        await fetchRoleSpecificRecord(user);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Akun dengan email ini tidak ditemukan. Coba pilih peran di bawah atau daftar baru.' };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      return { success: false, error: msg };
    }
  };

  const signUp = async (nama: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nama,
              role,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newProf: Profile = {
            id: data.user.id,
            nama,
            email,
            role,
            created_at: new Date().toISOString(),
          };
          setCurrentUser(newProf);
          localStorage.setItem('lms_batudaa_active_user_id', newProf.id);
          await fetchRoleSpecificRecord(newProf);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local mock user registration
      const newProf: Profile = {
        id: 'usr-' + Date.now(),
        nama,
        email,
        role,
        created_at: new Date().toISOString(),
      };
      
      const currentList = await DataStore.getProfiles();
      localStorage.setItem('lms_batudaa_data_profiles', JSON.stringify([...currentList, newProf]));
      
      // If role is guru or siswa, make sure helper placeholder exists
      if (role === 'guru') {
        await DataStore.addTeacher({
          profile_id: newProf.id,
          mapel_utama: 'Mata Pelajaran Umum',
        }, newProf);
      } else if (role === 'siswa') {
        const classes = await DataStore.getClasses();
        await DataStore.addStudent({
          profile_id: newProf.id,
          nis: '24' + Math.floor(1000 + Math.random() * 9000),
          nisn: '00' + Math.floor(10000000 + Math.random() * 90000000),
          kelas_id: classes[0]?.id || 'c-xii-mipa-1',
          jenis_kelamin: 'L',
        }, newProf);
      }

      setCurrentUser(newProf);
      localStorage.setItem('lms_batudaa_active_user_id', newProf.id);
      await fetchRoleSpecificRecord(newProf);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Gagal mendaftarkan akun baru';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem('lms_batudaa_active_user_id');
    setCurrentUser(null);
    setCurrentTeacher(null);
    setCurrentStudent(null);
    setIsLoading(false);
  };

  const switchTestRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    const profiles = await DataStore.getProfiles();
    const candidate = profiles.find(p => p.role === targetRole);
    if (candidate) {
      setCurrentUser(candidate);
      localStorage.setItem('lms_batudaa_active_user_id', candidate.id);
      await fetchRoleSpecificRecord(candidate);
    }
    setIsLoading(false);
  };

  const reloadUserData = async () => {
    if (currentUser) {
      await fetchRoleSpecificRecord(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTeacher,
        currentStudent,
        role: currentUser?.role || null,
        isLoading,
        isCloudConnected,
        login,
        signUp,
        logout,
        switchTestRole,
        reloadUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
