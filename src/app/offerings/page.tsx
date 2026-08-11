"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useYogaContent } from "@/components/useYogaContent";

export default function OfferingsPage() {
  const { content } = useYogaContent();

  const sage = content?.themePrimary || "#8C7A6B";
  const bg = content?.themeBackground || "#0B0807";
  const card = content?.themeCard || "#161210";
  const text = content?.themeText || "#E5E0D8";

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: bg, color: text }}>
      <Header content={content} />

      <main className="flex-1 flex flex-col items-center">
        {/* Dedicated Offerings Hero Header */}
        <section className="py-20 md:py-28 px-8 md:px-16 text-center max-w-4xl mx-auto w-full">
          <span className="text-xs uppercase tracking-[0.35em] font-bold block mb-4" style={{ color: sage }}>
            {content?.offeringsTagline || "Curated Programs"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif tracking-wider font-normal mb-6" style={{ color: text }}>
            {content?.offeringsHeading || "Bespoke Offerings"}
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto tracking-wide mb-6" style={{ color: `${text}A6` }}>
            {content?.offeringsSubtitle || "Quiet spaces and custom sequences created to align physical posture, mental pacing, and sensory stillness."}
          </p>
          <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: sage }} />
        </section>

        {/* Offerings Cards Grid */}
        <section className="pb-24 px-8 md:px-16 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content?.offerings?.map((item) => (
              <div
                key={item.id}
                className="p-8 md:p-10 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm"
                style={{ backgroundColor: card, borderColor: `${sage}20` }}
              >
                <div>
                  {item.image && (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 border" style={{ borderColor: `${sage}20` }}>
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="font-serif text-2xl tracking-wide font-normal" style={{ color: text }}>
                      {item.title}
                    </h2>
                    {item.price > 0 && (
                      <span className="text-sm font-bold tracking-widest uppercase" style={{ color: sage }}>
                        ${item.price}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed tracking-wide font-normal mb-8" style={{ color: `${text}99` }}>
                    {item.description}
                  </p>
                </div>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] border-b pb-1 self-start transition-colors"
                  style={{ color: sage, borderColor: `${sage}40` }}
                >
                  {content?.offeringsCtaLabel || "Inquire Space"} ✦
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer content={content} />
    </div>
  );
}
