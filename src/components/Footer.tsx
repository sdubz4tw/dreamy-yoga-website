"use client";

import React from "react";
import Link from "next/link";
import { YogaContent } from "@/types";

interface FooterProps {
  content: YogaContent | null;
}

export default function Footer({ content }: FooterProps) {
  const studioBranding = content?.studioName || "Yoga Sanctuary";
  const sage = content?.themePrimary || "#8C7A6B";
  const bg = content?.themeBackground || "#0B0807";
  const text = content?.themeText || "#E5E0D8";

  return (
    <footer
      className="w-full border-t py-16 px-8 md:px-16 mt-auto transition-colors"
      style={{ backgroundColor: bg, borderColor: `${sage}20` }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            href="/"
            className="font-serif text-xl tracking-[0.2em] font-semibold uppercase hover:opacity-80 transition-opacity"
            style={{ color: text }}
          >
            {studioBranding}
          </Link>
          <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: `${text}80` }}>
            {content?.footerTagline || "Peace • Alignment • Somatic Wisdom"}
          </span>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: `${text}B3` }}>
          <Link href="/" className="hover:opacity-100 transition-opacity">Home</Link>
          <Link href="/about" className="hover:opacity-100 transition-opacity">About</Link>
          <Link href="/offerings" className="hover:opacity-100 transition-opacity">Offerings</Link>
          <Link href="/portfolio" className="hover:opacity-100 transition-opacity">Portfolio</Link>
          <Link href="/blog" className="hover:opacity-100 transition-opacity">Journal</Link>
          <Link href="/contact" className="hover:opacity-100 transition-opacity">Contact</Link>
        </div>

        {/* Social Links & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-3">
          {content?.socialEnabled && (
            <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: sage }}>
              {content.socialInstagram && (
                <a href={`https://instagram.com/${content.socialInstagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Instagram
                </a>
              )}
              {content.socialYoutube && (
                <a href={content.socialYoutube.startsWith('http') ? content.socialYoutube : `https://${content.socialYoutube}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  YouTube
                </a>
              )}
              {content.socialFacebook && (
                <a href={content.socialFacebook.startsWith('http') ? content.socialFacebook : `https://${content.socialFacebook}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Facebook
                </a>
              )}
            </div>
          )}
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${text}60` }}>
            © {new Date().getFullYear()} {studioBranding}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
