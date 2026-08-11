"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useYogaContent } from "@/components/useYogaContent";

export default function PortfolioPage() {
  const { content } = useYogaContent();
  const [activeFilter, setActiveFilter] = useState("All");

  const sage = content?.themePrimary || "#8C7A6B";
  const bg = content?.themeBackground || "#0B0807";
  const text = content?.themeText || "#E5E0D8";

  const categories = ["All", ...Array.from(new Set(content?.portfolio?.map((item) => item.category).filter(Boolean) || []))];

  const filteredItems = content?.portfolio?.filter(
    (item) => activeFilter === "All" || item.category === activeFilter
  ) || [];

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: bg, color: text }}>
      <Header content={content} />

      <main className="flex-1 flex flex-col items-center">
        {/* Dedicated Portfolio Hero Header */}
        <section className="py-20 md:py-28 px-8 md:px-16 text-center max-w-4xl mx-auto w-full">
          <span className="text-xs uppercase tracking-[0.35em] font-bold block mb-4" style={{ color: sage }}>
            {content?.portfolioTagline || "Visual Sanctuary"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif tracking-wider font-normal mb-6" style={{ color: text }}>
            {content?.portfolioHeading || "Portfolio Gallery"}
          </h1>
          <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: sage }} />
        </section>

        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 px-8 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] rounded-full border transition-all cursor-pointer ${
                  activeFilter === cat ? "shadow-sm" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: activeFilter === cat ? sage : "transparent",
                  color: activeFilter === cat ? bg : text,
                  borderColor: `${sage}40`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Portfolio Visual Grid */}
        <section className="pb-24 px-8 md:px-16 max-w-7xl mx-auto w-full">
          {filteredItems.length === 0 ? (
            <p className="text-center text-xs opacity-50 py-16 uppercase tracking-widest">No photos in this category</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-[4/5] rounded-3xl overflow-hidden border shadow-sm transition-transform duration-300 hover:-translate-y-1"
                  style={{ borderColor: `${sage}25` }}
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-300 opacity-90 group-hover:opacity-100"
                    style={{ background: `linear-gradient(to top, ${bg}F0 0%, ${bg}00 70%)` }}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] mb-1" style={{ color: sage }}>
                      {item.category}
                    </span>
                    <h2 className="font-serif text-lg tracking-wide font-normal" style={{ color: text }}>
                      {item.title}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer content={content} />
    </div>
  );
}
