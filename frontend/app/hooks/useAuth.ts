import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  plan: string;
  agentLimit: number;
  domains: string[];
}

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
      // Fetch user profile
      axios
        .get("http://localhost:5000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          // If token is invalid or expired, log out
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }

    // Check if user is trying to access login or register page while logged in
    const currentPath = window.location.pathname;
    if (token && (currentPath === "/login" || currentPath === "/register")) {
      router.push("/");
    }
  }, [router]);

  return { isLoggedIn, user, loading };
};
