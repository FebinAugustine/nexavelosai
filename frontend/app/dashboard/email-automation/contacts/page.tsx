"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmailContactsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/contacts");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to shared contacts...</p>
      </div>
    </div>
  );
}
