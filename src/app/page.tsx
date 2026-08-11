"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useYogaContent } from "@/components/useYogaContent";

export default function Home() {
  const { content, isLoading } = useYogaContent();

  if (isLoading) {
    return <div className="flex-1 min-h-screen bg-[#0B0807]" />;
  }

  const currentContent = content;
  if (!currentContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0B0807] p-8 text-center text-[#E5E0D8]">
        <h1 className="text-2xl font-serif mb-3 tracking-wide">Sanctuary Disconnected</h1>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#8C7A6B] text-[#0B0807] text-xs font-bold uppercase rounded-full tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const sage = currentContent.themePrimary || "#8C7A6B";
  const bg = currentContent.themeBackground || "#0B0807";
  const card = currentContent.themeCard || "#161210";
  const text = currentContent.themeText || "#E5E0D8";
  const studioBranding = currentContent.studioName || "Yoga Sanctuary";

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: bg, color: text }}>
      <Header content={currentContent} />

      <main className="flex-1 flex flex-col items-center">
        {/* 1. Hero Section */}
        {!currentContent.hideHero && (
          <section
            className="relative w-full py-32 md:py-48 px-8 md:px-16 flex flex-col items-center text-center justify-center overflow-hidden min-h-[75vh]"
            style={{
              backgroundImage: currentContent.heroImageUrl ? `url(${currentContent.heroImageUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {currentContent.heroImageUrl && (
              <div className="absolute inset-0 -z-10" style={{ backgroundColor: `${bg}D9` }} />
            )}
            {!currentContent.heroImageUrl && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl -z-10 pointer-events-none opacity-5"
                style={{ backgroundColor: sage }}
              />
            )}
            <div className="max-w-4xl flex flex-col items-center gap-8 md:gap-10 z-10">
              <span className="text-xs uppercase tracking-[0.35em] font-bold" style={{ color: sage }}>
                {currentContent.heroTagline || "✦ Mindful Movement & Somatic Alignment"}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-wider leading-[1.2] font-normal" style={{ color: text }}>
                {currentContent.heroTitle}
              </h1>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl tracking-wide" style={{ color: `${text}B3` }}>
                {currentContent.heroSubtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link
                  href="/contact"
                  className="px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-sm"
                  style={{ backgroundColor: sage, color: bg }}
                >
                  {currentContent.heroCtaLabel || "Book a Session"}
                </Link>
                <Link
                  href="/about"
                  className="px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full border"
                  style={{ borderColor: `${sage}60`, color: text }}
                >
                  Explore Philosophy
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 2. Multi-Page Navigation Preview Cards */}
        <section className="py-20 px-8 md:px-16 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em]" style={{ color: sage }}>
              Somatic Portal
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-wide" style={{ color: text }}>
              Explore Sanctuary Pages
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* About Card */}
            {!currentContent.hideAbout && (
              <Link
                href="/about"
                className="group p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm"
                style={{ backgroundColor: card, borderColor: `${sage}20` }}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] block mb-3" style={{ color: sage }}>
                    01 • Instructor
                  </span>
                  <h3 className="font-serif text-2xl tracking-wide font-normal mb-3 group-hover:opacity-80 transition-opacity" style={{ color: text }}>
                    About & Bio
                  </h3>
                  <p className="text-xs leading-relaxed opacity-70">
                    Discover our somatic anatomy foundation, skeletal alignment lineage, and restorative teaching philosophy.
                  </p>
                </div>
                <span className="mt-8 text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: sage }}>
                  Learn More ✦
                </span>
              </Link>
            )}

            {/* Offerings Card */}
            {!currentContent.hideOfferings && (
              <Link
                href="/offerings"
                className="group p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm"
                style={{ backgroundColor: card, borderColor: `${sage}20` }}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] block mb-3" style={{ color: sage }}>
                    02 • Curated
                  </span>
                  <h3 className="font-serif text-2xl tracking-wide font-normal mb-3 group-hover:opacity-80 transition-opacity" style={{ color: text }}>
                    Offerings
                  </h3>
                  <p className="text-xs leading-relaxed opacity-70">
                    Private 1-on-1 alignment, group flows, sound bath immersions, and somatic breathwork.
                  </p>
                </div>
                <span className="mt-8 text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: sage }}>
                  View Services ✦
                </span>
              </Link>
            )}

            {/* Portfolio Card */}
            {!currentContent.hidePortfolio && (
              <Link
                href="/portfolio"
                className="group p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm"
                style={{ backgroundColor: card, borderColor: `${sage}20` }}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] block mb-3" style={{ color: sage }}>
                    03 • Sanctuary
                  </span>
                  <h3 className="font-serif text-2xl tracking-wide font-normal mb-3 group-hover:opacity-80 transition-opacity" style={{ color: text }}>
                    Visual Gallery
                  </h3>
                  <p className="text-xs leading-relaxed opacity-70">
                    Immerse in our visual photo gallery of studio spaces, workshops, and movement posture stills.
                  </p>
                </div>
                <span className="mt-8 text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: sage }}>
                  Open Gallery ✦
                </span>
              </Link>
            )}

            {/* Journal Card */}
            {!currentContent.hideBlog && (
              <Link
                href="/blog"
                className="group p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm"
                style={{ backgroundColor: card, borderColor: `${sage}20` }}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] block mb-3" style={{ color: sage }}>
                    04 • Insights
                  </span>
                  <h3 className="font-serif text-2xl tracking-wide font-normal mb-3 group-hover:opacity-80 transition-opacity" style={{ color: text }}>
                    Philosophy Journal
                  </h3>
                  <p className="text-xs leading-relaxed opacity-70">
                    Essays, research notes, and somatic reflections on mechanical tension and nervous system health.
                  </p>
                </div>
                <span className="mt-8 text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: sage }}>
                  Read Articles ✦
                </span>
              </Link>
            )}
          </div>
        </section>

        {/* 3. Testimonials Highlights Section */}
        {!currentContent.hideTestimonials && currentContent.testimonials?.length > 0 && (
          <section className="py-20 px-8 md:px-16 max-w-7xl mx-auto w-full border-t" style={{ borderColor: `${sage}15` }}>
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em]" style={{ color: sage }}>
                {currentContent.testimonialsTagline || "Resonance"}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-wide" style={{ color: text }}>
                {currentContent.testimonialsHeading || "Client Testimonials"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {currentContent.testimonials.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="p-8 rounded-3xl border flex flex-col justify-between"
                  style={{ backgroundColor: card, borderColor: `${sage}20` }}
                >
                  <p className="text-xs leading-relaxed font-serif italic mb-6 opacity-90">
                    "{item.quote}"
                  </p>
                  <div>
                    <span className="text-xs font-bold tracking-wide block" style={{ color: text }}>
                      {item.clientName}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider block opacity-60" style={{ color: sage }}>
                      {item.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer content={currentContent} />
    </div>
  );
}
