"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import type { NavigationItem } from "@/data/header";

interface NavbarProps {
  items: NavigationItem[];
  activePath?: string;
  className?: string;
}

export default function Navbar({ items, activePath, className }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-4 md:gap-8", className)}>
      {items.map((item) => {
        const currentPath = activePath ?? pathname;
        const isActive =
          currentPath === item.href || currentPath.startsWith(`${item.href}/`);

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors",
              isActive
                ? "border-b-2 border-tertiary pb-1 text-tertiary"
                : "text-white/80 hover:text-white md:text-neutral",
            )}
          >
            <span className="flex flex-col items-center gap-1 text-[11px] font-medium md:text-[15px]">
              {Icon && <Icon width={18} height={18} className="md:hidden" />}
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
