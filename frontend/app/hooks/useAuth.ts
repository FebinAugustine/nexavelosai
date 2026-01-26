import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Check if user is trying to access login or register page while logged in
    const currentPath = window.location.pathname;
    if (token && (currentPath === "/login" || currentPath === "/register")) {
      router.push("/");
    }
  }, [router]);

  return isLoggedIn;
};
