"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useYogaContent } from "@/components/useYogaContent";
import { BlogPostItem } from "@/types";

export default function BlogPage() {
  const { content } = useYogaContent();
  const [activePost, setActivePost] = useState<BlogPostItem | null>(null);

  const sage = content?.themePrimary || "#8C7A6B";
  const bg = content?.themeBackground || "#0B0807";
  const card = content?.themeCard || "#161210";
  const text = content?.themeText || "#E5E0D8";

  const publishedPosts = content?.blogPosts?.filter((post) => post.status !== "draft") || [];

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: bg, color: text }}>
      <Header content={content} />

      <main className="flex-1 flex flex-col items-center">
        {/* Dedicated Blog Hero Header */}
        <section className="py-20 md:py-28 px-8 md:px-16 text-center max-w-4xl mx-auto w-full">
          <span className="text-xs uppercase tracking-[0.35em] font-bold block mb-4" style={{ color: sage }}>
            {content?.blogTagline || "Insights"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif tracking-wider font-normal mb-6" style={{ color: text }}>
            {content?.blogHeading || "The Philosophy Journal"}
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto tracking-wide mb-6" style={{ color: `${text}A6` }}>
            {content?.blogSubtitle || "Essays, research notes, and reflections on somatic anatomy and mindful living."}
          </p>
          <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: sage }} />
        </section>

        {/* Blog Posts Grid */}
        <section className="pb-24 px-8 md:px-16 max-w-7xl mx-auto w-full">
          {publishedPosts.length === 0 ? (
            <p className="text-center text-xs opacity-50 py-16 uppercase tracking-widest">No articles published yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className="group cursor-pointer rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm"
                  style={{ backgroundColor: card, borderColor: `${sage}20` }}
                >
                  <div>
                    {post.featuredImage && (
                      <div className="w-full aspect-[16/10] overflow-hidden border-b" style={{ borderColor: `${sage}15` }}>
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-center justify-between gap-2 mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: sage }}>
                        <span>{post.category || "Article"}</span>
                        <span>{post.date}</span>
                      </div>
                      <h2 className="font-serif text-xl tracking-wide font-normal mb-3 group-hover:opacity-80 transition-opacity" style={{ color: text }}>
                        {post.title}
                      </h2>
                      <p className="text-xs leading-relaxed tracking-wide font-normal line-clamp-3" style={{ color: `${text}99` }}>
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-8 pt-0 flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em]" style={{ color: sage }}>
                    <span>Read Article ✦</span>
                    <span className="text-[10px] opacity-60">{post.readTime || "5 min read"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Blog Post Detail Modal Reader */}
        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" style={{ backgroundColor: `${bg}F2`, backdropFilter: "blur(12px)" }}>
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border p-8 md:p-12 shadow-2xl relative" style={{ backgroundColor: card, borderColor: `${sage}40` }}>
              <button
                onClick={() => setActivePost(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold transition-all hover:rotate-90"
                style={{ borderColor: `${sage}40`, color: text }}
                aria-label="Close article"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-4 text-xs uppercase font-bold tracking-[0.2em]" style={{ color: sage }}>
                <span>{activePost.category}</span>
                <span>•</span>
                <span>{activePost.date}</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-serif tracking-wide mb-6 font-normal" style={{ color: text }}>
                {activePost.title}
              </h2>

              {activePost.featuredImage && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8 border" style={{ borderColor: `${sage}30` }}>
                  <img src={activePost.featuredImage} alt={activePost.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="text-sm leading-relaxed tracking-wide font-normal whitespace-pre-line space-y-4" style={{ color: `${text}E6` }}>
                {activePost.content || activePost.excerpt}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer content={content} />
    </div>
  );
}
