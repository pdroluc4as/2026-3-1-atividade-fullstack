"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { SearchBar } from "@/features/home/components/search-bar";

interface HeaderProps {
  activePath?: string;
}

export default function Header({ activePath }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Esconde o header ao rolar para baixo
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

  // Fecha a barra ao clicar fora dela
  useEffect(() => {
    if (!searchOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  return (
    <header
      className={`md:hidden fixed left-0 top-0 z-50 w-full bg-primary shadow-sm transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="text-lg font-semibold tracking-wide">DIATINF X</span>
          </Link>

          {/* Botão lupa */}
          <button
            type="button"
            aria-label={searchOpen ? "Fechar pesquisa" : "Abrir pesquisa"}
            onClick={() => setSearchOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            {searchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Barra de pesquisa expansível */}
        <div
          ref={searchWrapperRef}
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            searchOpen ? "max-h-20 pb-3 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <Suspense fallback={null}>
            <SearchBar variant="header" />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
