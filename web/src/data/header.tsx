import type { LucideIcon } from "lucide-react";
import { House, LayoutDashboard, NotebookPen, LogIn } from "lucide-react";

export type NavIcon = LucideIcon;

export interface NavigationItem {
  label: string;
  href: string;
  icon?: NavIcon;
}

export const headerLinks: NavigationItem[] = [
  { label: "Home", href: "/", icon: House },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Posts", href: "/posts", icon: NotebookPen },
  { label: "Perfil", href: "/login", icon: LogIn },
];
