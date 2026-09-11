"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { headerLinks } from "@/data/header";
import { cn } from "@/lib/cn";

interface MobileMenuProps {
  activePath?: string;
}

export default function MobileMenu({ activePath }: MobileMenuProps) {
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
    window.addEventListener("auth-change", syncAuthState);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", syncAuthState);
      window.removeEventListener("auth-change", syncAuthState);
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral/40 bg-primary/95 px-3 py-2 backdrop-blur-sm md:hidden">
      <nav className="flex items-center justify-around gap-2">
        {navItems.map((item) => {
          const currentPath = activePath ?? pathname;
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(`${item.href}/`);
          const isProfileItem = item.href === "/profile" && isLoggedIn;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 items-center justify-center rounded-lg px-2 py-2 transition-colors",
                isActive ? "text-tertiary" : "text-white/80 hover:text-white",
              )}
            >
              <span className="flex flex-col items-center gap-1 text-[11px] font-medium">
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
                ) : item.icon ? (
                  <item.icon width={18} height={18} />
                ) : null}

                <span
                  className={cn(isActive ? "text-tertiary" : "text-white/80")}
                >
                  {item.label}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
