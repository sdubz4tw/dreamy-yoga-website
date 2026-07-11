"use client";

import React, { useState } from "react";

export default function Home() {
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" });

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
          <div className="flex items-center">
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
            Returning to the <br />
            <span className="italic font-light">wisdom of the body.</span>
          </h1>
          <p className="text-sm md:text-base text-brand-text/75 leading-relaxed max-w-xl">
            Bespoke somatic practices, restorative alignments, and private mentorship programs designed to cultivate presence, stability, and cellular renewal.
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
              {/* Artistic leaf/abstract lines SVG inside the profile wrapper */}
              <svg
                viewBox="0 0 100 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full opacity-65 text-brand-sage/80 stroke-1.5"
              >
                {/* Stylized Sun */}
                <circle cx="50" cy="40" r="16" className="stroke-brand-sage/20 fill-brand-sage/5" />
                {/* Organic botanical branch lines */}
                <path
                  d="M50 105C50 75 50 45 50 35M50 85C45 80 32 78 35 70C38 62 48 68 50 68M50 72C55 67 68 65 65 57C62 49 52 55 50 55M50 55C46 50 35 48 37 42C39 36 48 40 50 40"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Decorative absolute element */}
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
            <div className="flex flex-col gap-4 text-sm text-brand-text/80 leading-relaxed max-w-xl font-normal">
              <p>
                My teaching path is rooted in somatic anatomy, sensory introspection, and traditional Hatha and Yin lineages. I believe that alignment is not a rigid physical ideal, but an intuitive conversation with your own skeleton, tissues, and breathing pathways.
              </p>
              <p>
                Having spent over a decade guiding students through deep restorative processes, my goal is to hold a safe space where you can release chronic physical tension and slow down to the frequency of natural expansion.
              </p>
              <p>
                Whether you are stepping onto the mat to recover from injury, calm your nervous system, or refine your advanced structural alignment, we will cultivate a tailored path suited to your exact somatic geometry.
              </p>
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
          {/* Card 1: Private 1-on-1 Sessions */}
          <div className="border border-brand-sage/15 hover:border-brand-sage/30 bg-white/20 hover:bg-white/40 p-8 md:p-10 rounded-3xl flex flex-col justify-between gap-8 transition-all duration-300 group">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sage">
                  Deep Alignment
                </span>
                <span className="text-sm font-serif text-brand-text/60">✦</span>
              </div>
              <h3 className="text-xl md:text-2xl font-serif text-brand-text tracking-wide group-hover:text-brand-sage transition-colors">
                Private 1-on-1 Sessions
              </h3>
              <p className="text-xs md:text-sm text-brand-text/75 leading-relaxed font-normal">
                Bespoke posture assessment, custom somatic adjustives, and individualized breath guidance. These private sessions are customized dynamically around your body's structural history, athletic goals, and specific nervous system needs.
              </p>
            </div>
            <div>
              <a
                href="#contact"
                className="inline-block text-xs font-bold uppercase tracking-widest border-b border-brand-text group-hover:border-brand-sage group-hover:text-brand-sage pb-1 transition-colors"
              >
                Inquire Session
              </a>
            </div>
          </div>

          {/* Card 2: Group Classes */}
          <div className="border border-brand-sage/15 hover:border-brand-sage/30 bg-white/20 hover:bg-white/40 p-8 md:p-10 rounded-3xl flex flex-col justify-between gap-8 transition-all duration-300 group">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sage">
                  Collective Energy
                </span>
                <span className="text-sm font-serif text-brand-text/60">✦</span>
              </div>
              <h3 className="text-xl md:text-2xl font-serif text-brand-text tracking-wide group-hover:text-brand-sage transition-colors">
                Group Classes
              </h3>
              <p className="text-xs md:text-sm text-brand-text/75 leading-relaxed font-normal">
                Shared vinyasa patterns, slow-flowing transitions, and community yin gatherings. Practice inside an airy, light-filled environment alongside a supportive, collective community seeking physical strength, structural ease, and daily grounding.
              </p>
            </div>
            <div>
              <a
                href="#contact"
                className="inline-block text-xs font-bold uppercase tracking-widest border-b border-brand-text group-hover:border-brand-sage group-hover:text-brand-sage pb-1 transition-colors"
              >
                View Schedule
              </a>
            </div>
          </div>
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

      {/* Minimal Footer */}
      <footer className="border-t border-brand-sage/10 py-10 mt-auto text-center text-[10px] text-brand-text/50 uppercase tracking-widest">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} Elena Yoga. All rights reserved.</span>
          <span>Peace • Alignment • Somatic Wisdom</span>
        </div>
      </footer>
    </div>
  );
}
