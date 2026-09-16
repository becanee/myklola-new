"use client";

import { useEffect, useState } from "react";
import { getUserFromCookie } from "@/lib/utils";

interface UserPayload {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export default function HeaderComp(props?: any) {
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    const u = getUserFromCookie();
    setUser(u as UserPayload | null);
  }, []);

  return (
    <div className="bg-primary p-14">
      <div className="-mt-6">
        <span className="text-white">
          Hi, {user?.name ?? "Pengguna"}
        </span>
      </div>
    </div>
  );
}
