import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session on app load
    const checkStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if employee exists and get their details
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle(); // Use maybeSingle instead of single to avoid PGRST116 error

      if (employeeError) {
        console.error('Database error:', employeeError);
        toast({
          title: "Login Failed",
          description: "Database error occurred",
          variant: "destructive",
        });
        return false;
      }

      if (!employee) {
        toast({
          title: "Login Failed",
          description: "Invalid email or account not found",
          variant: "destructive",
        });
        return false;
      }

      // For now, since we don't have password column, use simple password check
      // Admin password: admin123, Employee password: employee123
      const isAdminEmail = email === 'admin@company.com';
      const expectedPassword = isAdminEmail ? 'admin123' : 'employee123';
      
      if (password !== expectedPassword) {
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive",
        });
        return false;
      }

      // Set user state - determine admin status based on email for now
      const userData = {
        id: employee.id,
        email: employee.email,
        firstName: employee.first_name,
        lastName: employee.last_name,
        isAdmin: isAdminEmail, // Admin if email is admin@company.com
        profilePhoto: employee.profile_photo,
      };

      setUser(userData);
      
      // Store user session in localStorage
      localStorage.setItem('auth_user', JSON.stringify(userData));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${employee.first_name}!`,
      });

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      // Clear stored session
      localStorage.removeItem('auth_user');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions",
      });
      return true;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated",
      });
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Password Reset Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      forgotPassword,
      resetPassword,
      isLoading,
    }}>
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