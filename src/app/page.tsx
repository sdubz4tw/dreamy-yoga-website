"use client";

import React, { useState, useEffect } from "react";
import { YogaContent, OfferingItem, PortfolioItem } from "@/types";

export default function Home() {
  const [content, setContent] = useState<YogaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Admin panel open state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"general" | "offerings" | "portfolio">("general");
  const [editForm, setEditForm] = useState<YogaContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; msg: string }>({
    type: null,
    msg: "",
  });

  // Admin file upload states
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [aboutFile, setAboutFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string>("");
  const [aboutPreview, setAboutPreview] = useState<string>("");

  // Dynamic lists file states: maps itemId -> File object
  const [offeringFiles, setOfferingFiles] = useState<Record<string, File>>({});
  const [offeringPreviews, setOfferingPreviews] = useState<Record<string, string>>({});

  const [portfolioFiles, setPortfolioFiles] = useState<Record<string, File>>({});
  const [portfolioPreviews, setPortfolioPreviews] = useState<Record<string, string>>({});

  // New portfolio item input form state
  const [newPortTitle, setNewPortTitle] = useState("");
  const [newPortCategory, setNewPortCategory] = useState("Classes");
  const [newPortFile, setNewPortFile] = useState<File | null>(null);
  const [newPortPreview, setNewPortPreview] = useState("");

  // Portfolio client filter state
  const [activePortfolioFilter, setActivePortfolioFilter] = useState("All");

  // Client Inquiry State
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
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
        setEditForm(data);
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

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setInquirySubmitted(true);
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", notes: "" });
    setInquirySubmitted(false);
  };

  // Admin image file handlers
  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setHeroFile(file);
    if (file) {
      setHeroPreview(URL.createObjectURL(file));
    } else {
      setHeroPreview("");
    }
  };

  const handleAboutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAboutFile(file);
    if (file) {
      setAboutPreview(URL.createObjectURL(file));
    } else {
      setAboutPreview("");
    }
  };

  // General tab change handler
  const handleAdminChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: "heroTitle" | "heroSubtitle" | "aboutBioText"
  ) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      [section]: e.target.value,
    });
  };

  // Offerings CRUD functions
  const handleOfferingChange = (
    index: number,
    field: "title" | "price" | "description",
    value: string | number
  ) => {
    if (!editForm) return;
    const updated = [...editForm.offerings];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm({ ...editForm, offerings: updated });
  };

  const handleOfferingFileChange = (index: number, file: File | null) => {
    if (!editForm) return;
    const item = editForm.offerings[index];
    if (!file) return;

    setOfferingFiles((prev) => ({ ...prev, [item.id]: file }));
    setOfferingPreviews((prev) => ({
      ...prev,
      [item.id]: URL.createObjectURL(file),
    }));
  };

  const handleAddOffering = () => {
    if (!editForm) return;
    const newId = `offering-${Date.now()}`;
    const newOffering: OfferingItem = {
      id: newId,
      title: "New Yoga Class",
      price: 50,
      description: "Class description...",
      image: "",
    };
    setEditForm({
      ...editForm,
      offerings: [...editForm.offerings, newOffering],
    });
  };

  const handleDeleteOffering = (id: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      offerings: editForm.offerings.filter((o) => o.id !== id),
    });
  };

  // Portfolio items CRUD functions
  const handleNewPortFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewPortFile(file);
    if (file) {
      setNewPortPreview(URL.createObjectURL(file));
    } else {
      setNewPortPreview("");
    }
  };

  const handleAddPortfolioItem = () => {
    if (!editForm || !newPortTitle || !newPortFile) return;

    const newId = `port-${Date.now()}`;
    const newItem: PortfolioItem = {
      id: newId,
      title: newPortTitle,
      category: newPortCategory,
      image: "", // Uploaded in submit pipeline
    };

    // Save File state locally
    setPortfolioFiles((prev) => ({ ...prev, [newId]: newPortFile }));
    setPortfolioPreviews((prev) => ({ ...prev, [newId]: newPortPreview }));

    setEditForm({
      ...editForm,
      portfolio: [...editForm.portfolio, newItem],
    });

    // Reset inputs
    setNewPortTitle("");
    setNewPortFile(null);
    setNewPortPreview("");
  };

  const handleDeletePortfolioItem = (id: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      portfolio: editForm.portfolio.filter((p) => p.id !== id),
    });
    // Clean files if queued
    if (portfolioFiles[id]) {
      const updatedFiles = { ...portfolioFiles };
      delete updatedFiles[id];
      setPortfolioFiles(updatedFiles);
    }
  };

  // Submit FormData payload
  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setIsSaving(true);
    setSaveStatus({ type: null, msg: "" });

    try {
      const dataPayload = new FormData();
      dataPayload.append("content", JSON.stringify(editForm));

      // Append general image files
      if (heroFile) dataPayload.append("heroImage", heroFile);
      if (aboutFile) dataPayload.append("aboutImage", aboutFile);

      // Append dynamic offering files
      Object.entries(offeringFiles).forEach(([id, file]) => {
        dataPayload.append("offeringImage_" + id, file);
      });

      // Append dynamic portfolio files
      Object.entries(portfolioFiles).forEach(([id, file]) => {
        dataPayload.append("portfolioImage_" + id, file);
      });

      const response = await fetch("/api/content", {
        method: "POST",
        body: dataPayload,
      });

      const result = await response.json();

      if (response.ok) {
        setContent(result.content);
        setEditForm(result.content);
        setSaveStatus({
          type: "success",
          msg: "Sanctuary configuration saved and synced with Vercel Blob successfully!",
        });

        // Revoke temporary previews
        if (heroPreview) URL.revokeObjectURL(heroPreview);
        if (aboutPreview) URL.revokeObjectURL(aboutPreview);
        Object.values(offeringPreviews).forEach(URL.revokeObjectURL);
        Object.values(portfolioPreviews).forEach(URL.revokeObjectURL);

        // Clear local inputs
        setHeroFile(null);
        setAboutFile(null);
        setHeroPreview("");
        setAboutPreview("");
        setOfferingFiles({});
        setOfferingPreviews({});
        setPortfolioFiles({});
        setPortfolioPreviews({});
      } else {
        setSaveStatus({
          type: "error",
          msg: result.error || "Failed to commit database changes.",
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: "Failed to establish connection with serverless backend.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F4F1EA]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <span className="font-serif text-3xl tracking-widest text-[#2B2625] font-light">✦ ELENA</span>
          <div className="w-12 h-0.5 bg-[#6B5E4F]/40" />
          <span className="text-[10px] tracking-widest uppercase text-[#6B5E4F]">Loading Sanctuary Content...</span>
        </div>
      </div>
    );
  }

  const currentContent = content || editForm;
  if (!currentContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F4F1EA] p-6 text-center">
        <h1 className="text-2xl font-serif text-[#2B2625] mb-2">Sanctuary Disconnected</h1>
        <p className="text-sm text-brand-text/70 mb-4 max-w-sm">Failed to connect to layout content engine.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-brand-sage text-[#F4F1EA] text-xs font-bold uppercase rounded-full">
          Retry Connection
        </button>
      </div>
    );
  }

  // Portfolio items filter matching category
  const filteredPortfolio = currentContent.portfolio.filter((item) => {
    return activePortfolioFilter === "All" || item.category === activePortfolioFilter;
  });

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* 1. Minimal Navigation Bar */}
      <header className="w-full border-b border-brand-sage/10 py-6 px-6 md:px-12 bg-[#F4F1EA]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="font-serif text-xl md:text-2xl tracking-widest text-brand-text font-semibold uppercase">
            Elena Yoga
          </a>

          <nav className="hidden md:flex items-center gap-10">
            <a href="#about" className="text-xs font-semibold uppercase tracking-widest text-brand-text/80 hover:text-brand-text transition-colors">
              About
            </a>
            <a href="#services" className="text-xs font-semibold uppercase tracking-widest text-brand-text/80 hover:text-brand-text transition-colors">
              Offerings
            </a>
            <a href="#portfolio" className="text-xs font-semibold uppercase tracking-widest text-brand-text/80 hover:text-brand-text transition-colors">
              Portfolio
            </a>
            <a href="#contact" className="text-xs font-semibold uppercase tracking-widest text-brand-text/80 hover:text-brand-text transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="text-[10px] font-bold uppercase tracking-widest text-brand-text/60 hover:text-brand-sage transition-colors cursor-pointer"
            >
              [Admin Panel]
            </button>
            <a
              href="#contact"
              className="px-6 py-2.5 border border-brand-sage text-brand-sage hover:bg-brand-sage hover:text-[#F4F1EA] text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-full"
            >
              Book Session
            </a>
          </div>
        </div>
      </header>

      {/* 2. Peaceful Hero Section */}
      <section
        className="relative py-28 md:py-40 px-6 md:px-12 flex flex-col items-center text-center justify-center overflow-hidden"
        style={{
          backgroundImage: currentContent.heroImageUrl ? `url(${currentContent.heroImageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {currentContent.heroImageUrl && (
          <div className="absolute inset-0 bg-[#F4F1EA]/85 -z-10" />
        )}

        {!currentContent.heroImageUrl && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E5E1D5]/40 blur-3xl -z-10 pointer-events-none" />
        )}

        <div className="max-w-3xl flex flex-col items-center gap-6 md:gap-8 z-10">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-sage font-bold">
            ✦ Mindful Movement & Alignment
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-brand-text tracking-wide leading-[1.15] font-normal">
            {currentContent.heroTitle}
          </h1>
          <p className="text-sm md:text-base text-brand-text/75 leading-relaxed max-w-xl">
            {currentContent.heroSubtitle}
          </p>
          <div className="mt-4">
            <a
              href="#contact"
              className="inline-block px-8 py-4 bg-brand-sage text-[#F4F1EA] hover:bg-brand-sage-hover text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-full shadow-sm"
            >
              Book a Session
            </a>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12">
        <div className="w-full h-px bg-brand-sage/10" />
      </div>

      {/* 3. About Me Section */}
      <section id="about" className="py-20 md:py-32 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[360px] aspect-[4/5] rounded-3xl bg-brand-sage-light flex flex-col items-center justify-center relative overflow-hidden shadow-sm border border-brand-sage/5">
              {currentContent.aboutImageUrl ? (
                <img
                  src={currentContent.aboutImageUrl}
                  alt="Elena Yoga Instructor Profile"
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                  <svg
                    viewBox="0 0 100 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full opacity-65 text-brand-sage/80 stroke-1.5"
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

              <div className="absolute bottom-6 inset-x-6 text-center z-10 bg-[#F4F1EA]/60 backdrop-blur-xs py-1.5 rounded-full border border-brand-sage/10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-text">
                  Elena • Founder of Elena Yoga
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-start gap-5">
            <span className="text-[10px] uppercase tracking-widest text-brand-sage font-bold">
              The Instructor
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-text tracking-wide font-normal">
              Hi, I am Elena
            </h2>
            <div className="flex flex-col gap-4 text-sm text-brand-text/80 leading-relaxed max-w-xl font-normal whitespace-pre-line">
              {currentContent.aboutBioText}
            </div>
            <div className="mt-2">
              <a
                href="#services"
                className="text-xs font-bold uppercase tracking-widest text-brand-text hover:text-brand-sage transition-colors border-b border-brand-text pb-1 hover:border-brand-sage"
              >
                Explore Offerings
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12">
        <div className="w-full h-px bg-brand-sage/10" />
      </div>

      {/* 4. Offerings Grid Section */}
      <section id="services" className="py-20 md:py-32 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <span className="text-[10px] uppercase tracking-widest text-brand-sage font-bold">
            Curated Programs
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-brand-text tracking-wide font-normal">
            Bespoke Offerings
          </h2>
          <p className="text-xs md:text-sm text-brand-text/65 leading-relaxed max-w-md">
            Quiet spaces and custom sequences created to align physical posture, mental pacing, and sensory stillness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {currentContent.offerings.map((offering) => (
            <div
              key={offering.id}
              className="border border-brand-sage/15 hover:border-brand-sage/30 bg-white/20 hover:bg-white/40 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-xs min-h-[380px]"
            >
              {/* Offering Cover Photo (with fallback gradient if empty) */}
              <div
                className="h-44 w-full bg-brand-sage-light shrink-0 relative overflow-hidden"
                style={{
                  backgroundImage: offering.image ? `url(${offering.image})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!offering.image && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-sage/10 to-brand-sage-light" />
                )}
                <div className="absolute top-4 right-4 bg-[#F4F1EA] border border-brand-sage/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-sage shadow-sm font-mono">
                  ${offering.price} / hr
                </div>
              </div>

              {/* Text detail */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl md:text-2xl font-serif text-brand-text tracking-wide group-hover:text-brand-sage transition-colors">
                    {offering.title}
                  </h3>
                  <p className="text-xs md:text-sm text-brand-text/75 leading-relaxed font-normal">
                    {offering.description}
                  </p>
                </div>
                <div>
                  <a
                    href="#contact"
                    className="inline-block text-xs font-bold uppercase tracking-widest border-b border-brand-text group-hover:border-brand-sage group-hover:text-brand-sage pb-1 transition-colors"
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
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12">
        <div className="w-full h-px bg-brand-sage/10" />
      </div>

      {/* 5. Portfolio Gallery Section (NEW) */}
      <section id="portfolio" className="py-20 md:py-32 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-widest text-brand-sage font-bold">
            Visual Sanctuary
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-brand-text tracking-wide font-normal">
            Portfolio Gallery
          </h2>
          <p className="text-xs md:text-sm text-brand-text/65 leading-relaxed max-w-md">
            Glimpses into our physical studio environments, class alignments, and workshop gatherings.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {["All", "Studio", "Classes", "Workshops"].map((filter) => {
            const active = activePortfolioFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActivePortfolioFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-350 cursor-pointer ${
                  active
                    ? "bg-brand-sage text-[#F4F1EA]"
                    : "bg-white/10 hover:bg-white/30 text-brand-text/70"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Masonry-Style Responsive Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPortfolio.length === 0 ? (
            <div className="col-span-full py-16 text-center text-brand-text/50 italic text-sm border border-dashed border-brand-sage/20 rounded-3xl">
              No photos loaded under this category yet.
            </div>
          ) : (
            filteredPortfolio.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-3xl overflow-hidden border border-brand-sage/10 bg-brand-sage-light shadow-xs transition-all duration-500 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                {/* Photo (with default leaf line-art fallback) */}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full p-12 flex items-center justify-center opacity-40 text-brand-sage bg-gradient-to-tr from-brand-sage/15 to-transparent">
                    <svg viewBox="0 0 100 120" fill="none" className="w-full h-full stroke-1.5">
                      <circle cx="50" cy="40" r="12" className="stroke-brand-sage/20" />
                      <path d="M50 100C50 70 50 45 50 35M50 85C45 80 32 78 35 70C38 62 48 68 50 68" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                {/* Soft Text Overlay */}
                <div className="absolute inset-0 bg-[#2B2625]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left">
                  <span className="text-[9px] uppercase tracking-widest text-[#F4F1EA]/80 font-bold mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-lg font-serif text-[#F4F1EA] tracking-wide leading-tight">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12">
        <div className="w-full h-px bg-brand-sage/10" />
      </div>

      {/* 6. Minimal Contact Form Section */}
      <section id="contact" className="py-20 md:py-32 px-6 md:px-12 max-w-md mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-10">
          <span className="text-[10px] uppercase tracking-widest text-brand-sage font-bold">
            Begin Journey
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-brand-text tracking-wide font-normal">
            Book a Session
          </h2>
          <p className="text-xs text-brand-text/65 leading-relaxed">
            Leave your details below, and Elena will get back to coordinate your custom session within 24 hours.
          </p>
        </div>

        {!inquirySubmitted ? (
          <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/60">Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="px-4 py-3 bg-[#E5E1D5]/20 border border-brand-sage/15 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text"
                placeholder="Your Name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/60">Email</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="px-4 py-3 bg-[#E5E1D5]/20 border border-brand-sage/15 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text"
                placeholder="yourname@domain.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/60">Message or Intentions</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="px-4 py-3 bg-[#E5E1D5]/20 border border-brand-sage/15 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text resize-none"
                placeholder="Any posture goals or injuries..."
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-4 bg-brand-sage hover:bg-brand-sage-hover text-[#F4F1EA] text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-xl cursor-pointer"
            >
              Send Request
            </button>
          </form>
        ) : (
          <div className="text-center py-6 flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-brand-sage flex items-center justify-center text-brand-sage text-sm font-bold">
              ✓
            </div>
            <h4 className="text-lg font-serif text-brand-text">Request Transmitted</h4>
            <p className="text-xs text-brand-text/70 max-w-xs leading-relaxed">
              Thank you, **{formData.name}**. Elena has received your request and will reach out to **{formData.email}** soon.
            </p>
            <button
              onClick={resetForm}
              className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-sage hover:underline cursor-pointer"
            >
              Reset Form
            </button>
          </div>
        )}
      </section>

      {/* 7. Collapsible Admin Panel Modal */}
      {isAdminOpen && editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F1EA] border border-brand-sage/20 rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-brand-sage/15 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-brand-sage font-bold">Sanctuary Database</span>
                <h4 className="text-xl font-serif text-brand-text mt-0.5">Control Center Console</h4>
              </div>
              <button
                onClick={() => {
                  setIsAdminOpen(false);
                  setSaveStatus({ type: null, msg: "" });
                }}
                className="text-brand-text/50 hover:text-brand-text transition-colors text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Inner Dashboard Navigation tabs */}
            <div className="flex border-b border-brand-sage/10 bg-brand-sage-light/35 shrink-0 px-6 gap-2">
              {[
                { id: "general", label: "General & Copy" },
                { id: "offerings", label: "Yoga Classes" },
                { id: "portfolio", label: "Portfolio Gallery" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    adminTab === tab.id
                      ? "border-brand-sage text-brand-text font-bold"
                      : "border-transparent text-brand-text/50 hover:text-brand-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAdminSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Tab 1: General Copy and Hero */}
              {adminTab === "general" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/70">Hero Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.heroTitle}
                      onChange={(e) => handleAdminChange(e, "heroTitle")}
                      className="px-4 py-3 bg-[#E5E1D5]/20 border border-brand-sage/15 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/70">Hero Subtitle</label>
                    <textarea
                      required
                      rows={3}
                      value={editForm.heroSubtitle}
                      onChange={(e) => handleAdminChange(e, "heroSubtitle")}
                      className="px-4 py-3 bg-[#E5E1D5]/20 border border-brand-sage/15 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/70">About Bio Text</label>
                    <textarea
                      required
                      rows={6}
                      value={editForm.aboutBioText}
                      onChange={(e) => handleAdminChange(e, "aboutBioText")}
                      className="px-4 py-3 bg-[#E5E1D5]/20 border border-brand-sage/15 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text resize-none"
                    />
                  </div>

                  {/* General Image Uploads */}
                  <div className="border-t border-brand-sage/15 pt-5 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-sage">Homepage Banner Images</span>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/70">Hero Background</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroFileChange}
                          className="text-xs text-brand-text/65 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-sage file:text-[#F4F1EA] hover:file:bg-brand-sage-hover"
                        />
                        {(heroPreview || currentContent.heroImageUrl) && (
                          <div className="w-12 h-12 rounded-lg border border-brand-sage/10 overflow-hidden shrink-0">
                            <img src={heroPreview || currentContent.heroImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/70">About Profile Picture</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAboutFileChange}
                          className="text-xs text-brand-text/65 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-sage file:text-[#F4F1EA] hover:file:bg-brand-sage-hover"
                        />
                        {(aboutPreview || currentContent.aboutImageUrl) && (
                          <div className="w-12 h-12 rounded-lg border border-brand-sage/10 overflow-hidden shrink-0">
                            <img src={aboutPreview || currentContent.aboutImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Yoga Classes / Offerings Editor */}
              {adminTab === "offerings" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-sage">Offerings List ({editForm.offerings.length})</span>
                    <button
                      type="button"
                      onClick={handleAddOffering}
                      className="px-4 py-2 bg-brand-sage text-[#F4F1EA] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-brand-sage-hover cursor-pointer"
                    >
                      + Add New Class
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {editForm.offerings.map((offering, index) => {
                      const hasLocalPreview = offeringPreviews[offering.id];
                      return (
                        <div key={offering.id} className="border border-brand-sage/15 rounded-2xl p-5 bg-[#E5E1D5]/10 flex flex-col gap-4 relative">
                          <button
                            type="button"
                            onClick={() => handleDeleteOffering(offering.id)}
                            className="absolute top-4 right-4 text-xs font-bold text-rose-600 hover:text-rose-800 uppercase cursor-pointer"
                          >
                            ✕ Remove
                          </button>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-brand-text/50">Class Title</span>
                              <input
                                type="text"
                                required
                                value={offering.title}
                                onChange={(e) => handleOfferingChange(index, "title", e.target.value)}
                                className="px-3 py-2 bg-[#F4F1EA] border border-brand-sage/10 rounded-lg text-xs text-brand-text"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-brand-text/50">Hourly Rate ($)</span>
                              <input
                                type="number"
                                required
                                value={offering.price}
                                onChange={(e) => handleOfferingChange(index, "price", parseInt(e.target.value) || 0)}
                                className="px-3 py-2 bg-[#F4F1EA] border border-brand-sage/10 rounded-lg text-xs text-brand-text"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold text-brand-text/50">Description</span>
                            <textarea
                              required
                              rows={2}
                              value={offering.description}
                              onChange={(e) => handleOfferingChange(index, "description", e.target.value)}
                              className="px-3 py-2 bg-[#F4F1EA] border border-brand-sage/10 rounded-lg text-xs text-brand-text resize-none"
                            />
                          </div>

                          {/* Image upload for Class Card */}
                          <div className="flex flex-col gap-1 pt-2">
                            <span className="text-[9px] uppercase font-bold text-brand-text/50">Class Card Photo</span>
                            <div className="flex items-center gap-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleOfferingFileChange(index, e.target.files?.[0] || null)}
                                className="text-[10px] text-brand-text/60 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-brand-sage file:text-[#F4F1EA]"
                              />
                              {(hasLocalPreview || offering.image) && (
                                <div className="w-10 h-10 rounded-lg border border-brand-sage/10 overflow-hidden shrink-0">
                                  <img
                                    src={hasLocalPreview || offering.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Portfolio Gallery CRUD */}
              {adminTab === "portfolio" && (
                <div className="flex flex-col gap-6">
                  {/* Form to insert a new portfolio item */}
                  <div className="border border-brand-sage/20 rounded-2xl p-5 bg-[#E5E1D5]/20 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-sage">Add Photo to Gallery</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-brand-text/60">Photo Title</label>
                        <input
                          type="text"
                          value={newPortTitle}
                          onChange={(e) => setNewPortTitle(e.target.value)}
                          placeholder="e.g. Lotus Sunset Alignment"
                          className="px-3 py-2 bg-[#F4F1EA] border border-brand-sage/10 rounded-lg text-xs text-brand-text"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-brand-text/60">Gallery Tag Category</label>
                        <select
                          value={newPortCategory}
                          onChange={(e) => setNewPortCategory(e.target.value)}
                          className="px-3 py-2 bg-[#F4F1EA] border border-brand-sage/10 rounded-lg text-xs text-brand-text"
                        >
                          <option value="Studio">Studio</option>
                          <option value="Classes">Classes</option>
                          <option value="Workshops">Workshops</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2">
                      <label className="text-[9px] uppercase font-bold text-brand-text/60">Select Image File</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewPortFileChange}
                          className="text-[10px] text-brand-text/60 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-brand-sage file:text-[#F4F1EA]"
                        />
                        {newPortPreview && (
                          <div className="w-10 h-10 rounded-lg border border-brand-sage/10 overflow-hidden shrink-0">
                            <img src={newPortPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!newPortTitle || !newPortFile}
                      onClick={handleAddPortfolioItem}
                      className="mt-2 py-3 bg-brand-sage hover:bg-brand-sage-hover text-[#F4F1EA] text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-40"
                    >
                      Queue Photo Addition
                    </button>
                  </div>

                  {/* List of current portfolio images with delete buttons */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-sage">Existing Gallery Photos</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {editForm.portfolio.map((item) => {
                        const localPreview = portfolioPreviews[item.id];
                        return (
                          <div key={item.id} className="border border-brand-sage/10 rounded-xl p-3 bg-[#F4F1EA] flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg border border-brand-sage/10 overflow-hidden shrink-0 bg-brand-sage-light">
                                {(localPreview || item.image) ? (
                                  <img
                                    src={localPreview || item.image}
                                    alt="Thumb"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] opacity-40">Art</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-semibold text-brand-text truncate leading-tight">{item.title}</h5>
                                <span className="text-[8px] uppercase tracking-wider font-bold text-brand-sage block mt-0.5">{item.category}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeletePortfolioItem(item.id)}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 uppercase shrink-0 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Status and Action controls */}
              <div className="border-t border-brand-sage/15 pt-5 shrink-0">
                {saveStatus.type && (
                  <div
                    className={`p-4 rounded-xl text-xs leading-normal mb-4 ${
                      saveStatus.type === "success"
                        ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-800 border border-rose-500/20"
                    }`}
                  >
                    <span className="font-bold block mb-0.5">
                      {saveStatus.type === "success" ? "Sync Success" : "Sync Error"}
                    </span>
                    {saveStatus.msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-brand-text hover:bg-[#1a1716] text-[#F4F1EA] text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-xl cursor-pointer disabled:opacity-40 shadow-sm"
                >
                  {isSaving ? "Saving & Uploading Assets to Vercel Blob..." : "Commit All Changes & Sync Vercel Blob"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-brand-sage/10 py-10 mt-auto text-center text-[10px] text-brand-text/50 uppercase tracking-widest bg-transparent">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} Elena Yoga. All rights reserved.</span>
          <span>Peace • Alignment • Somatic Wisdom</span>
        </div>
      </footer>
    </div>
  );
}
