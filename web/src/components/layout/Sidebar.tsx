"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { headerLinks } from "@/data/header";
import { cn } from "@/lib/cn";

export default function Sidebar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      const token = window.localStorage.getItem("token");
      const storedAvatar = window.localStorage.getItem("avatarUrl");

      setIsLoggedIn(Boolean(token));
      setAvatarUrl(storedAvatar ?? null);
    };

    syncAuthState();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "avatarUrl") {
        syncAuthState();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", syncAuthState);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  const navItems = headerLinks.map((item) => {
    if (item.href === "/login") {
      return {
        ...item,
        href: isLoggedIn ? "/profile" : "/login",
        label: "Perfil",
      };
    }

    return item;
  });

  return (
    <aside className="sticky top-0 hidden min-h-screen w-72 shrink-0 border-r border-primary/20 bg-primary p-5 text-white md:flex md:flex-col">
      <div className="mb-10 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-2xl font-bold tracking-wide">DIATINF X</span>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isProfileItem = item.href === "/profile" && isLoggedIn;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-tertiary"
                  : "text-white/80 hover:bg-white/5 hover:text-white",
              )}
            >
              {isProfileItem ? (
                avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar do usuário"
                    className="h-7 w-7 rounded-full border border-white/60 object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white/10 text-[10px] font-semibold text-white">
                    U
                  </div>
                )
              ) : Icon ? (
                <Icon className="h-5 w-5" />
              ) : null}

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
