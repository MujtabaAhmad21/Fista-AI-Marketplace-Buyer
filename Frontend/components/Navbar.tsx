"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Sparkles, 
  X, 
  ChevronDown,
  Package,
  Headphones,
  SlidersHorizontal,
  Menu
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { name: "All", slug: "all" },
  { name: "Electronics", slug: "Electronics" },
  { name: "Clothing", slug: "Clothing" },
  { name: "Home & Kitchen", slug: "Home & Kitchen" },
  { name: "Sports & Fitness", slug: "Sports & Fitness" },
];

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout, cartCount } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentCategory = searchParams.get("category") || "all";

  // Sync search input if URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleCategorySelect = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug === "all") {
      params.delete("category");
    } else {
      params.set("category", categorySlug);
    }
    router.push(`/?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`/?${params.toString()}`);
  };

  // Get user initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      {/* Top Banner */}
      <div className="bg-[#4C4556] text-[#FEFEFE] dark:bg-[#231C28] dark:text-foreground text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-white/5">
        <span className="inline-block w-2 h-2 rounded-full bg-[#F8CB4F] animate-pulse" />
        <span>Free standard delivery on orders over $50</span>
        <span className="hidden sm:inline text-white/40">•</span>
        <Link 
          href="/support" 
          className="hidden sm:inline-flex items-center gap-1 text-[#F8CB4F] hover:underline font-semibold"
        >
          <Sparkles className="w-3 h-3" /> Meet our 24/7 AI Shopping Assistant
        </Link>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-[#4C4556] dark:text-[#FEFEFE] group-hover:opacity-90 transition-opacity">
                FISTA
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F8CB4F] text-[#241E28] font-bold shadow-xs">
                Marketplace
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full h-10 pl-10 pr-9 text-sm rounded-full bg-secondary/70 hover:bg-secondary focus:bg-background border border-border/80 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none transition-all placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Link */}
            <Link
              href="/support"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-accent/20 hover:bg-accent/30 text-foreground border border-accent/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-[#F8CB4F]" />
              <span>AI Support</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#F8CB4F]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#F8CB4F] text-[#241E28] text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / Sign In */}
            {isAuthenticated && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors"
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-[#4C4556] text-[#FEFEFE] dark:bg-[#F8CB4F] dark:text-[#241E28] font-bold text-xs flex items-center justify-center shadow-xs">
                    {getInitials(user.full_name)}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline-block">
                    {user.full_name.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:inline-block" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-bold text-foreground truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/cart"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span>My Cart ({cartCount})</span>
                      </Link>

                      <Link
                        href="/support"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>AI Assistant & Support</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-border">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button 
                  size="sm"
                  className="rounded-full px-4 h-8 text-xs font-semibold bg-[#4C4556] hover:bg-[#583F52] text-[#FEFEFE] dark:bg-[#F8CB4F] dark:hover:bg-[#f6c236] dark:text-[#241E28] transition-all"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (expanded when menu open or small screen) */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-9 pl-10 pr-9 text-sm rounded-full bg-secondary border border-border focus:border-ring focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Category Navigation Ribbon */}
        {pathname === "/" && (
          <div className="flex items-center gap-2 py-2.5 border-t border-border/60 overflow-x-auto no-scrollbar text-xs">
            <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] pl-1 pr-2 hidden sm:inline shrink-0">
              Categories:
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = (cat.slug === "all" && !searchParams.get("category")) || searchParams.get("category") === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#4C4556] text-[#FEFEFE] dark:bg-[#F8CB4F] dark:text-[#241E28] shadow-xs font-semibold"
                      : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <React.Suspense fallback={<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md h-16" />}>
      <NavbarContent />
    </React.Suspense>
  );
}
