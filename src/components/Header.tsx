"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { YogaContent } from "@/types";

interface HeaderProps {
  content: YogaContent | null;
}

export default function Header({ content }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studioBranding = content?.studioName || "Yoga Sanctuary";
  const sage = content?.themePrimary || "#8C7A6B";
  const bg = content?.themeBackground || "#0B0807";
  const text = content?.themeText || "#E5E0D8";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about", hide: content?.hideAbout },
    { label: "Offerings", href: "/offerings", hide: content?.hideOfferings },
    { label: "Portfolio", href: "/portfolio", hide: content?.hidePortfolio },
    { label: "Journal", href: "/blog", hide: content?.hideBlog },
    { label: "Contact", href: "/contact" },
  ].filter((link) => !link.hide);

  return (
    <header
      className="w-full border-b py-6 px-6 md:px-16 backdrop-blur-md sticky top-0 z-40 transition-colors"
      style={{ backgroundColor: `${bg}EE`, borderColor: `${sage}30` }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl md:text-2xl tracking-[0.25em] font-semibold uppercase hover:opacity-80 transition-opacity"
          style={{ color: text }}
        >
          {studioBranding}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative py-1 ${
                  isActive ? "opacity-100 font-extrabold" : "opacity-70 hover:opacity-100"
                }`}
                style={{ color: text }}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: sage }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden sm:inline-block px-5 py-2.5 border text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-full"
            style={{ borderColor: sage, color: sage }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = sage;
              e.currentTarget.style.color = bg;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = sage;
            }}
          >
            {content?.navCtaLabel || "Book Session"}
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-sm uppercase tracking-widest font-bold"
            style={{ color: text }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? "✕ Close" : "☰ Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden mt-4 pt-4 border-t flex flex-col gap-4 pb-2"
          style={{ borderColor: `${sage}20` }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold uppercase tracking-[0.2em] py-2 px-2 rounded hover:bg-white/5"
              style={{ color: text }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="sm:hidden text-center py-3 border text-xs font-bold uppercase tracking-[0.15em] rounded-full mt-2"
            style={{ borderColor: sage, color: sage }}
          >
            {content?.navCtaLabel || "Book Session"}
          </Link>
        </nav>
      )}
    </header>
  );
}
