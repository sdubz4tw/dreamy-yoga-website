"use client";

import React, { useState, useEffect, useRef } from "react";
import { YogaContent, BlogPostItem } from "@/types";

// Royalty-free audio preset URLs (Freesound CDN / public domain)
const AUDIO_PRESETS: Record<string, string> = {
  "tibetan-bowl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "sacred-gong": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "peace-chimes": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
};

// Preset theme palettes
const THEME_PRESETS = [
  { label: "Dark Espresso", primary: "#8C7A6B", background: "#0B0807", card: "#161210", text: "#E5E0D8", accent: "#6B5D51" },
  { label: "Deep Ocean", primary: "#4A90A4", background: "#050F14", card: "#0D1E26", text: "#D8EBF0", accent: "#2E6B7E" },
  { label: "Forest Sage", primary: "#6B8F71", background: "#070E08", card: "#101A11", text: "#D8EAD9", accent: "#4A6B4F" },
  { label: "Onyx Rose", primary: "#A07080", background: "#0E090B", card: "#1C1014", text: "#EAD8DC", accent: "#7A5060" },
  { label: "Warm Stone", primary: "#B09070", background: "#100E0A", card: "#1E1A14", text: "#EDE5D8", accent: "#8A7050" },
];

export default function Home() {
  const [content, setContent] = useState<YogaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayedRef = useRef(false);

  const [activePost, setActivePost] = useState<BlogPostItem | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});
  const [activePortfolioFilter, setActivePortfolioFilter] = useState("All");

  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [isInquirySaving, setIsInquirySaving] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" });

  useEffect(() => {
    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to resolve endpoint.");
        return res.json();
      })
      .then((data: YogaContent) => {
        setContent(data);
        const initialLikes: Record<string, number> = {};
        data.blogPosts?.forEach((post) => { initialLikes[post.id] = post.likes || 0; });
        setPostLikes(initialLikes);
        setIsLoading(false);
      })
      .catch(() => { setIsLoading(false); });
  }, []);

  // Inject dynamic CSS variables based on theme config
  useEffect(() => {
    if (!content) return;
    const root = document.documentElement;
    if (content.themePrimary) root.style.setProperty("--color-sage", content.themePrimary);
    if (content.themeBackground) root.style.setProperty("--color-bg", content.themeBackground);
    if (content.themeCard) root.style.setProperty("--color-card", content.themeCard);
    if (content.themeText) root.style.setProperty("--color-text", content.themeText);
    if (content.themeAccent) root.style.setProperty("--color-accent", content.themeAccent);
    // Update body background immediately
    document.body.style.backgroundColor = content.themeBackground || "#0B0807";
  }, [content]);

  // Ambient audio: play on first user interaction
  useEffect(() => {
    if (!content?.audioEnabled || !content?.audioPreset) return;

    const audioUrl = AUDIO_PRESETS[content.audioPreset];
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.volume = 0.08;
    audio.loop = true;
    audioRef.current = audio;

    const playOnFirstInteraction = () => {
      if (audioPlayedRef.current) return;
      audioPlayedRef.current = true;
      audio.play().catch(() => {});
      document.removeEventListener("click", playOnFirstInteraction);
      document.removeEventListener("touchstart", playOnFirstInteraction);
      document.removeEventListener("keydown", playOnFirstInteraction);
    };

    document.addEventListener("click", playOnFirstInteraction);
    document.addEventListener("touchstart", playOnFirstInteraction);
    document.addEventListener("keydown", playOnFirstInteraction);

    return () => {
      document.removeEventListener("click", playOnFirstInteraction);
      document.removeEventListener("touchstart", playOnFirstInteraction);
      document.removeEventListener("keydown", playOnFirstInteraction);
      audio.pause();
    };
  }, [content?.audioEnabled, content?.audioPreset]);

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
        body: JSON.stringify({ name: formData.name, email: formData.email, message: formData.notes }),
      });
      const result = await response.json();
      if (response.ok) {
        setInquirySubmitted(true);
      } else {
        setInquiryError(result.error || "Failed to submit inquiry.");
      }
    } catch {
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

  const handleLikeToggle = (postId: string) => {
    const isLiked = likedPosts[postId];
    const currentVal = postLikes[postId] || 0;
    const newVal = isLiked ? Math.max(0, currentVal - 1) : currentVal + 1;
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPostLikes((prev) => ({ ...prev, [postId]: newVal }));
    if (content) {
      const updatedBlogPosts = content.blogPosts.map((post) =>
        post.id === postId ? { ...post, likes: newVal } : post
      );
      const updatedContent = { ...content, blogPosts: updatedBlogPosts };
      setContent(updatedContent);
      const dataPayload = new FormData();
      dataPayload.append("content", JSON.stringify(updatedContent));
      fetch("/api/content", { method: "POST", body: dataPayload }).catch(() => {});
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0B0807]">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <span className="font-serif text-3xl tracking-[0.2em] text-[#F3EFEA] font-light">✦ ELENA</span>
          <div className="w-16 h-0.5 bg-[#8C7A6B]/40" />
          <span className="text-[10px] tracking-widest uppercase text-[#8C7A6B]">Entering Sanctuary...</span>
        </div>
      </div>
    );
  }

  const currentContent = content;
  if (!currentContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0B0807] p-8 text-center">
        <h1 className="text-2xl font-serif text-[#F3EFEA] mb-3 tracking-wide">Sanctuary Disconnected</h1>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-brand-sage text-[#111112] text-xs font-bold uppercase rounded-full tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const filteredPortfolio = currentContent.portfolio.filter(
    (item) => activePortfolioFilter === "All" || item.category === activePortfolioFilter
  );
  const publishedPosts = currentContent.blogPosts.filter((post) => post.status !== "draft");
  const sortedPosts = [...publishedPosts].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  const studioBranding = currentContent.studioName || "Elena Yoga";

  // Read theme-driven CSS variable colors for inline use where Tailwind can't reach
  const sage = currentContent.themePrimary || "#8C7A6B";
  const bg = currentContent.themeBackground || "#0B0807";
  const card = currentContent.themeCard || "#161210";
  const text = currentContent.themeText || "#E5E0D8";

  return (
    <div className="flex-1 flex flex-col font-sans" style={{ backgroundColor: bg, color: text }}>

      {/* Dynamic theme CSS variables override */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --color-sage: ${sage};
            --color-bg: ${bg};
            --color-card: ${card};
            --color-text: ${text};
          }
          .theme-bg { background-color: ${bg}; }
          .theme-text { color: ${text}; }
          .theme-sage { color: ${sage}; }
          .theme-card { background-color: ${card}; }
        `
      }} />

      {/* 1. Navigation Bar */}
      <header
        className="w-full border-b py-7 px-8 md:px-16 backdrop-blur-md sticky top-0 z-30"
        style={{ backgroundColor: `${bg}CC`, borderColor: `${sage}30` }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="font-serif text-xl md:text-2xl tracking-[0.25em] font-semibold uppercase" style={{ color: text }}>
            {studioBranding}
          </a>

          <nav className="hidden md:flex items-center gap-12">
            {!currentContent.hideAbout && (
              <a href="#about" className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-100 opacity-70" style={{ color: text }}>About</a>
            )}
            {!currentContent.hideOfferings && (
              <a href="#services" className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-100 opacity-70" style={{ color: text }}>Offerings</a>
            )}
            {!currentContent.hidePortfolio && (
              <a href="#portfolio" className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-100 opacity-70" style={{ color: text }}>Portfolio</a>
            )}
            {!currentContent.hideTestimonials && (
              <a href="#testimonials" className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-100 opacity-70" style={{ color: text }}>Reviews</a>
            )}
            {!currentContent.hideBlog && (
              <a href="#journal" className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-100 opacity-70" style={{ color: text }}>Journal</a>
            )}
            <a href="#contact" className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-100 opacity-70" style={{ color: text }}>Contact</a>
          </nav>

          <a
            href="#contact"
            className="px-6 py-3 border text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-full"
            style={{ borderColor: sage, color: sage }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = sage; e.currentTarget.style.color = bg; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = sage; }}
          >
            Book Session
          </a>
        </div>
      </header>

      {/* 2. Hero Section */}
      {!currentContent.hideHero && (
        <>
          <section
            className="relative py-36 md:py-52 px-8 md:px-16 flex flex-col items-center text-center justify-center overflow-hidden min-h-[70vh]"
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
                ✦ Mindful Movement & Somatic Alignment
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-wider leading-[1.2] font-normal" style={{ color: text }}>
                {currentContent.heroTitle}
              </h1>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl tracking-wide" style={{ color: `${text}B3` }}>
                {currentContent.heroSubtitle}
              </p>
              <a
                href="#contact"
                className="inline-block mt-6 px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-full shadow-sm"
                style={{ backgroundColor: sage, color: bg }}
              >
                Book a Session
              </a>
            </div>
          </section>
          <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
            <div className="w-full h-px opacity-20" style={{ backgroundColor: sage }} />
          </div>
        </>
      )}

      {/* 3. About Section */}
      {!currentContent.hideAbout && (
        <>
          <section id="about" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
              <div className="lg:col-span-5 flex justify-center">
                <div
                  className="w-full max-w-[380px] aspect-[4/5] rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-md border"
                  style={{ backgroundColor: `${sage}15`, borderColor: `${sage}30` }}
                >
                  {currentContent.aboutImageUrl ? (
                    <img src={currentContent.aboutImageUrl} alt="Elena Yoga Instructor Profile" className="w-full h-full object-cover rounded-3xl" />
                  ) : (
                    <div className="w-full h-full p-10 flex flex-col items-center justify-center opacity-40" style={{ color: sage }}>
                      <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-1.5">
                        <circle cx="50" cy="40" r="16" stroke="currentColor" fill="none" opacity="0.3" />
                        <path d="M50 105C50 75 50 45 50 35M50 85C45 80 32 78 35 70C38 62 48 68 50 68M50 72C55 67 68 65 65 57C62 49 52 55 50 55M50 55C46 50 35 48 37 42C39 36 48 40 50 40" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div
                    className="absolute bottom-6 inset-x-6 text-center z-10 py-2 rounded-full border"
                    style={{ backgroundColor: `${bg}99`, borderColor: `${sage}30` }}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: text }}>
                      Elena • Founder of {studioBranding}
                    </span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 flex flex-col items-start gap-6">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: sage }}>The Instructor</span>
                <h2 className="text-3xl md:text-5xl font-serif tracking-wide font-normal" style={{ color: text }}>Hi, I am Elena</h2>
                <div className="flex flex-col gap-5 text-sm leading-relaxed max-w-2xl font-normal whitespace-pre-line tracking-wide" style={{ color: `${text}BF` }}>
                  {currentContent.aboutBioText}
                </div>
                <a
                  href="#services"
                  className="mt-4 text-xs font-bold uppercase tracking-[0.2em] border-b pb-1 transition-colors"
                  style={{ color: text, borderColor: text }}
                >
                  Explore Offerings
                </a>
              </div>
            </div>
          </section>
          <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
            <div className="w-full h-px opacity-20" style={{ backgroundColor: sage }} />
          </div>
        </>
      )}

      {/* 4. Offerings Section */}
      {!currentContent.hideOfferings && (
        <>
          <section id="services" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
            <div className="text-center flex flex-col items-center gap-4 mb-20">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: sage }}>Curated Programs</span>
              <h2 className="text-3xl md:text-5xl font-serif tracking-wide font-normal" style={{ color: text }}>Bespoke Offerings</h2>
              <p className="text-xs md:text-sm leading-relaxed max-w-lg tracking-wide" style={{ color: `${text}99` }}>
                Quiet spaces and custom sequences created to align physical posture, mental pacing, and sensory stillness.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
              {currentContent.offerings.map((offering) => (
                <div
                  key={offering.id}
                  className="rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-md min-h-[420px] border"
                  style={{ backgroundColor: card, borderColor: `${sage}40` }}
                >
                  <div
                    className="h-56 w-full shrink-0 relative overflow-hidden"
                    style={{
                      backgroundImage: offering.image ? `url(${offering.image})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor: offering.image ? undefined : card,
                    }}
                  >
                    {!offering.image && <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${sage}20, ${sage}40)` }} />}
                    <div
                      className="absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold shadow-sm font-mono tracking-wider border"
                      style={{ backgroundColor: bg, borderColor: `${sage}40`, color: sage }}
                    >
                      ${offering.price}
                    </div>
                  </div>
                  <div className="p-8 md:p-10 flex-1 flex flex-col justify-between gap-8">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xl md:text-3xl font-serif tracking-wide leading-snug font-normal transition-colors" style={{ color: text }}>
                        {offering.title}
                      </h3>
                      <p className="text-xs md:text-sm leading-relaxed font-normal tracking-wide" style={{ color: `${text}B3` }}>
                        {offering.description}
                      </p>
                    </div>
                    <a href="#contact" className="inline-block text-xs font-bold uppercase tracking-[0.2em] border-b pb-1 transition-colors" style={{ color: text, borderColor: text }}>
                      Inquire Space
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
            <div className="w-full h-px opacity-20" style={{ backgroundColor: sage }} />
          </div>
        </>
      )}

      {/* 5. Portfolio Section */}
      {!currentContent.hidePortfolio && (
        <>
          <section id="portfolio" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
            <div className="text-center flex flex-col items-center gap-4 mb-16">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: sage }}>Visual Sanctuary</span>
              <h2 className="text-3xl md:text-5xl font-serif tracking-wide font-normal" style={{ color: text }}>Portfolio Gallery</h2>
            </div>
            <div className="flex justify-center gap-3 mb-12 flex-wrap">
              {["All", "Studio", "Classes", "Workshops"].map((filter) => {
                const active = activePortfolioFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActivePortfolioFilter(filter)}
                    className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 cursor-pointer"
                    style={{
                      backgroundColor: active ? sage : `${sage}25`,
                      color: active ? bg : `${text}B3`,
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPortfolio.length === 0 ? (
                <div className="col-span-full py-20 text-center italic text-sm rounded-3xl border border-dashed" style={{ color: `${text}66`, borderColor: `${sage}30` }}>
                  No photos loaded under this category yet.
                </div>
              ) : (
                filteredPortfolio.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-3xl overflow-hidden border shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg cursor-pointer"
                    style={{ borderColor: `${sage}30`, backgroundColor: `${sage}20` }}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20" style={{ color: sage }}>
                        <svg viewBox="0 0 100 120" fill="none" className="w-1/2 h-1/2 stroke-1.5">
                          <circle cx="50" cy="40" r="12" stroke="currentColor" />
                          <path d="M50 100C50 70 50 45 50 35" stroke="currentColor" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 text-left"
                      style={{ backgroundColor: `${bg}B3` }}
                    >
                      <span className="text-[10px] uppercase tracking-[0.25em] font-bold mb-1.5" style={{ color: `${text}CC` }}>{item.category}</span>
                      <h4 className="text-xl font-serif tracking-wide leading-tight font-normal" style={{ color: text }}>{item.title}</h4>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
            <div className="w-full h-px opacity-20" style={{ backgroundColor: sage }} />
          </div>
        </>
      )}

      {/* 6. Testimonials Section */}
      {!currentContent.hideTestimonials && (
        <>
          <section id="testimonials" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
            <div className="text-center flex flex-col items-center gap-4 mb-20">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: sage }}>Resonance</span>
              <h2 className="text-3xl md:text-5xl font-serif tracking-wide font-normal" style={{ color: text }}>Client Testimonials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
              {currentContent.testimonials.map((test) => (
                <div
                  key={test.id}
                  className="p-10 rounded-3xl flex flex-col justify-between gap-8 shadow-sm border border-t-4"
                  style={{ backgroundColor: card, borderColor: `#26201C`, borderTopColor: sage }}
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-1 text-sm font-bold tracking-widest" style={{ color: sage }}>
                      {Array.from({ length: test.rating }).map((_, i) => <span key={i}>★</span>)}
                    </div>
                    <p className="text-sm italic leading-relaxed font-normal tracking-wide" style={{ color: `${text}CC` }}>
                      &ldquo;{test.quote}&rdquo;
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: `${sage}20` }}>
                    <span className="text-xs font-serif font-bold tracking-wide" style={{ color: text }}>{test.clientName}</span>
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: sage }}>{test.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
            <div className="w-full h-px opacity-20" style={{ backgroundColor: sage }} />
          </div>
        </>
      )}

      {/* 7. Blog / Journal Section */}
      {!currentContent.hideBlog && (
        <>
          <section id="journal" className="py-24 md:py-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
            <div className="text-center flex flex-col items-center gap-4 mb-20">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: sage }}>Insights</span>
              <h2 className="text-3xl md:text-5xl font-serif tracking-wide font-normal" style={{ color: text }}>The Philosophy Journal</h2>
              <p className="text-xs md:text-sm leading-relaxed max-w-lg tracking-wide" style={{ color: `${text}99` }}>
                Essays, research notes, and reflections on somatic anatomy and mindful living.
              </p>
            </div>
            <div
              className="border p-6 md:p-12 lg:p-16 rounded-3xl flex flex-col gap-10"
              style={{ backgroundColor: `${card}DD`, borderColor: `#26201C` }}
            >
              {sortedPosts.length === 0 ? (
                <div className="py-20 text-center italic text-sm" style={{ color: `#8E847C` }}>No journal articles published yet.</div>
              ) : (
                sortedPosts.map((post) => {
                  const activeLikes = postLikes[post.id] !== undefined ? postLikes[post.id] : (post.likes || 0);
                  const hasLiked = !!likedPosts[post.id];
                  return (
                    <div
                      key={post.id}
                      className="border p-8 md:p-10 rounded-3xl flex flex-col lg:flex-row gap-8 lg:gap-12 transition-all duration-350 group shadow-sm items-stretch relative"
                      style={{
                        backgroundColor: card,
                        borderColor: post.isFeatured ? `${sage}66` : `#26201C`,
                        boxShadow: post.isFeatured ? `0 0 0 1px ${sage}30` : undefined,
                      }}
                    >
                      <div
                        className="w-full lg:w-80 h-52 lg:h-auto rounded-2xl overflow-hidden shrink-0 relative"
                        style={{
                          backgroundImage: post.featuredImage ? `url(${post.featuredImage})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundColor: `${sage}15`,
                        }}
                      >
                        {!post.featuredImage && <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${sage}20, ${sage}40)` }} />}
                      </div>
                      <div className="flex-1 flex flex-col justify-between gap-6 relative text-left">
                        <div className="flex flex-col gap-3.5">
                          <div className="flex flex-wrap items-center gap-2.5 text-[9px] uppercase tracking-[0.25em] font-semibold font-mono" style={{ color: "#8E847C" }}>
                            <span>{post.category || "Philosophy"}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readTime || "5 min read"}</span>
                            {post.isFeatured && <><span>•</span><span style={{ color: sage }}>Featured Pin</span></>}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-serif tracking-wide leading-snug font-normal transition-colors" style={{ color: "#F3EFEA" }}>
                            {post.title}
                          </h3>
                          <p className="text-xs md:text-sm leading-relaxed font-normal tracking-wide" style={{ color: `${text}B3` }}>
                            {post.excerpt}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {post.tags.map((tag, i) => (
                                <span key={i} className="text-[9px] px-2.5 py-0.5 rounded-full font-mono lowercase border" style={{ color: "#8E847C", borderColor: `${sage}25`, backgroundColor: `${sage}10` }}>
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: `#26201C` }}>
                          <button
                            onClick={() => setActivePost(post)}
                            className="text-xs font-bold uppercase tracking-[0.2em] border-b pb-0.5 cursor-pointer transition-colors"
                            style={{ color: "#F3EFEA", borderColor: "#F3EFEA" }}
                          >
                            Read Post
                          </button>
                          <button
                            onClick={() => handleLikeToggle(post.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer"
                            style={{
                              backgroundColor: hasLiked ? `${sage}25` : "transparent",
                              borderColor: hasLiked ? sage : `${sage}40`,
                              color: hasLiked ? sage : "#8E847C",
                            }}
                          >
                            <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 fill-current transition-transform duration-300 ${hasLiked ? "scale-110" : ""}`}>
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
          <div className="max-w-7xl mx-auto w-full px-8 md:px-16">
            <div className="w-full h-px opacity-20" style={{ backgroundColor: sage }} />
          </div>
        </>
      )}

      {/* 8. Contact Section — two-column with portrait when available */}
      <section id="contact" className="py-24 md:py-36 px-8 md:px-16 max-w-5xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: sage }}>Begin Journey</span>
          <h2 className="text-2xl md:text-4xl font-serif tracking-wide font-normal" style={{ color: text }}>Book a Session</h2>
          <p className="text-xs leading-relaxed tracking-wide" style={{ color: `${text}99` }}>
            Leave your details below, and Elena will get back to coordinate your custom session within 24 hours.
          </p>
        </div>

        <div className={`flex flex-col ${currentContent.contactPortraitUrl ? "lg:flex-row gap-0" : ""} rounded-3xl overflow-hidden border`} style={{ borderColor: `${sage}30` }}>
          {/* Portrait column */}
          {currentContent.contactPortraitUrl && (
            <div className="w-full lg:w-72 shrink-0 relative overflow-hidden min-h-[340px]" style={{ backgroundColor: `${sage}15` }}>
              <img
                src={currentContent.contactPortraitUrl}
                alt="Elena — Yoga Instructor"
                className="w-full h-full object-cover object-center absolute inset-0"
              />
              {/* Gradient overlay for text legibility */}
              <div
                className="absolute inset-0 flex flex-col justify-end p-6"
                style={{ background: `linear-gradient(to top, ${bg}E6 0%, transparent 50%)` }}
              >
                <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: `${text}99` }}>Your Instructor</span>
                <span className="text-sm font-serif font-semibold mt-0.5" style={{ color: text }}>Elena</span>
              </div>
            </div>
          )}

          {/* Form column */}
          <div className="flex-1 p-8 md:p-12" style={{ backgroundColor: `${card}CC` }}>
            {!inquirySubmitted ? (
              <form onSubmit={handleInquirySubmit} className="flex flex-col gap-5 text-left">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: `${text}99` }}>Name</label>
                  <input
                    type="text" required name="name" value={formData.name} onChange={handleInputChange} disabled={isInquirySaving}
                    className="px-5 py-3.5 border focus:outline-none rounded-xl text-xs md:text-sm tracking-wide disabled:opacity-40"
                    style={{ backgroundColor: `${sage}15`, borderColor: `${sage}40`, color: text }}
                    placeholder="Your Name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: `${text}99` }}>Email</label>
                  <input
                    type="email" required name="email" value={formData.email} onChange={handleInputChange} disabled={isInquirySaving}
                    className="px-5 py-3.5 border focus:outline-none rounded-xl text-xs md:text-sm tracking-wide disabled:opacity-40"
                    style={{ backgroundColor: `${sage}15`, borderColor: `${sage}40`, color: text }}
                    placeholder="yourname@domain.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: `${text}99` }}>Message or Intentions</label>
                  <textarea
                    name="notes" value={formData.notes} onChange={handleInputChange} disabled={isInquirySaving} rows={4}
                    className="px-5 py-3.5 border focus:outline-none rounded-xl text-xs md:text-sm resize-none tracking-wide disabled:opacity-40"
                    style={{ backgroundColor: `${sage}15`, borderColor: `${sage}40`, color: text }}
                    placeholder="Any posture goals or intentions..."
                  />
                </div>
                {inquiryError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl leading-normal font-normal">
                    <span className="font-bold block mb-0.5">Submission Error</span>
                    {inquiryError}
                  </div>
                )}
                <button
                  type="submit" disabled={isInquirySaving}
                  className="w-full mt-2 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-xl cursor-pointer disabled:opacity-40"
                  style={{ backgroundColor: sage, color: bg }}
                >
                  {isInquirySaving ? "Transmitting..." : "Send Request"}
                </button>
              </form>
            ) : (
              <div className="text-center py-12 flex flex-col items-center gap-5">
                <div className="w-12 h-12 rounded-full border flex items-center justify-center text-sm font-bold" style={{ borderColor: sage, color: sage }}>✓</div>
                <h4 className="text-lg font-serif tracking-wide" style={{ color: text }}>Request Transmitted</h4>
                <p className="text-xs leading-relaxed tracking-wide max-w-sm" style={{ color: `${text}B3` }}>
                  Thank you, {formData.name}. Elena has received your request and will reach out soon.
                </p>
                <button onClick={resetForm} className="mt-3 text-xs font-bold uppercase tracking-[0.2em] hover:underline cursor-pointer" style={{ color: sage }}>
                  Reset Form
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9. Footer with conditional social handles */}
      <footer
        className="border-t py-12 mt-auto text-center text-[10px] uppercase tracking-[0.25em]"
        style={{ borderColor: `${sage}20`, color: `${text}66` }}
      >
        <div className="max-w-7xl mx-auto px-8 flex flex-col gap-6 items-center">
          {/* Social media icons */}
          {currentContent.socialEnabled && (
            <div className="flex items-center gap-6">
              {currentContent.socialInstagram && (
                <a
                  href={`https://instagram.com/${currentContent.socialInstagram.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-100 opacity-60 flex items-center gap-1.5"
                  style={{ color: text }}
                  title={`@${currentContent.socialInstagram}`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="text-[9px] tracking-wider">{currentContent.socialInstagram}</span>
                </a>
              )}
              {currentContent.socialFacebook && (
                <a
                  href={`https://facebook.com/${currentContent.socialFacebook.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-100 opacity-60 flex items-center gap-1.5"
                  style={{ color: text }}
                  title={currentContent.socialFacebook}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-[9px] tracking-wider">{currentContent.socialFacebook}</span>
                </a>
              )}
              {currentContent.socialYoutube && (
                <a
                  href={`https://youtube.com/@${currentContent.socialYoutube.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-100 opacity-60 flex items-center gap-1.5"
                  style={{ color: text }}
                  title={currentContent.socialYoutube}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="text-[9px] tracking-wider">{currentContent.socialYoutube}</span>
                </a>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <span>© {new Date().getFullYear()} {studioBranding}. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Peace • Alignment • Somatic Wisdom</span>
              <span>|</span>
              <a href="/admin" className="font-bold uppercase tracking-widest text-[10px] transition-colors" style={{ color: sage }}>
                Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Blog Post Reader Modal */}
      {activePost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className="rounded-3xl max-w-2xl w-full h-[80vh] flex flex-col relative overflow-hidden shadow-2xl border"
            style={{ backgroundColor: "#111112", borderColor: `${sage}40` }}
          >
            <div className="p-5 border-b flex justify-between items-center shrink-0" style={{ backgroundColor: `${sage}15`, borderColor: `${sage}20` }}>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] font-mono" style={{ color: sage }}>{activePost.date}</span>
              <button
                onClick={() => setActivePost(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer"
                style={{ backgroundColor: `${sage}25`, color: text }}
              >✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 md:p-12 text-left">
              <h1 className="text-3xl md:text-4xl font-serif leading-snug tracking-wide mb-8" style={{ color: "#F3EFEA" }}>
                {activePost.title}
              </h1>
              {activePost.featuredImage && (
                <div className="w-full h-72 rounded-2xl overflow-hidden border mb-10 shrink-0" style={{ borderColor: "#26201C" }}>
                  <img src={activePost.featuredImage} alt={activePost.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-sm md:text-base leading-relaxed font-normal whitespace-pre-line flex flex-col gap-5 tracking-wide" style={{ color: `${text}CC` }}>
                {activePost.content}
              </div>
              {(currentContent.authorName || currentContent.authorBio) && (
                <div className="mt-12 p-6 rounded-2xl border flex flex-col gap-2" style={{ backgroundColor: `${sage}10`, borderColor: `${sage}25` }}>
                  <span className="text-[9px] uppercase tracking-widest font-bold font-mono" style={{ color: sage }}>Written by</span>
                  <span className="text-sm font-serif font-bold" style={{ color: "#F3EFEA" }}>{currentContent.authorName || "Elena"}</span>
                  <p className="text-xs leading-relaxed font-normal tracking-wide" style={{ color: `${text}B3` }}>{currentContent.authorBio}</p>
                </div>
              )}
              <div className="flex items-center justify-center gap-3 my-12" style={{ color: `${sage}55` }}>
                <div className="w-10 h-px" style={{ backgroundColor: `${sage}30` }} />
                <span className="text-xs">✦</span>
                <div className="w-10 h-px" style={{ backgroundColor: `${sage}30` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
