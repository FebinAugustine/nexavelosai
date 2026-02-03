"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  plan: string;
  agentLimit: number;
  domains: string[];
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
          router.push("/login");
        }
        return;
      }

      const response = await axios.get("http://localhost:5000/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);

      // Role-based redirection logic
      if (response.data.role === 'admin' && !pathname.startsWith('/admin')) {
        router.push('/admin/dashboard');
      } else if (response.data.role !== 'admin' && pathname.startsWith('/admin')) {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast.error("Session expired or failed to load user data.");
      localStorage.removeItem("token");
      setUser(null);
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [pathname]); // Re-fetch user on path change to apply role checks

  const refetchUser = () => {
    fetchUserProfile();
  };

  return (
    <AuthContext.Provider value={{ user, loading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
