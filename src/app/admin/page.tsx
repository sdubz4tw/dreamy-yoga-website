"use client";

import React, { useState, useEffect } from "react";
import { YogaContent, OfferingItem, PortfolioItem, TestimonialItem, BlogPostItem } from "@/types";

export default function AdminPage() {
  const [content, setContent] = useState<YogaContent | null>(null);
  const [editForm, setEditForm] = useState<YogaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // CMS active sidebar tab
  const [activeTab, setActiveTab] = useState<"overview" | "heroAbout" | "offerings" | "portfolio" | "testimonials" | "blog">("overview");

  // Save progress states
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

  // Dynamic lists file states
  const [offeringFiles, setOfferingFiles] = useState<Record<string, File>>({});
  const [offeringPreviews, setOfferingPreviews] = useState<Record<string, string>>({});

  const [portfolioFiles, setPortfolioFiles] = useState<Record<string, File>>({});
  const [portfolioPreviews, setPortfolioPreviews] = useState<Record<string, string>>({});

  const [blogFiles, setBlogFiles] = useState<Record<string, File>>({});
  const [blogPreviews, setBlogPreviews] = useState<Record<string, string>>({});

  // New portfolio item input form state
  const [newPortTitle, setNewPortTitle] = useState("");
  const [newPortCategory, setNewPortCategory] = useState("Classes");
  const [newPortFile, setNewPortFile] = useState<File | null>(null);
  const [newPortPreview, setNewPortPreview] = useState("");

  // New testimonial form state
  const [newTestName, setNewTestName] = useState("");
  const [newTestQuote, setNewTestQuote] = useState("");
  const [newTestRating, setNewTestRating] = useState(5);
  const [newTestParagraph, setNewTestParagraph] = useState("");
  const [newTestSource, setNewTestSource] = useState("");

  // New blog post form state
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogExcerpt, setNewBlogExcerpt] = useState("");
  const [newBlogContent, setNewBlogContent] = useState("");
  const [newBlogCategory, setNewBlogCategory] = useState("Philosophy");
  const [newBlogReadTime, setNewBlogReadTime] = useState("5 min read");
  const [newBlogFile, setNewBlogFile] = useState<File | null>(null);
  const [newBlogPreview, setNewBlogPreview] = useState("");

  // Resolve dynamic session state client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(sessionStorage.getItem("admin_logged_in") === "true");
    }
  }, []);

  // Fetch content configuration
  useEffect(() => {
    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load content.");
        return res.json();
      })
      .then((data: YogaContent) => {
        setContent(data);
        setEditForm(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load content dynamically in admin panel:", err);
        setIsLoading(false);
      });
  }, []);

  // Auth credential submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, password: authPassword }),
      });

      if (response.ok) {
        sessionStorage.setItem("admin_logged_in", "true");
        setIsLoggedIn(true);
        setAuthUsername("");
        setAuthPassword("");
      } else {
        const errResult = await response.json();
        setAuthError(errResult.error || "Credentials invalid.");
      }
    } catch (err) {
      setAuthError("Failed to submit authentication request.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    setIsLoggedIn(false);
  };

  // General text edits handler
  const handleGeneralChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: "heroTitle" | "heroSubtitle" | "aboutBioText"
  ) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [section]: e.target.value });
  };

  // Banners image change handlers
  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setHeroFile(file);
    if (file) setHeroPreview(URL.createObjectURL(file));
    else setHeroPreview("");
  };

  const handleAboutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAboutFile(file);
    if (file) setAboutPreview(URL.createObjectURL(file));
    else setAboutPreview("");
  };

  // Offerings CRUD handlers
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
    setOfferingPreviews((prev) => ({ ...prev, [item.id]: URL.createObjectURL(file) }));
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
    setEditForm({ ...editForm, offerings: [...editForm.offerings, newOffering] });
  };

  const handleDeleteOffering = (id: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, offerings: editForm.offerings.filter((o) => o.id !== id) });
  };

  // Portfolio CRUD handlers
  const handleNewPortFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewPortFile(file);
    if (file) setNewPortPreview(URL.createObjectURL(file));
    else setNewPortPreview("");
  };

  const handleAddPortfolioItem = () => {
    if (!editForm || !newPortTitle || !newPortFile) return;

    const newId = `port-${Date.now()}`;
    const newItem: PortfolioItem = {
      id: newId,
      title: newPortTitle,
      category: newPortCategory,
      image: "",
    };

    setPortfolioFiles((prev) => ({ ...prev, [newId]: newPortFile }));
    setPortfolioPreviews((prev) => ({ ...prev, [newId]: newPortPreview }));

    setEditForm({ ...editForm, portfolio: [...editForm.portfolio, newItem] });
    setNewPortTitle("");
    setNewPortFile(null);
    setNewPortPreview("");
  };

  const handleDeletePortfolioItem = (id: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, portfolio: editForm.portfolio.filter((p) => p.id !== id) });
    if (portfolioFiles[id]) {
      const updatedFiles = { ...portfolioFiles };
      delete updatedFiles[id];
      setPortfolioFiles(updatedFiles);
    }
  };

  // Testimonials CRUD handlers
  const handleAddTestimonial = () => {
    if (!editForm || !newTestName || !newTestQuote) return;

    const newId = `test-${Date.now()}`;
    const newTest: TestimonialItem = {
      id: newId,
      clientName: newTestName,
      quote: newTestQuote,
      rating: newTestRating,
      source: newTestSource || "Client Review",
    };

    setEditForm({ ...editForm, testimonials: [...editForm.testimonials, newTest] });
    setNewTestName("");
    setNewTestQuote("");
    setNewTestRating(5);
    setNewTestSource("");
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, testimonials: editForm.testimonials.filter((t) => t.id !== id) });
  };

  // Blog CRUD handlers
  const handleNewBlogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewBlogFile(file);
    if (file) setNewBlogPreview(URL.createObjectURL(file));
    else setNewBlogPreview("");
  };

  const handleAddBlogPost = () => {
    if (!editForm || !newBlogTitle || !newBlogContent) return;

    const newId = `blog-${Date.now()}`;
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const newPost: BlogPostItem = {
      id: newId,
      title: newBlogTitle,
      excerpt: newBlogExcerpt || newBlogContent.substring(0, 120) + "...",
      content: newBlogContent,
      featuredImage: "",
      date: formattedDate,
      category: newBlogCategory || "Philosophy",
      readTime: newBlogReadTime || "5 min read",
      likes: 0,
    };

    if (newBlogFile) {
      setBlogFiles((prev) => ({ ...prev, [newId]: newBlogFile }));
      setBlogPreviews((prev) => ({ ...prev, [newId]: newBlogPreview }));
    }

    setEditForm({ ...editForm, blogPosts: [...editForm.blogPosts, newPost] });
    setNewBlogTitle("");
    setNewBlogExcerpt("");
    setNewBlogContent("");
    setNewBlogCategory("Philosophy");
    setNewBlogReadTime("5 min read");
    setNewBlogFile(null);
    setNewBlogPreview("");
  };

  const handleDeleteBlogPost = (id: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, blogPosts: editForm.blogPosts.filter((b) => b.id !== id) });
    if (blogFiles[id]) {
      const updatedFiles = { ...blogFiles };
      delete updatedFiles[id];
      setBlogFiles(updatedFiles);
    }
  };

  // Submit all edits via FormData
  const handleSaveAllChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setIsSaving(true);
    setSaveStatus({ type: null, msg: "" });

    try {
      const dataPayload = new FormData();
      dataPayload.append("content", JSON.stringify(editForm));

      // General images
      if (heroFile) dataPayload.append("heroImage", heroFile);
      if (aboutFile) dataPayload.append("aboutImage", aboutFile);

      // Offerings
      Object.entries(offeringFiles).forEach(([id, file]) => {
        dataPayload.append("offeringImage_" + id, file);
      });

      // Portfolio
      Object.entries(portfolioFiles).forEach(([id, file]) => {
        dataPayload.append("portfolioImage_" + id, file);
      });

      // Blogs
      Object.entries(blogFiles).forEach(([id, file]) => {
        dataPayload.append("blogImage_" + id, file);
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
          msg: "CMS Overwrites synced successfully with Vercel Blob!",
        });

        // Revoke objects
        if (heroPreview) URL.revokeObjectURL(heroPreview);
        if (aboutPreview) URL.revokeObjectURL(aboutPreview);
        Object.values(offeringPreviews).forEach(URL.revokeObjectURL);
        Object.values(portfolioPreviews).forEach(URL.revokeObjectURL);
        Object.values(blogPreviews).forEach(URL.revokeObjectURL);

        // Reset inputs
        setHeroFile(null);
        setAboutFile(null);
        setHeroPreview("");
        setAboutPreview("");
        setOfferingFiles({});
        setOfferingPreviews({});
        setPortfolioFiles({});
        setPortfolioPreviews({});
        setBlogFiles({});
        setBlogPreviews({});
      } else {
        setSaveStatus({
          type: "error",
          msg: result.error || "Failed to commit database modifications.",
        });
      }
    } catch (err) {
      setSaveStatus({
        type: "error",
        msg: "Failed to connect to dynamic serverless endpoint.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#111112]">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <span className="font-serif text-3xl tracking-[0.2em] text-[#E5E0D8] font-light">✦ ELENA YOGA</span>
          <div className="w-16 h-0.5 bg-[#8C7A6B]/40" />
          <span className="text-[10px] tracking-widest uppercase text-[#8C7A6B]">Loading CMS Dashboard...</span>
        </div>
      </div>
    );
  }

  // Unauthorized: Center Secure Login Overlay
  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#111112] px-6 py-12">
        <form
          onSubmit={handleAuthSubmit}
          className="bg-[#161210] border border-[#26201C] rounded-3xl max-w-md w-full p-8 md:p-10 flex flex-col gap-6 shadow-2xl relative"
        >
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#8C7A6B] font-bold">Aura & Flow</span>
            <h4 className="text-2xl font-serif text-[#E5E0D8] mt-1.5 tracking-wide">CMS Authorization</h4>
            <p className="text-xs text-[#E5E0D8]/65 mt-1 leading-relaxed">
              Enter your administration login credentials to manage website configs.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#E5E0D8]">Admin Username</label>
              <input
                type="text"
                required
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Username"
                className="px-5 py-3.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs md:text-sm text-[#E5E0D8]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#E5E0D8]">Admin Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                className="px-5 py-3.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs md:text-sm text-[#E5E0D8]"
              />
            </div>
          </div>

          {authError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl leading-normal text-left font-normal animate-shake">
              <span className="font-bold block mb-0.5">Authorization Error</span>
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-4 bg-[#8C7A6B] hover:bg-[#79685A] text-[#111112] text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-xl cursor-pointer"
          >
            Authorize Admin Access
          </button>
        </form>
      </div>
    );
  }

  const currentContent = editForm || content;
  if (!currentContent) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#111112] text-[#E5E0D8]">
        Failed to construct configuration form.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#111112] text-[#E5E0D8] font-sans">
      
      {/* LEFT SIDEBAR navigation drawer */}
      <aside className="w-full md:w-64 border-r border-[#26201C] bg-[#161210] flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#26201C] flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-bold">Elena Yoga</span>
          <span className="text-sm font-serif text-[#E5E0D8] mt-1 font-semibold tracking-wide">CMS Control Panel</span>
        </div>

        {/* Navigation links drawer */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {[
            { id: "overview", label: "Dashboard Overview" },
            { id: "heroAbout", label: "Hero & About Copy" },
            { id: "offerings", label: "Manage Classes" },
            { id: "portfolio", label: "Portfolio Gallery" },
            { id: "testimonials", label: "Testimonials" },
            { id: "blog", label: "Philosophy Journal" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSaveStatus({ type: null, msg: "" });
                }}
                className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  active
                    ? "bg-[#8C7A6B] text-[#111112]"
                    : "text-[#E5E0D8]/60 hover:bg-[#111112] hover:text-[#E5E0D8]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[#26201C] flex flex-col gap-2">
          <a
            href="/"
            target="_blank"
            className="w-full text-center py-2.5 rounded-xl border border-brand-sage-light/20 text-[#E5E0D8]/80 hover:text-[#E5E0D8] hover:bg-brand-bg text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Preview Site ↗
          </a>
          <button
            onClick={handleLogout}
            className="w-full text-center py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN INTERIOR WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="p-6 md:p-8 border-b border-[#26201C] bg-[#161210]/40 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-serif text-[#E5E0D8] tracking-wide font-normal uppercase">
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "heroAbout" && "Hero & About Settings"}
            {activeTab === "offerings" && "Yoga Classes & Rates"}
            {activeTab === "portfolio" && "Portfolio Image Pipeline"}
            {activeTab === "testimonials" && "Client Resonance Reviews"}
            {activeTab === "blog" && "Philosophy Journal Articles"}
          </h2>

          <div className="text-[10px] uppercase font-mono tracking-widest text-[#8E847C]">
            Connected • Vercel Blob API
          </div>
        </header>

        {/* Master CRUD form */}
        <form onSubmit={handleSaveAllChanges} className="p-6 md:p-8 flex flex-col gap-6">
          
          {/* Active Tab View Panels */}
          
          {/* TAB 1: OVERVIEW PANEL */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Yoga Offerings", count: currentContent.offerings.length, tag: "Classes listed" },
                { title: "Gallery Assets", count: currentContent.portfolio.length, tag: "Visual items" },
                { title: "Resonance Reviews", count: currentContent.testimonials.length, tag: "Quotes synced" },
                { title: "Journal Essays", count: currentContent.blogPosts.length, tag: "Published posts" },
              ].map((stat, i) => (
                <div key={i} className="bg-[#161210] border border-[#26201C] p-6 rounded-2xl flex flex-col justify-between min-h-[140px] shadow-sm">
                  <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold">{stat.title}</span>
                  <span className="text-4xl font-serif font-light text-[#F3EFEA] my-2">{stat.count}</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#8E847C] font-mono">{stat.tag}</span>
                </div>
              ))}

              <div className="bg-[#161210] border border-[#26201C] p-8 rounded-3xl col-span-full mt-4 text-left">
                <h4 className="text-lg font-serif text-[#F3EFEA] mb-2 tracking-wide font-normal">Welcome to your Sanctuary CMS</h4>
                <p className="text-xs text-[#E5E0D8]/70 leading-relaxed max-w-2xl tracking-wide">
                  Use the left vertical navigation drawer tabs to modify layouts, upload high-resolution banner images, list class programs, or write somatic essays. All updates are streamed instantly to Vercel Blob and persisted globally inside your configuration schema.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HERO & ABOUT PANEL */}
          {activeTab === "heroAbout" && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#161210] border border-[#26201C] p-6 md:p-8 rounded-3xl flex flex-col gap-5 text-left">
                <h3 className="text-lg font-serif text-[#F3EFEA] border-b border-[#26201C] pb-3 font-normal">Hero Section Config</h3>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#E5E0D8]">Hero Title Header</label>
                  <input
                    type="text"
                    required
                    value={currentContent.heroTitle}
                    onChange={(e) => handleGeneralChange(e, "heroTitle")}
                    className="px-5 py-3.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs md:text-sm text-[#E5E0D8] tracking-wide"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#E5E0D8]">Hero Subtitle Description</label>
                  <textarea
                    required
                    rows={3}
                    value={currentContent.heroSubtitle}
                    onChange={(e) => handleGeneralChange(e, "heroSubtitle")}
                    className="px-5 py-3.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs md:text-sm text-[#E5E0D8] resize-none tracking-wide"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#E5E0D8]">Cover Background Banner</label>
                  <div className="flex items-center gap-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroFileChange}
                      className="text-xs text-[#E5E0D8]/65 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#8C7A6B] file:text-[#111112] file:cursor-pointer"
                    />
                    {(heroPreview || currentContent.heroImageUrl) && (
                      <div className="w-16 h-16 rounded-xl border border-[#26201C] overflow-hidden shrink-0 bg-brand-bg">
                        <img src={heroPreview || currentContent.heroImageUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#161210] border border-[#26201C] p-6 md:p-8 rounded-3xl flex flex-col gap-5 text-left">
                <h3 className="text-lg font-serif text-[#F3EFEA] border-b border-[#26201C] pb-3 font-normal">About Instructor Biography</h3>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#E5E0D8]">Biography Content Text</label>
                  <textarea
                    required
                    rows={8}
                    value={currentContent.aboutBioText}
                    onChange={(e) => handleGeneralChange(e, "aboutBioText")}
                    className="px-5 py-3.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs md:text-sm text-[#E5E0D8] resize-none tracking-wide"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#E5E0D8]">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAboutFileChange}
                      className="text-xs text-[#E5E0D8]/65 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#8C7A6B] file:text-[#111112] file:cursor-pointer"
                    />
                    {(aboutPreview || currentContent.aboutImageUrl) && (
                      <div className="w-16 h-16 rounded-xl border border-[#26201C] overflow-hidden shrink-0 bg-brand-bg">
                        <img src={aboutPreview || currentContent.aboutImageUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFERINGS CRUD PANEL */}
          {activeTab === "offerings" && (
            <div className="flex flex-col gap-6 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C7A6B]">Offerings Programs ({currentContent.offerings.length})</span>
                <button
                  type="button"
                  onClick={handleAddOffering}
                  className="px-5 py-2.5 bg-[#8C7A6B] text-[#111112] text-[10px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#79685A] cursor-pointer"
                >
                  + Add New Class
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {currentContent.offerings.map((offering, index) => {
                  const hasLocalPreview = offeringPreviews[offering.id];
                  return (
                    <div key={offering.id} className="border border-[#26201C] rounded-2xl p-6 bg-[#161210] flex flex-col gap-4 relative shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleDeleteOffering(offering.id)}
                        className="absolute top-6 right-6 text-xs font-bold text-rose-500 hover:text-rose-700 uppercase cursor-pointer"
                      >
                        ✕ Remove Program
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-[#E5E0D8]/50">Class Title</span>
                          <input
                            type="text"
                            required
                            value={offering.title}
                            onChange={(e) => handleOfferingChange(index, "title", e.target.value)}
                            className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-[#E5E0D8]/50">Hourly Rate ($)</span>
                          <input
                            type="number"
                            required
                            value={offering.price}
                            onChange={(e) => handleOfferingChange(index, "price", parseInt(e.target.value) || 0)}
                            className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#E5E0D8]/50">Description Details</span>
                        <textarea
                          required
                          rows={3}
                          value={offering.description}
                          onChange={(e) => handleOfferingChange(index, "description", e.target.value)}
                          className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-[#26201C]/50">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#E5E0D8]/50">Class Card Photo</span>
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOfferingFileChange(index, e.target.files?.[0] || null)}
                            className="text-[10px] text-[#E5E0D8]/60 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-[#8C7A6B] file:text-[#111112] file:cursor-pointer"
                          />
                          {(hasLocalPreview || offering.image) && (
                            <div className="w-12 h-12 rounded-xl border border-[#26201C] overflow-hidden shrink-0 bg-brand-bg">
                              <img src={hasLocalPreview || offering.image} alt="Class Preview" className="w-full h-full object-cover" />
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

          {/* TAB 4: PORTFOLIO CRUD PANEL */}
          {activeTab === "portfolio" && (
            <div className="flex flex-col gap-6 text-left">
              {/* Insert Form */}
              <div className="border border-[#26201C] rounded-3xl p-6 bg-[#161210] flex flex-col gap-4 shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C7A6B]">Upload Photo to Gallery</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#E5E0D8]/60">Photo Title</label>
                    <input
                      type="text"
                      value={newPortTitle}
                      onChange={(e) => setNewPortTitle(e.target.value)}
                      placeholder="e.g. Alabaster Alignment"
                      className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#E5E0D8]/60">Gallery Tag Category</label>
                    <select
                      value={newPortCategory}
                      onChange={(e) => setNewPortCategory(e.target.value)}
                      className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] cursor-pointer"
                    >
                      <option value="Studio">Studio</option>
                      <option value="Classes">Classes</option>
                      <option value="Workshops">Workshops</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-[#26201C]/50">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-[#E5E0D8]/60">Select Image File</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewPortFileChange}
                      className="text-[10px] text-[#E5E0D8]/60 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-[#8C7A6B] file:text-[#111112] file:cursor-pointer"
                    />
                    {newPortPreview && (
                      <div className="w-12 h-12 rounded-xl border border-[#26201C] overflow-hidden shrink-0 bg-brand-bg">
                        <img src={newPortPreview} alt="New Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newPortTitle || !newPortFile}
                  onClick={handleAddPortfolioItem}
                  className="mt-2 py-3.5 bg-[#8C7A6B] hover:bg-[#79685A] text-[#111112] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl cursor-pointer disabled:opacity-30"
                >
                  Queue Photo Addition
                </button>
              </div>

              {/* List existing */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C7A6B]">Existing Photos</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentContent.portfolio.map((item) => {
                    const localPreview = portfolioPreviews[item.id];
                    return (
                      <div key={item.id} className="border border-[#26201C] rounded-2xl p-4 bg-[#161210] flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-14 rounded-xl border border-[#26201C] overflow-hidden shrink-0 bg-[#161210]/55">
                            {(localPreview || item.image) ? (
                              <img src={localPreview || item.image} alt="Thumbnail preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] opacity-40">Art</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-[#E5E0D8] truncate leading-tight">{item.title}</h5>
                            <span className="text-[8px] uppercase tracking-wider font-bold text-[#8C7A6B] block mt-1 font-mono">{item.category}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase shrink-0 cursor-pointer"
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

          {/* TAB 5: TESTIMONIALS CRUD PANEL */}
          {activeTab === "testimonials" && (
            <div className="flex flex-col gap-6 text-left">
              <div className="border border-[#26201C] rounded-3xl p-6 bg-[#161210] flex flex-col gap-4 shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C7A6B]">Add Client Resonance Review</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Client Name</label>
                    <input
                      type="text"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      placeholder="e.g. Claire Vance"
                      className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Rating Score</label>
                    <select
                      value={newTestRating}
                      onChange={(e) => setNewTestRating(parseInt(e.target.value) || 5)}
                      className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] cursor-pointer"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Client Quote Text</label>
                  <textarea
                    value={newTestQuote}
                    onChange={(e) => setNewTestQuote(e.target.value)}
                    placeholder="Enter review quote..."
                    rows={3}
                    className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Class context / Source description</label>
                  <input
                    type="text"
                    value={newTestSource}
                    onChange={(e) => setNewTestSource(e.target.value)}
                    placeholder="e.g. Private 1-on-1 Mentorship Client"
                    className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                  />
                </div>

                <button
                  type="button"
                  disabled={!newTestName || !newTestQuote}
                  onClick={handleAddTestimonial}
                  className="mt-2 py-3.5 bg-[#8C7A6B] hover:bg-[#79685A] text-[#111112] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl cursor-pointer disabled:opacity-30"
                >
                  Queue Review Addition
                </button>
              </div>

              {/* Existing List */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C7A6B]">Existing Reviews</span>
                <div className="flex flex-col gap-4">
                  {currentContent.testimonials.map((test) => (
                    <div key={test.id} className="border border-[#26201C] rounded-2xl p-6 bg-[#161210] flex justify-between items-start gap-6 shadow-sm">
                      <div className="flex-1 text-xs">
                        <span className="font-semibold block text-[#F3EFEA] text-sm">{test.clientName} ({test.rating}★)</span>
                        <span className="text-[9px] text-[#8C7A6B] block font-bold mt-1 font-mono">{test.source}</span>
                        <p className="text-xs text-[#E5E0D8]/75 italic mt-2.5 leading-relaxed">&ldquo;{test.quote}&rdquo;</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(test.id)}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase shrink-0 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: JOURNAL CRUD PANEL */}
          {activeTab === "blog" && (
            <div className="flex flex-col gap-6 text-left">
              <div className="border border-[#26201C] rounded-3xl p-6 bg-[#161210] flex flex-col gap-4 shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C7A6B]">Publish Philosophy Essay</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Article Title</label>
                  <input
                    type="text"
                    value={newBlogTitle}
                    onChange={(e) => setNewBlogTitle(e.target.value)}
                    placeholder="e.g. Somatic Breathwork Nets"
                    className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Category tag</label>
                    <input
                      type="text"
                      value={newBlogCategory}
                      onChange={(e) => setNewBlogCategory(e.target.value)}
                      placeholder="Philosophy"
                      className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Read Time duration</label>
                    <input
                      type="text"
                      value={newBlogReadTime}
                      onChange={(e) => setNewBlogReadTime(e.target.value)}
                      placeholder="5 min read"
                      className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Excerpt Outline Summary</label>
                  <input
                    type="text"
                    value={newBlogExcerpt}
                    onChange={(e) => setNewBlogExcerpt(e.target.value)}
                    placeholder="Brief description outline..."
                    className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Full Body Article Content</label>
                  <textarea
                    value={newBlogContent}
                    onChange={(e) => setNewBlogContent(e.target.value)}
                    placeholder="Write essay content..."
                    rows={6}
                    className="px-4 py-2.5 bg-[#111112] border border-[#26201C] focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-[#26201C]/50">
                  <label className="text-[9px] uppercase font-bold text-[#E5E0D8]/60">Cover Image Asset</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewBlogFileChange}
                      className="text-[10px] text-[#E5E0D8]/60 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-[#8C7A6B] file:text-[#111112] file:cursor-pointer"
                    />
                    {newBlogPreview && (
                      <div className="w-12 h-12 rounded-xl border border-[#26201C] overflow-hidden shrink-0 bg-brand-bg">
                        <img src={newBlogPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newBlogTitle || !newBlogContent}
                  onClick={handleAddBlogPost}
                  className="mt-2 py-3.5 bg-[#8C7A6B] hover:bg-[#79685A] text-[#111112] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl cursor-pointer disabled:opacity-30"
                >
                  Queue Article Publication
                </button>
              </div>

              {/* Published Grid */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C7A6B]">Published essays</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentContent.blogPosts.map((post) => {
                    const localPreview = blogPreviews[post.id];
                    return (
                      <div key={post.id} className="border border-[#26201C] rounded-2xl p-4 bg-[#161210] flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-14 rounded-xl border border-[#26201C] overflow-hidden shrink-0 bg-[#161210]/55">
                            {(localPreview || post.featuredImage) ? (
                              <img src={localPreview || post.featuredImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] opacity-40">Cover</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-[#E5E0D8] truncate leading-tight">{post.title}</h5>
                            <span className="text-[8px] text-[#8C7A6B] block mt-1 font-mono">{post.date}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlogPost(post.id)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase shrink-0 cursor-pointer"
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

          {/* Persistent Sync Status & Action Bar (Except overview tab) */}
          {activeTab !== "overview" && (
            <div className="border-t border-[#26201C] pt-6 flex flex-col gap-4 text-left">
              {saveStatus.type && (
                <div
                  className={`p-4 rounded-xl text-xs leading-normal ${
                    saveStatus.type === "success"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
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
                className="w-full py-4 bg-[#8C7A6B] hover:bg-[#79685A] text-[#111112] text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-xl cursor-pointer disabled:opacity-30 shadow-md"
              >
                {isSaving ? "Saving & Uploading Assets to Vercel Blob..." : "Commit All Changes & Sync Vercel Blob"}
              </button>
            </div>
          )}

        </form>
      </main>
    </div>
  );
}
