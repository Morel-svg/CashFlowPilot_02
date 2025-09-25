import { createContext, useContext, ReactNode } from "react";
import { useCurrentUser, useLogin, useRegister, useLogout } from "@/hooks/api";
import type { User, LoginRequest, InsertUser } from "@shared/schema";
import LoginForm from "./LoginForm";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast();
  
  const { 
    data: userData, 
    isLoading: userLoading, 
    isError: userError 
  } = useCurrentUser();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const user = userData?.user || null;
  const isLoading = userLoading || loginMutation.isPending || registerMutation.isPending;
  const isError = userError && !user; // Only show error if not authenticated

  const login = async (data: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (data: InsertUser) => {
    try {
      await registerMutation.mutateAsync(data);
      toast({
        title: "Account created!",
        description: "Welcome to CashFlowPilot! You have been automatically logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isError,
    login,
    register,
    logout,
  };

  // Show login form if user is not authenticated and not loading
  if (!user && !userLoading) {
    return (
      <AuthContext.Provider value={value}>
        <LoginForm
          onLogin={login}
          onRegister={register}
          isLoading={isLoading}
          error={loginMutation.error?.message || registerMutation.error?.message}
        />
      </AuthContext.Provider>
    );
  }

  // Show loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


