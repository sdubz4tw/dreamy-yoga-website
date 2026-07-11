"use client";

import React, { useState, useEffect } from "react";
import { YogaContent } from "@/types";

export default function Home() {
  const [content, setContent] = useState<YogaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Admin edit panel states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [editForm, setEditForm] = useState<YogaContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; msg: string }>({
    type: null,
    msg: "",
  });

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

  // Admin save changes triggers
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

  const handleServicePriceChange = (index: number, newPrice: number) => {
    if (!editForm) return;
    const updatedServices = [...editForm.services];
    updatedServices[index] = { ...updatedServices[index], price: newPrice };
    setEditForm({
      ...editForm,
      services: updatedServices,
    });
  };

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setIsSaving(true);
    setSaveStatus({ type: null, msg: "" });

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (response.ok) {
        setContent(editForm);
        setSaveStatus({
          type: "success",
          msg: "Content streamed successfully! Overwrote database file (yoga-content.json).",
        });
      } else {
        setSaveStatus({
          type: "error",
          msg: result.error || "Failed to commit content to Vercel Blob.",
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: "Failed to connect to backend serverless function.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Ethereal loading state matching the palette
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

  // Graceful failure layout (though the API falls back automatically)
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

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* 1. Minimal Navigation Bar */}
      <header className="w-full border-b border-brand-sage/10 py-6 px-6 md:px-12 bg-[#F4F1EA]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="font-serif text-xl md:text-2xl tracking-widest text-brand-text font-semibold uppercase">
            Elena Yoga
          </a>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="#about" className="text-xs font-semibold uppercase tracking-widest text-brand-text/80 hover:text-brand-text transition-colors">
              About
            </a>
            <a href="#services" className="text-xs font-semibold uppercase tracking-widest text-brand-text/80 hover:text-brand-text transition-colors">
              Services
            </a>
            <a href="#contact" className="text-xs font-semibold uppercase tracking-widest text-brand-text/80 hover:text-brand-text transition-colors">
              Contact
            </a>
          </nav>

          {/* Action button */}
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
      <section className="relative py-24 md:py-36 px-6 md:px-12 flex flex-col items-center text-center justify-center overflow-hidden">
        {/* Background atmospheric shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E5E1D5]/40 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-3xl flex flex-col items-center gap-6 md:gap-8">
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

      {/* 3. Side-by-Side About Me Section */}
      <section id="about" className="py-20 md:py-32 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Profile Art/Picture Container (Left) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[360px] aspect-[4/5] rounded-3xl bg-brand-sage-light flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-sm border border-brand-sage/5">
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

              <div className="absolute bottom-6 inset-x-6 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-text/60">
                  Elena • Founder of Elena Yoga
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details (Right) */}
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
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12">
        <div className="w-full h-px bg-brand-sage/10" />
      </div>

      {/* 4. Responsive Services Grid Section */}
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

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {currentContent.services.map((service, index) => (
            <div
              key={service.id}
              className="border border-brand-sage/15 hover:border-brand-sage/30 bg-white/20 hover:bg-white/40 p-8 md:p-10 rounded-3xl flex flex-col justify-between gap-8 transition-all duration-300 group"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sage">
                    {index === 0 ? "Deep Alignment" : "Collective Energy"}
                  </span>
                  <span className="text-sm font-serif font-bold text-brand-sage font-mono">
                    ${service.price} / hr
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-serif text-brand-text tracking-wide group-hover:text-brand-sage transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs md:text-sm text-brand-text/75 leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>
              <div>
                <a
                  href="#contact"
                  className="inline-block text-xs font-bold uppercase tracking-widest border-b border-brand-text group-hover:border-brand-sage group-hover:text-brand-sage pb-1 transition-colors"
                >
                  {index === 0 ? "Inquire Session" : "View Schedule"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12">
        <div className="w-full h-px bg-brand-sage/10" />
      </div>

      {/* 5. Minimal Contact Form Section */}
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

      {/* 6. Admin Panel Overlay Modal */}
      {isAdminOpen && editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F1EA] border border-brand-sage/20 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col relative overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-brand-sage/15">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-brand-sage font-bold">Vercel Blob Pipeline</span>
                <h4 className="text-xl font-serif text-brand-text mt-0.5">Database Content Editor</h4>
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

            {/* Form scrollable */}
            <form onSubmit={handleAdminSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
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

              {/* Service Prices */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-brand-text/70">Services Hourly Pricing</label>
                <div className="grid grid-cols-2 gap-4">
                  {editForm.services.map((service, index) => (
                    <div key={service.id} className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-text/60 truncate">{service.name} ($)</span>
                      <input
                        type="number"
                        required
                        value={service.price}
                        onChange={(e) => handleServicePriceChange(index, parseInt(e.target.value) || 0)}
                        className="px-4 py-2.5 bg-[#E5E1D5]/20 border border-brand-sage/15 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {saveStatus.type && (
                <div
                  className={`p-4 rounded-xl text-xs leading-normal ${
                    saveStatus.type === "success"
                      ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-800 border border-rose-500/20"
                  }`}
                >
                  <span className="font-bold block mb-0.5">
                    {saveStatus.type === "success" ? "Stream Successful" : "Stream Warning/Failure"}
                  </span>
                  {saveStatus.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-brand-sage hover:bg-brand-sage-hover text-[#F4F1EA] text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-xl cursor-pointer disabled:opacity-40"
              >
                {isSaving ? "Streaming to Vercel Blob..." : "Overwrites & Save to Blob"}
              </button>
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
