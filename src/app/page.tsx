"use client";

import React, { useState, useEffect } from "react";
import { YogaContent, BlogPostItem } from "@/types";

export default function Home() {
  const [content, setContent] = useState<YogaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Client Blog Post reader modal state
  const [activePost, setActivePost] = useState<BlogPostItem | null>(null);

  // Client like states (local overrides)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});

  // Portfolio client filter state
  const [activePortfolioFilter, setActivePortfolioFilter] = useState("All");

  // Client Inquiry State
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [isInquirySaving, setIsInquirySaving] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" });

  // Fetch content dynamically from Vercel Blob / serverless fallback
  useEffect(() => {
    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to resolve endpoint.");
        return res.json();
      })
      .then((data: YogaContent) => {
        setContent(data);
        
        // Initialize likes cache
        const initialLikes: Record<string, number> = {};
        data.blogPosts?.forEach((post) => {
          initialLikes[post.id] = post.likes || 0;
        });
        setPostLikes(initialLikes);
        
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load content dynamically:", err);
        setIsError(true);
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsInquirySaving(true);
    setInquiryError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.notes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setInquirySubmitted(true);
      } else {
        setInquiryError(result.error || "Failed to submit inquiry message.");
      }
    } catch (err: any) {
      setInquiryError("Failed to connect to inquiry dispatch route. Please retry.");
    } finally {
      setIsInquirySaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", notes: "" });
    setInquirySubmitted(false);
    setInquiryError("");
  };

  // Interactive like clicks handling
  const handleLikeToggle = (postId: string) => {
    const isLiked = likedPosts[postId];
    const currentVal = postLikes[postId] || 0;
    const newVal = isLiked ? Math.max(0, currentVal - 1) : currentVal + 1;

    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPostLikes((prev) => ({ ...prev, [postId]: newVal }));

    if (content) {
      const updatedBlogPosts = content.blogPosts.map((post) => {
        if (post.id === postId) {
          return { ...post, likes: newVal };
        }
        return post;
      });

      const updatedContent = { ...content, blogPosts: updatedBlogPosts };
      setContent(updatedContent);

      // Async sync database JSON
      const dataPayload = new FormData();
      dataPayload.append("content", JSON.stringify(updatedContent));
      fetch("/api/content", {
        method: "POST",
        body: dataPayload,
      }).catch((err) => console.warn("Failed to sync like count to database:", err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0B0807]">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <span className="font-serif text-3xl tracking-[0.2em] text-[#F3EFEA] font-light">✦ ELENA</span>
          <div className="w-16 h-0.5 bg-brand-sage/40" />
          <span className="text-[10px] tracking-widest uppercase text-brand-sage">Entering Sanctuary...</span>
        </div>
      </div>
    );
  }

  const currentContent = content;
  if (!currentContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0B0807] p-8 text-center">
        <h1 className="text-2xl font-serif text-[#F3EFEA] mb-3 tracking-wide">Sanctuary Disconnected</h1>
        <p className="text-sm text-[#F3EFEA]/60 mb-6 max-w-sm">Failed to connect to layout content engine.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-brand-sage hover:bg-brand-sage-hover text-[#111112] text-xs font-bold uppercase rounded-full tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const filteredPortfolio = currentContent.portfolio.filter((item) => {
    return activePortfolioFilter === "All" || item.category === activePortfolioFilter;
  });

  // Filter out drafts from public view
  const publishedPosts = currentContent.blogPosts.filter((post) => post.status !== "draft");

  // Sort featured posts to the top
  const sortedPosts = [...publishedPosts].sort((a, b) => {
    const aFeatured = !!a.isFeatured;
    const bFeatured = !!b.isFeatured;
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    return 0;
  });

  return (
    <div className="flex-1 flex flex-col font-sans bg-transparent">
      {/* 1. Navigation Bar */}
      <header className="w-full border-b border-brand-sage-light/20 py-7 px-8 md:px-16 bg-[#0B0807]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="font-serif text-xl md:text-2xl tracking-[0.25em] text-brand-text font-semibold uppercase">
            Elena Yoga
          </a>

          <nav className="hidden md:flex items-center gap-12">
            <a href="#about" className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text/70 hover:text-brand-text transition-colors">
              About
            </a>
            <a href="#services" className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text/70 hover:text-brand-text transition-colors">
              Offerings
            </a>
            <a href="#portfolio" className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text/70 hover:text-brand-text transition-colors">
              Portfolio
            </a>
            <a href="#testimonials" className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text/70 hover:text-brand-text transition-colors">
              Reviews
            </a>
            <a href="#journal" className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text/70 hover:text-brand-text transition-colors">
              Journal
            </a>
            <a href="#contact" className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text/70 hover:text-brand-text transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-6">
            <a
              href="#contact"
              className="px-6 py-3 border border-brand-sage text-brand-sage hover:bg-brand-sage hover:text-[#111112] text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-full"
            >
              Book Session
            </a>
          </div>
        </div>
      </header>

      {/* 2. Cinematic Hero Section */}
      <section
        className="relative py-36 md:py-52 px-8 md:px-16 flex flex-col items-center text-center justify-center overflow-hidden min-h-[70vh]"
        style={{
          backgroundImage: currentContent.heroImageUrl ? `url(${currentContent.heroImageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {currentContent.heroImageUrl && (
          <div className="absolute inset-0 bg-[#0B0807]/85 -z-10" />
        )}

        {!currentContent.heroImageUrl && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-sage-light/5 blur-3xl -z-10 pointer-events-none" />
        )}

        <div className="max-w-4xl flex flex-col items-center gap-8 md:gap-10 z-10">
          <span className="text-xs uppercase tracking-[0.35em] text-brand-sage font-bold">
            ✦ Mindful Movement & Somatic Alignment
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-brand-text tracking-wider leading-[1.2] font-normal">
            {currentContent.heroTitle}
          </h1>
          <p className="text-sm md:text-base text-brand-text/70 leading-relaxed max-w-2xl tracking-wide">
            {currentContent.heroSubtitle}
          </p>
          <div className="mt-6">
            <a
              href="#contact"
              className="inline-block px-10 py-5 bg-brand-sage text-[#111112] hover:bg-brand-sage-hover text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-full shadow-sm"
            >
              Book a Session
            </a>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
        <div className="w-full h-px bg-brand-sage-light/20" />
      </div>

      {/* 3. Side-by-Side About Me Section */}
      <section id="about" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[380px] aspect-[4/5] rounded-3xl bg-brand-sage-light/10 flex flex-col items-center justify-center relative overflow-hidden shadow-md border border-brand-sage-light/20">
              {currentContent.aboutImageUrl ? (
                <img
                  src={currentContent.aboutImageUrl}
                  alt="Elena Yoga Instructor Profile"
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                <div className="w-full h-full p-10 flex flex-col items-center justify-center">
                  <svg
                    viewBox="0 0 100 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full opacity-40 text-brand-sage/80 stroke-1.5"
                  >
                    <circle cx="50" cy="40" r="16" className="stroke-brand-sage/20 fill-brand-sage/5" />
                    <path
                      d="M50 105C50 75 50 45 50 35M50 85C45 80 32 78 35 70C38 62 48 68 50 68M50 72C55 67 68 65 65 57C62 49 52 55 50 55M50 55C46 50 35 48 37 42C39 36 48 40 50 40"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              <div className="absolute bottom-6 inset-x-6 text-center z-10 bg-[#0B0807]/60 backdrop-blur-xs py-2 rounded-full border border-brand-sage-light/20">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-text">
                  Elena • Founder of Elena Yoga
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-sage font-bold">
              The Instructor
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-text tracking-wide font-normal">
              Hi, I am Elena
            </h2>
            <div className="flex flex-col gap-5 text-sm text-brand-text/75 leading-relaxed max-w-2xl font-normal whitespace-pre-line tracking-wide">
              {currentContent.aboutBioText}
            </div>
            <div className="mt-4">
              <a
                href="#services"
                className="text-xs font-bold uppercase tracking-[0.2em] text-brand-text hover:text-brand-sage transition-colors border-b border-brand-text pb-1 hover:border-brand-sage"
              >
                Explore Offerings
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
        <div className="w-full h-px bg-brand-sage-light/20" />
      </div>

      {/* 4. Offerings Grid Section */}
      <section id="services" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-20">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-sage font-bold">
            Curated Programs
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-text tracking-wide font-normal">
            Bespoke Offerings
          </h2>
          <p className="text-xs md:text-sm text-brand-text/60 leading-relaxed max-w-lg tracking-wide">
            Quiet spaces and custom sequences created to align physical posture, mental pacing, and sensory stillness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {currentContent.offerings.map((offering) => (
            <div
              key={offering.id}
              className="border border-brand-sage-light/35 bg-[#161210] hover:bg-[#161210]/80 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-md min-h-[420px]"
            >
              <div
                className="h-56 w-full bg-[#161210]/50 shrink-0 relative overflow-hidden"
                style={{
                  backgroundImage: offering.image ? `url(${offering.image})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!offering.image && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-sage/5 to-brand-sage-light/20" />
                )}
                {/* Dynamically format flat/hourly rates */}
                <div className="absolute top-4 right-4 bg-[#0B0807] border border-brand-sage-light/30 px-4 py-2 rounded-full text-xs font-bold text-brand-sage shadow-sm font-mono tracking-wider">
                  ${offering.price} {offering.isHourly ? "/ hr" : "flat"}
                </div>
              </div>

              <div className="p-8 md:p-10 flex-1 flex flex-col justify-between gap-8">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl md:text-3xl font-serif text-brand-text tracking-wide group-hover:text-brand-sage transition-colors leading-snug font-normal">
                    {offering.title}
                  </h3>
                  <p className="text-xs md:text-sm text-brand-text/70 leading-relaxed font-normal tracking-wide">
                    {offering.description}
                  </p>
                </div>
                <div>
                  <a
                    href="#contact"
                    className="inline-block text-xs font-bold uppercase tracking-[0.2em] border-b border-brand-text group-hover:border-brand-sage group-hover:text-brand-sage pb-1 transition-colors"
                  >
                    Inquire Space
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
        <div className="w-full h-px bg-brand-sage-light/20" />
      </div>

      {/* 5. Portfolio Gallery Section */}
      <section id="portfolio" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-sage font-bold">
            Visual Sanctuary
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-text tracking-wide font-normal">
            Portfolio Gallery
          </h2>
          <p className="text-xs md:text-sm text-brand-text/60 leading-relaxed max-w-lg tracking-wide">
            Glimpses into our physical studio environments, class alignments, and workshop gatherings.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-12 overflow-x-auto pb-2 scrollbar-none">
          {["All", "Studio", "Classes", "Workshops"].map((filter) => {
            const active = activePortfolioFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActivePortfolioFilter(filter)}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 cursor-pointer ${
                  active
                    ? "bg-brand-sage text-[#111112]"
                    : "bg-brand-sage-light/20 hover:bg-brand-sage-light/35 text-brand-text/70"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPortfolio.length === 0 ? (
            <div className="col-span-full py-20 text-center text-brand-text/40 italic text-sm border border-dashed border-brand-sage-light/25 rounded-3xl">
              No photos loaded under this category yet.
            </div>
          ) : (
            filteredPortfolio.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-3xl overflow-hidden border border-brand-sage-light/20 bg-brand-sage-light/15 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg cursor-pointer"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full p-14 flex items-center justify-center opacity-30 text-brand-sage bg-gradient-to-tr from-brand-sage-light/20 to-transparent">
                    <svg viewBox="0 0 100 120" fill="none" className="w-full h-full stroke-1.5">
                      <circle cx="50" cy="40" r="12" className="stroke-brand-sage/20" />
                      <path d="M50 100C50 70 50 45 50 35M50 85C45 80 32 78 35 70C38 62 48 68 50 68" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                <div className="absolute inset-0 bg-[#111112]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 text-left">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#E5E0D8]/80 font-bold mb-1.5">
                    {item.category}
                  </span>
                  <h4 className="text-xl font-serif text-[#E5E0D8] tracking-wide leading-tight font-normal">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
        <div className="w-full h-px bg-brand-sage-light/20" />
      </div>

      {/* 6. Testimonials Section */}
      <section id="testimonials" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-20">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-sage font-bold">
            Resonance
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-text tracking-wide font-normal">
            Client Testimonials
          </h2>
          <p className="text-xs md:text-sm text-brand-text/60 leading-relaxed max-w-lg tracking-wide">
            Words of gratitude and somatic experiences shared by students practicing within our spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {currentContent.testimonials.map((test) => (
            <div
              key={test.id}
              className="border border-[#26201C] bg-[#161210] p-10 rounded-3xl flex flex-col justify-between gap-8 shadow-sm border-t-4 border-t-brand-sage"
            >
              <div className="flex flex-col gap-5">
                <div className="flex gap-1 text-brand-sage text-sm font-bold tracking-widest">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm italic text-brand-text/80 leading-relaxed font-normal tracking-wide">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-brand-sage-light/10">
                <span className="text-xs font-serif font-bold text-brand-text tracking-wide">
                  {test.clientName}
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-brand-sage font-bold">
                  {test.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
        <div className="w-full h-px bg-brand-sage-light/20" />
      </div>

      {/* 7. Blog / Journal Section (Editorial Stacked Rows) */}
      <section id="journal" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-20">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-sage font-bold">
            Insights
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-text tracking-wide font-normal">
            The Philosophy Journal
          </h2>
          <p className="text-xs md:text-sm text-brand-text/60 leading-relaxed max-w-lg tracking-wide">
            Essays, research notes, and reflections on somatic anatomy and mindful living.
          </p>
        </div>

        {/* Spacious Rounded card panel wrapping the blog layout */}
        <div className="bg-[#110D0B]/85 border border-[#26201C] p-6 md:p-12 lg:p-16 rounded-3xl flex flex-col gap-10">
          {sortedPosts.length === 0 ? (
            <div className="py-20 text-center text-[#8E847C] italic text-sm">
              No journal articles published yet.
            </div>
          ) : (
            sortedPosts.map((post) => {
              const activeLikes = postLikes[post.id] !== undefined ? postLikes[post.id] : (post.likes || 0);
              const hasLiked = !!likedPosts[post.id];

              return (
                /* Full-width Stacked Row card */
                <div
                  key={post.id}
                  className={`bg-[#161210] border p-8 md:p-10 rounded-3xl flex flex-col lg:flex-row gap-8 lg:gap-12 transition-all duration-350 hover:border-brand-sage/40 group shadow-sm items-stretch relative ${
                    post.isFeatured ? "border-brand-sage/40 ring-1 ring-brand-sage/20" : "border-[#26201C]"
                  }`}
                >
                  {/* Left Column: Featured Cover Photo */}
                  <div
                    className="w-full lg:w-80 h-52 lg:h-auto rounded-2xl overflow-hidden shrink-0 relative bg-brand-sage-light/10"
                    style={{
                      backgroundImage: post.featuredImage ? `url(${post.featuredImage})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!post.featuredImage && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-sage/5 to-brand-sage-light/20" />
                    )}
                  </div>

                  {/* Right Column: Article Details */}
                  <div className="flex-1 flex flex-col justify-between gap-6 relative text-left">
                    <div className="flex flex-col gap-3.5">
                      {/* Metadata row (Taupe Color #8E847C with Featured tags) */}
                      <div className="flex flex-wrap items-center gap-2.5 text-[9px] uppercase tracking-[0.25em] text-[#8E847C] font-semibold font-mono">
                        <span>{post.category || "Philosophy"}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime || "5 min read"}</span>
                        {post.isFeatured && (
                          <>
                            <span>•</span>
                            <span className="text-brand-sage font-bold">Featured Pin</span>
                          </>
                        )}
                      </div>

                      {/* Post Title (Striking Serif Off-White #F3EFEA) */}
                      <h3 className="text-2xl md:text-3xl font-serif text-[#F3EFEA] tracking-wide leading-snug group-hover:text-brand-sage transition-colors font-normal">
                        {post.title}
                      </h3>

                      <p className="text-xs md:text-sm text-brand-text/70 leading-relaxed font-normal tracking-wide">
                        {post.excerpt}
                      </p>

                      {/* Tags listing */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {post.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] bg-brand-sage-light/10 border border-brand-sage-light/20 text-[#8E847C] px-2.5 py-0.5 rounded-full font-mono lowercase">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#26201C]">
                      <button
                        onClick={() => setActivePost(post)}
                        className="text-xs font-bold uppercase tracking-[0.2em] text-[#F3EFEA] hover:text-brand-sage transition-colors border-b border-[#F3EFEA] pb-0.5 hover:border-brand-sage cursor-pointer"
                      >
                        Read Post
                      </button>

                      {/* Minimalist Heart/Like counter component */}
                      <button
                        onClick={() => handleLikeToggle(post.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${
                          hasLiked
                            ? "bg-brand-sage/15 border-brand-sage text-brand-sage"
                            : "border-brand-sage-light/30 text-[#8E847C] hover:border-brand-sage/40 hover:text-[#F3EFEA]"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className={`w-3.5 h-3.5 fill-current transition-transform duration-300 ${
                            hasLiked ? "scale-110" : ""
                          }`}
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="text-[10px] font-mono font-bold">{activeLikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
        <div className="w-full h-px bg-brand-sage-light/20" />
      </div>

      {/* 8. Spacio-Minimalist Contact Form Section */}
      <section id="contact" className="py-24 md:py-36 px-8 md:px-16 max-w-lg mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-sage font-bold">
            Begin Journey
          </span>
          <h2 className="text-2xl md:text-4xl font-serif text-brand-text tracking-wide font-normal">
            Book a Session
          </h2>
          <p className="text-xs text-brand-text/60 leading-relaxed tracking-wide">
            Leave your details below, and Elena will get back to coordinate your custom session within 24 hours.
          </p>
        </div>

        {!inquirySubmitted ? (
          <form onSubmit={handleInquirySubmit} className="flex flex-col gap-5 text-left">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/60">Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isInquirySaving}
                className="px-5 py-3.5 bg-brand-sage-light/20 border border-brand-sage-light/35 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text tracking-wide disabled:opacity-40"
                placeholder="Your Name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/60">Email</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isInquirySaving}
                className="px-5 py-3.5 bg-brand-sage-light/20 border border-brand-sage-light/35 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text tracking-wide disabled:opacity-40"
                placeholder="yourname@domain.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/60">Message or Intentions</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                disabled={isInquirySaving}
                rows={4}
                className="px-5 py-3.5 bg-brand-sage-light/20 border border-brand-sage-light/35 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text resize-none tracking-wide disabled:opacity-40"
                placeholder="Any posture goals or intentions..."
              />
            </div>

            {inquiryError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl leading-normal text-left font-normal animate-shake">
                <span className="font-bold block mb-0.5">Submission Error</span>
                {inquiryError}
              </div>
            )}

            <button
              type="submit"
              disabled={isInquirySaving}
              className="w-full mt-2 py-4 bg-brand-sage hover:bg-brand-sage-hover text-[#111112] text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-xl cursor-pointer disabled:opacity-40"
            >
              {isInquirySaving ? "Transmitting..." : "Send Request"}
            </button>
          </form>
        ) : (
          <div className="text-center py-12 flex flex-col items-center gap-5 border border-brand-sage-light/35 rounded-3xl bg-brand-sage-light/20 p-8 animate-fade-in">
            <div className="w-12 h-12 rounded-full border border-brand-sage flex items-center justify-center text-brand-sage text-sm font-bold">
              ✓
            </div>
            <h4 className="text-lg font-serif text-brand-text tracking-wide">Request Transmitted</h4>
            <p className="text-xs text-[#E5E0D8]/70 max-w-sm leading-relaxed tracking-wide">
              Thank you, **{formData.name}**. Elena has received your request and will reach out to **{formData.email}** soon.
            </p>
            <button
              onClick={resetForm}
              className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-sage hover:underline cursor-pointer"
            >
              Reset Form
            </button>
          </div>
        )}
      </section>

      {/* Discreet Footer Entrance (Linking to /admin standalone CMS) */}
      <footer className="border-t border-brand-sage-light/20 py-12 mt-auto text-center text-[10px] text-brand-text/45 uppercase tracking-[0.25em] bg-transparent">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <span>© {new Date().getFullYear()} Elena Yoga. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Peace • Alignment • Somatic Wisdom</span>
            <span>|</span>
            <a
              href="/admin"
              className="text-brand-sage hover:text-brand-sage-hover transition-colors font-bold uppercase tracking-widest text-[10px]"
            >
              Admin Dashboard
            </a>
          </div>
        </div>
      </footer>

      {/* Client Blog Post Reader Modal (Including Author Bio Card) */}
      {activePost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111112] border border-brand-sage-light/35 rounded-3xl max-w-2xl w-full h-[80vh] flex flex-col relative overflow-hidden shadow-2xl">
            {/* Header controls */}
            <div className="p-5 border-b border-brand-sage-light/20 flex justify-between items-center shrink-0 bg-brand-sage-light/10">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-brand-sage font-mono">{activePost.date}</span>
              <button
                onClick={() => setActivePost(null)}
                className="w-8 h-8 rounded-full bg-brand-sage-light/20 text-brand-text hover:bg-brand-sage hover:text-[#111112] flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 text-left">
              <h1 className="text-3xl md:text-4xl font-serif text-[#F3EFEA] leading-snug tracking-wide mb-8">
                {activePost.title}
              </h1>

              {/* Cover Banner */}
              {activePost.featuredImage && (
                <div className="w-full h-72 rounded-2xl overflow-hidden border border-[#26201C] mb-10 shrink-0">
                  <img src={activePost.featuredImage} alt={activePost.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Article text body */}
              <div className="text-sm md:text-base text-brand-text/80 leading-relaxed font-normal whitespace-pre-line flex flex-col gap-5 tracking-wide">
                {activePost.content}
              </div>

              {/* Author Bio Card */}
              {(currentContent.authorName || currentContent.authorBio) && (
                <div className="mt-12 p-6 rounded-2xl bg-brand-sage-light/10 border border-brand-sage-light/20 flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-brand-sage font-bold font-mono">Written by</span>
                  <span className="text-sm font-serif font-bold text-[#F3EFEA]">{currentContent.authorName || "Elena"}</span>
                  <p className="text-xs text-brand-text/70 leading-relaxed font-normal tracking-wide">{currentContent.authorBio}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 my-12 text-brand-sage/35">
                <div className="w-10 h-px bg-brand-sage-light/20" />
                <span className="text-xs">✦</span>
                <div className="w-10 h-px bg-brand-sage-light/20" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
