"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { headerLinks } from "@/data/header";
import Navbar from "@/components/layout/Navbar";

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1.5-3 4-4.5 7-4.5S17.5 17 19 20" />
    </svg>
  );
}

interface HeaderProps {
  activePath?: string;
}

export default function Header({ activePath }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(!(currentScrollY > lastScrollY && currentScrollY > 100));
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, []);

  return (
    <header
      className={`md:hidden fixed left-0 top-0 z-50 w-full bg-primary shadow-sm transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-center">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="text-lg font-semibold tracking-wide">
              DIATINF X
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
