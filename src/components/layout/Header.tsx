"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ShopMenu from "./ShopMenu";
import SearchDropdown from "./SearchDropdown";
import type { HeaderSection } from "@/lib/live-edit/homepage";
import { DEFAULT_HEADER } from "@/lib/live-edit/site-chrome";

type Props = {
  data?: Partial<HeaderSection> | null;
};

export default function Header({ data }: Props) {
  const cfg = { ...DEFAULT_HEADER, ...data };
  const [accountOpen, setAccountOpen] = useState(false);
  const { openCart, itemCount } = useCart();
  const { isLoggedIn, customerName, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [headerBottom, setHeaderBottom] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setQuery("");
    setSearchFocused(false);
  }, [pathname]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const q = query.trim();
    if (!q) return;
    setSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    const updateHeaderBottom = () => {
      if (headerRef.current)
        setHeaderBottom(headerRef.current.getBoundingClientRect().bottom);
    };
    updateHeaderBottom();
    window.addEventListener("resize", updateHeaderBottom);
    return () => window.removeEventListener("resize", updateHeaderBottom);
  }, []);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 20);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    if (!searchFocused) return;
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchFocused(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchFocused]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-30 hidden desk:block transition-all duration-300 ${
        scrolled
          ? "bg-white/70 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center py-3.5 relative z-[100] gap-3">
          <div className="flex-none flex items-center">
            <Link href="/" className="flex items-center no-underline">
              <Image
                src={cfg.logoDesktop}
                alt={cfg.logoAlt}
                width={180}
                height={44}
                className="h-11 w-auto object-contain"
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          <div className="flex-1 flex items-center gap-0.5 min-w-0 min-[1400px]:justify-end">
            <div
              ref={searchRef}
              className="relative flex-1 min-w-0 pl-[15%] min-[1400px]:absolute min-[1400px]:left-1/2 min-[1400px]:top-1/2 min-[1400px]:-translate-x-1/2 min-[1400px]:-translate-y-1/2 min-[1400px]:w-[340px] min-[1400px]:flex-none min-[1400px]:pl-0"
            >
              <div className="flex items-center bg-[#f4f5f7] rounded-[30px] px-5 py-2.5">
                <button
                  type="button"
                  className="text-gray-500 mr-2.5 hover:text-[#d32f2f] transition-colors"
                >
                  <Image
                    src="/images/compare-icons/search-icon.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                  />
                </button>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={cfg.searchPlaceholder}
                  autoComplete="off"
                  className="border-none bg-transparent outline-none flex-1 text-[15px] text-gray-700 placeholder-gray-400"
                />
              </div>
              {searchFocused && (
                <SearchDropdown
                  query={query}
                  onNavigate={() => setSearchFocused(false)}
                />
              )}
            </div>

            <div className="flex-none shrink-0 flex items-center gap-5">
              <ShopMenu headerBottom={headerBottom} />

              <Link
                href={cfg.orderTrackHref || "/order-track"}
                className="flex items-center gap-1.5 font-semibold text-[15px] text-[#d32f2f] whitespace-nowrap hover:text-[#b71c1c] transition-colors no-underline"
              >
                <Image
                  src={cfg.orderTrackIcon}
                  alt=""
                  width={18}
                  height={18}
                  className="w-[18px] h-[18px]"
                />
                {cfg.orderTrackLabel}
              </Link>

              <Link
                href={cfg.pcBuilderHref || "/pc-builder"}
                className="border-[1.8px] border-[#d32f2f] text-[#d32f2f] bg-white px-5 py-[9px] rounded-[30px] font-bold text-[13px] hover:bg-[#d32f2f] hover:text-white transition-all whitespace-nowrap"
              >
                {cfg.pcBuilderLabel}
              </Link>

              <button
                type="button"
                onClick={openCart}
                className="relative w-11 h-11 bg-[#f4f5f7] rounded-full flex items-center justify-center hover:bg-[#e8eaed] transition-colors cursor-pointer"
              >
                <Image
                  src="/images/catalog/view/theme/default/image/cart-icon.svg"
                  alt="Cart"
                  width={22}
                  height={22}
                  className="w-1/2"
                />
                {itemCount > 0 ? (
                  <span className="absolute -top-1.5 right-0 bg-[#d32f2f] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white leading-none">
                    {itemCount}
                  </span>
                ) : (
                  <span className="absolute -top-0.5 right-0 w-4 h-4 bg-[#d32f2f] rounded-full border-2 border-white" />
                )}
              </button>

              <div
                className="relative"
                onMouseEnter={() => setAccountOpen(true)}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="w-11 h-11 bg-[#f4f5f7] rounded-full flex items-center justify-center hover:bg-[#e8eaed] transition-colors cursor-pointer"
                >
                  <Image
                    src="/images/catalog/view/theme/default/image/account-icon.svg"
                    alt="Account"
                    width={22}
                    height={22}
                    className="w-1/2"
                  />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full bg-white border-[1.5px] border-gray-200 rounded-[10px] shadow-[0_8px_28px_rgba(0,0,0,0.13)] min-w-[175px] z-[1200] py-1.5">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-2 text-[12px] text-gray-400 truncate border-b border-gray-100 mb-1">
                          {customerName}
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-[9px] px-4 py-2.5 text-[13px] font-medium text-gray-900 no-underline hover:bg-[#f5f6fa] hover:text-[#d32f2f] transition-colors"
                        >
                          <span className="mi text-[17px] text-gray-400">
                            dashboard
                          </span>
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-[9px] px-4 py-2.5 text-[13px] font-medium text-gray-900 no-underline hover:bg-[#f5f6fa] hover:text-[#d32f2f] transition-colors"
                        >
                          <span className="mi text-[17px] text-gray-400">
                            shopping_bag
                          </span>
                          Orders
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setAccountOpen(false);
                            router.push("/");
                          }}
                          className="flex w-full items-center gap-[9px] px-4 py-2.5 text-[13px] font-medium text-gray-900 hover:bg-[#f5f6fa] hover:text-[#d32f2f] transition-colors cursor-pointer bg-transparent border-0 text-left"
                        >
                          <span className="mi text-[17px] text-gray-400">
                            logout
                          </span>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center gap-[9px] px-4 py-2.5 text-[13px] font-medium text-gray-900 no-underline hover:bg-[#f5f6fa] hover:text-[#d32f2f] transition-colors"
                        >
                          <span className="mi text-[17px] text-gray-400">
                            lock
                          </span>
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center gap-[9px] px-4 py-2.5 text-[13px] font-medium text-gray-900 no-underline hover:bg-[#f5f6fa] hover:text-[#d32f2f] transition-colors"
                        >
                          <span className="mi text-[17px] text-gray-400">
                            person_add
                          </span>
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
