"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useYogaContent } from "@/components/useYogaContent";

export default function AboutPage() {
  const { content, isLoading } = useYogaContent();

  const sage = content?.themePrimary || "#8C7A6B";
  const bg = content?.themeBackground || "#0B0807";
  const text = content?.themeText || "#E5E0D8";
  const studioBranding = content?.studioName || "Yoga Sanctuary";

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: bg, color: text }}>
      <Header content={content} />

      <main className="flex-1 flex flex-col items-center">
        {/* Dedicated About Hero Header */}
        <section className="py-20 md:py-28 px-8 md:px-16 text-center max-w-4xl mx-auto w-full">
          <span className="text-xs uppercase tracking-[0.35em] font-bold block mb-4" style={{ color: sage }}>
            {content?.aboutTagline || "The Instructor"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif tracking-wider font-normal mb-6" style={{ color: text }}>
            {content?.aboutHeading || "About the Philosophy"}
          </h1>
          <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: sage }} />
        </section>

        {/* About Bio Section */}
        <section className="pb-24 px-8 md:px-16 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="w-full max-w-[400px] aspect-[4/5] rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-lg border"
                style={{ backgroundColor: `${sage}15`, borderColor: `${sage}30` }}
              >
                {content?.aboutImageUrl ? (
                  <img src={content.aboutImageUrl} alt={content?.authorName || "Instructor Profile"} className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  <div className="w-full h-full p-10 flex flex-col items-center justify-center opacity-40" style={{ color: sage }}>
                    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-1.5">
                      <circle cx="50" cy="40" r="16" stroke="currentColor" fill="none" opacity="0.3" />
                      <path d="M50 105C50 75 50 45 50 35M50 85C45 80 32 78 35 70C38 62 48 68 50 68M50 72C55 67 68 65 65 57C62 49 52 55 50 55M50 55C46 50 35 48 37 42C39 36 48 40 50 40" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div
                  className="absolute bottom-6 inset-x-6 text-center z-10 py-2.5 rounded-full border backdrop-blur-md"
                  style={{ backgroundColor: `${bg}99`, borderColor: `${sage}30` }}
                >
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: text }}>
                    {content?.aboutImageSubtitle || `${content?.authorName || "Founder"} •`} {studioBranding}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <div className="flex flex-col gap-5 text-base leading-relaxed font-normal whitespace-pre-line tracking-wide" style={{ color: `${text}D9` }}>
                {content?.aboutBioText || "My teaching path is rooted in somatic anatomy, sensory introspection, and traditional Hatha and Yin lineages."}
              </div>

              {content?.authorBio && (
                <div className="mt-4 p-6 rounded-2xl border" style={{ backgroundColor: `${sage}10`, borderColor: `${sage}25` }}>
                  <p className="text-xs uppercase font-bold tracking-widest mb-2" style={{ color: sage }}>Instructor Bio</p>
                  <p className="text-xs leading-relaxed opacity-80">{content.authorBio}</p>
                </div>
              )}

              <Link
                href="/offerings"
                className="mt-6 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-full transition-colors"
                style={{ backgroundColor: sage, color: bg }}
              >
                {content?.aboutCtaLabel || "Explore Offerings"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer content={content} />
    </div>
  );
}
