"use client";

import { useEffect, useState } from "react";
import { getUserFromCookie } from "@/lib/utils";
import { House } from "lucide-react";

interface UserPayload {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface HeaderCompProps {
  title?: string;
  path?: string;
}

export default function HeaderComp({ title, path }: HeaderCompProps) {
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    const u = getUserFromCookie();
    setUser(u as UserPayload | null);
  }, []);

  return (
    <div className="bg-primary px-6 py-10">
      {title ? (
        <div className="-mt-4 mb-4">
          <h1 className="text-xl font-bold text-white sm:text-xl">
            {title} Management
          </h1>
          {path && (
            <nav className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
              <House className="size-4" />
              <span className="text-white/40">/</span>
              {path.split(" > ").map((segment, i, arr) => (
                <span key={segment} className="flex items-center gap-1.5">
                  <span>{segment}</span>
                  {i < arr.length - 1 && (
                    <span className="text-white/40">/</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      ) : (
        <span className="text-lg font-semibold text-white">
          Hi, {user?.name ?? "Pengguna"}
          <br />
          <br />
        </span>
      )}
    </div>
  );
}
