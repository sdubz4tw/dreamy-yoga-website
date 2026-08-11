"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useYogaContent } from "@/components/useYogaContent";

export default function ContactPage() {
  const { content } = useYogaContent();

  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [isInquirySaving, setIsInquirySaving] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", notes: "", location: "" });

  const sage = content?.themePrimary || "#8C7A6B";
  const bg = content?.themeBackground || "#0B0807";
  const card = content?.themeCard || "#161210";
  const text = content?.themeText || "#E5E0D8";

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
        body: JSON.stringify({ name: formData.name, email: formData.email, message: formData.notes, location: formData.location }),
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

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: bg, color: text }}>
      <Header content={content} />

      <main className="flex-1 flex flex-col items-center">
        {/* Dedicated Contact Hero Header */}
        <section className="py-20 md:py-28 px-8 md:px-16 text-center max-w-4xl mx-auto w-full">
          <span className="text-xs uppercase tracking-[0.35em] font-bold block mb-4" style={{ color: sage }}>
            {content?.contactTagline || "Begin Journey"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif tracking-wider font-normal mb-6" style={{ color: text }}>
            {content?.contactHeading || "Book a Session"}
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto tracking-wide mb-6" style={{ color: `${text}A6` }}>
            {content?.contactSubtitle || "Leave your details below, and we will get back to coordinate your custom session within 24 hours."}
          </p>
          <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: sage }} />
        </section>

        {/* Contact Form & Portrait Section */}
        <section className="pb-24 px-8 md:px-16 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            {/* Contact Portrait or Info Side Card */}
            <div className="lg:col-span-5 rounded-3xl border p-10 flex flex-col justify-between overflow-hidden shadow-sm relative" style={{ backgroundColor: card, borderColor: `${sage}20` }}>
              {content?.contactPortraitUrl ? (
                <div className="absolute inset-0 z-0 opacity-20">
                  <img src={content.contactPortraitUrl} alt="Contact Portrait" className="w-full h-full object-cover" />
                </div>
              ) : null}

              <div className="relative z-10 space-y-6">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em]" style={{ color: sage }}>
                  {content?.contactSideCardTagline || "Direct Contact"}
                </span>
                <h2 className="font-serif text-3xl tracking-wide font-normal" style={{ color: text }}>
                  {content?.contactSideCardHeading || "Somatic Sanctuary & Private Practice"}
                </h2>
                <p className="text-xs leading-relaxed tracking-wide opacity-80">
                  {content?.contactSideCardDescription || "Whether you wish to discuss private alignment mentorship, group sound baths, or somatic consulting, reach out directly."}
                </p>
              </div>

              {content?.contactEmail && (
                <div className="relative z-10 mt-8 pt-6 border-t" style={{ borderColor: `${sage}20` }}>
                  <span className="text-[10px] uppercase font-bold tracking-widest block mb-1 opacity-60">
                    {content?.contactEmailLabelText || "Email Address"}
                  </span>
                  <a href={`mailto:${content.contactEmail}`} className="text-sm font-semibold tracking-wide hover:underline" style={{ color: sage }}>
                    {content.contactEmail}
                  </a>
                </div>
              )}
            </div>

            {/* Form Side */}
            <div className="lg:col-span-7 rounded-3xl border p-8 md:p-12 shadow-sm" style={{ backgroundColor: card, borderColor: `${sage}20` }}>
              {inquirySubmitted ? (
                <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold mb-2" style={{ borderColor: sage, color: sage }}>
                    ✦
                  </div>
                  <h2 className="text-2xl font-serif tracking-wide" style={{ color: text }}>
                    {content?.contactSuccessTitle || "Request Transmitted"}
                  </h2>
                  <p className="text-xs leading-relaxed max-w-md opacity-80">
                    {content?.contactSuccessMessage || "Your request has been received and we will reach out soon."}
                  </p>
                  <button
                    onClick={() => { setInquirySubmitted(false); setFormData({ name: "", email: "", notes: "", location: "" }); }}
                    className="mt-4 px-6 py-2.5 border text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer"
                    style={{ borderColor: sage, color: sage }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-6">
                  {inquiryError && (
                    <div className="p-4 rounded-xl border text-xs text-rose-300 bg-rose-950/20 border-rose-500/30">
                      {inquiryError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${text}B3` }}>
                        {content?.contactNameLabel || "Name"} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border text-xs font-normal tracking-wide transition-all focus:outline-none"
                        style={{ backgroundColor: `${bg}80`, borderColor: `${sage}30`, color: text }}
                        placeholder={content?.contactNamePlaceholder || "Your full name"}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${text}B3` }}>
                        {content?.contactEmailLabel || "Email"} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border text-xs font-normal tracking-wide transition-all focus:outline-none"
                        style={{ backgroundColor: `${bg}80`, borderColor: `${sage}30`, color: text }}
                        placeholder={content?.contactEmailPlaceholder || "your.email@example.com"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${text}B3` }}>
                      {content?.contactLocationLabel || "Preferred Location"}
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border text-xs font-normal tracking-wide transition-all focus:outline-none"
                      style={{ backgroundColor: `${bg}80`, borderColor: `${sage}30`, color: text }}
                      placeholder={content?.contactLocationPlaceholder || "e.g. Private Studio, Home, or Virtual"}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${text}B3` }}>
                      {content?.contactMessageLabel || "Message or Intentions"}
                    </label>
                    <textarea
                      name="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border text-xs font-normal tracking-wide transition-all focus:outline-none resize-none"
                      style={{ backgroundColor: `${bg}80`, borderColor: `${sage}30`, color: text }}
                      placeholder={content?.contactMessagePlaceholder || "Share your somatic history or questions..."}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isInquirySaving}
                    className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 shadow-sm cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: sage, color: bg }}
                  >
                    {isInquirySaving ? "Transmitting..." : content?.contactSubmitLabel || "Send Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer content={content} />
    </div>
  );
}
