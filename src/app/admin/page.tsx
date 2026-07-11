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
        
        // WordPress-style auto-dismissing visual success toast notification
        setSaveStatus({
          type: "success",
          msg: "Success! Your changes have been saved.",
        });
        setTimeout(() => {
          setSaveStatus({ type: null, msg: "" });
        }, 3500);

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
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f1f1f1]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <span className="font-sans text-xl font-bold tracking-wider text-[#23282d]">Elena Yoga</span>
          <div className="w-12 h-1 bg-[#2271b1]/40" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#23282d]/70">Loading CMS Dashboard...</span>
        </div>
      </div>
    );
  }

  // Unauthorized: Center Light WordPress Admin Login
  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f1f1f1] px-6 py-12">
        <form
          onSubmit={handleAuthSubmit}
          className="bg-white border border-[#dcdcde] rounded-lg max-w-sm w-full p-8 flex flex-col gap-5 shadow-md text-left"
        >
          <div className="text-center pb-2 border-b border-[#f0f0f1]">
            <h4 className="text-xl font-sans text-[#1d2327] font-bold tracking-wide">WordPress CMS Login</h4>
            <p className="text-xs text-[#2c3338] mt-1">
              Enter your administration login credentials to manage website configs.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1d2327]">Username or Email Address</label>
              <input
                type="text"
                required
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Username"
                className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none rounded text-sm text-[#2c3338]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1d2327]">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none rounded text-sm text-[#2c3338]"
              />
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs rounded font-normal">
              <span className="font-bold block mb-0.5">Error</span>
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            Log In
          </button>
        </form>
      </div>
    );
  }

  const currentContent = editForm || content;
  if (!currentContent) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f1f1f1] text-[#1d2327]">
        Failed to construct configuration form.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#f1f1f1] text-[#2c3338] font-sans antialiased">
      
      {/* LEFT SIDEBAR: traditional WP dark slate drawer */}
      <aside className="w-full md:w-60 border-r border-[#2c3338]/10 bg-[#23282d] flex flex-col shrink-0">
        {/* Sidebar Brand Header */}
        <div className="p-4 bg-[#1d2327] flex items-center gap-2 border-b border-[#2c3338]/20 text-white shrink-0">
          <span className="text-sm font-bold tracking-wide">✦ Elena Yoga CMS</span>
        </div>

        {/* Navigation Drawer options */}
        <nav className="flex-1 py-3 flex flex-col">
          {[
            { id: "overview", label: "Dashboard" },
            { id: "heroAbout", label: "Hero & About" },
            { id: "offerings", label: "Yoga Classes" },
            { id: "portfolio", label: "Portfolio Gallery" },
            { id: "testimonials", label: "Testimonials" },
            { id: "blog", label: "Journal Blog" },
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
                className={`w-full text-left py-2.5 px-5 text-[13px] font-medium transition-colors cursor-pointer border-l-4 ${
                  active
                    ? "bg-[#1d2327] border-[#72aee6] text-white"
                    : "border-transparent text-[#c3c4c7] hover:bg-[#1d2327] hover:text-[#72aee6]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Drawer Footer */}
        <div className="p-4 border-t border-[#2c3338]/30 flex flex-col gap-2 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full text-center py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-200 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN INTERIOR WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* HEADER NAVIGATION & TOP BAR */}
        <header className="px-6 py-4 bg-white border-b border-[#dcdcde] flex justify-between items-center shrink-0">
          <h2 className="text-xl font-sans text-[#1d2327] font-semibold tracking-tight">
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "heroAbout" && "Hero & About Settings"}
            {activeTab === "offerings" && "Manage Yoga Classes"}
            {activeTab === "portfolio" && "Manage Portfolio Gallery"}
            {activeTab === "testimonials" && "Manage Testimonials"}
            {activeTab === "blog" && "Manage Journal Blog"}
          </h2>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded shadow-xs transition-colors"
          >
            View Website
          </a>
        </header>

        {/* Master CMS Form */}
        <form onSubmit={handleSaveAllChanges} className="p-6 md:p-8 flex flex-col gap-6 max-w-5xl text-left">
          
          {/* WordPress Success Toast Notification Notice banner */}
          {saveStatus.type === "success" && (
            <div className="bg-white border-l-4 border-[#46b450] p-4 rounded shadow-xs flex items-center justify-between text-xs text-[#2c3338] animate-fade-in shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[#46b450] font-bold text-sm">✓</span>
                <span>{saveStatus.msg}</span>
              </div>
            </div>
          )}

          {/* WordPress Error banner */}
          {saveStatus.type === "error" && (
            <div className="bg-white border-l-4 border-rose-500 p-4 rounded shadow-xs text-xs text-[#2c3338] shrink-0">
              <span className="font-bold block mb-0.5 text-rose-600">Save Error</span>
              {saveStatus.msg}
            </div>
          )}

          {/* TAB 1: OVERVIEW PANEL */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: "Yoga Classes", count: currentContent.offerings.length, tag: "Offerings" },
                { title: "Gallery Photos", count: currentContent.portfolio.length, tag: "Portfolio Items" },
                { title: "Client Reviews", count: currentContent.testimonials.length, tag: "Testimonials" },
                { title: "Journal Articles", count: currentContent.blogPosts.length, tag: "Blog Posts" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-[#dcdcde] p-5 rounded shadow-xs flex flex-col justify-between min-h-[110px]">
                  <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">{stat.title}</span>
                  <span className="text-3xl font-sans font-bold text-[#2271b1] my-1">{stat.count}</span>
                  <span className="text-[10px] text-[#8c8f94] font-semibold uppercase">{stat.tag}</span>
                </div>
              ))}

              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs col-span-full mt-2">
                <h4 className="text-base font-bold text-[#1d2327] mb-1">Welcome to Elena Yoga CMS</h4>
                <p className="text-xs text-[#2c3338] leading-relaxed max-w-3xl">
                  Use the left vertical navigation menu options to switch dashboard panels. You can upload banner photographs, edit somatic classes and rates, publish blog posts, and preview modifications live. Clicking "Save" instantly commits all changes to Vercel Blob storage.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HERO & ABOUT PANEL */}
          {activeTab === "heroAbout" && (
            <div className="flex flex-col gap-6">
              {/* Hero Settings Card */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Hero Background & Text Settings</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Hero Banner Main Title</label>
                  <input
                    type="text"
                    required
                    value={currentContent.heroTitle}
                    onChange={(e) => handleGeneralChange(e, "heroTitle")}
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs md:text-sm text-[#2c3338]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Hero Subtitle Description</label>
                  <textarea
                    required
                    rows={3}
                    value={currentContent.heroSubtitle}
                    onChange={(e) => handleGeneralChange(e, "heroSubtitle")}
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs md:text-sm text-[#2c3338] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-[#f0f0f1]">
                  <label className="text-xs font-bold text-[#1d2327]">Hero Background Image</label>
                  <div className="flex items-center gap-5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroFileChange}
                      className="text-xs text-[#2c3338]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#8c8f94] file:text-xs file:bg-white file:text-[#1d2327] file:cursor-pointer"
                    />
                    {(heroPreview || currentContent.heroImageUrl) && (
                      <div className="w-14 h-14 rounded border border-[#dcdcde] overflow-hidden bg-[#f1f1f1] shrink-0">
                        <img src={heroPreview || currentContent.heroImageUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* About Settings Card */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">About Biography Settings</h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Biography Body Copy</label>
                  <textarea
                    required
                    rows={6}
                    value={currentContent.aboutBioText}
                    onChange={(e) => handleGeneralChange(e, "aboutBioText")}
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs md:text-sm text-[#2c3338] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-[#f0f0f1]">
                  <label className="text-xs font-bold text-[#1d2327]">Instructor Profile Picture</label>
                  <div className="flex items-center gap-5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAboutFileChange}
                      className="text-xs text-[#2c3338]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#8c8f94] file:text-xs file:bg-white file:text-[#1d2327] file:cursor-pointer"
                    />
                    {(aboutPreview || currentContent.aboutImageUrl) && (
                      <div className="w-14 h-14 rounded border border-[#dcdcde] overflow-hidden bg-[#f1f1f1] shrink-0">
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
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">Offerings List ({currentContent.offerings.length})</span>
                <button
                  type="button"
                  onClick={handleAddOffering}
                  className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  + Add New Class
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {currentContent.offerings.map((offering, index) => {
                  const hasLocalPreview = offeringPreviews[offering.id];
                  return (
                    <div key={offering.id} className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4 relative">
                      <button
                        type="button"
                        onClick={() => handleDeleteOffering(offering.id)}
                        className="absolute top-6 right-6 text-xs font-bold text-rose-600 hover:text-rose-800 uppercase cursor-pointer"
                      >
                        ✕ Remove Class
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-[#1d2327]">Class Title</span>
                          <input
                            type="text"
                            required
                            value={offering.title}
                            onChange={(e) => handleOfferingChange(index, "title", e.target.value)}
                            className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-[#1d2327]">Hourly Rate ($)</span>
                          <input
                            type="number"
                            required
                            value={offering.price}
                            onChange={(e) => handleOfferingChange(index, "price", parseInt(e.target.value) || 0)}
                            className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-[#1d2327]">Description Details</span>
                        <textarea
                          required
                          rows={3}
                          value={offering.description}
                          onChange={(e) => handleOfferingChange(index, "description", e.target.value)}
                          className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338] resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2 pt-3 border-t border-[#f0f0f1]">
                        <span className="text-xs font-bold text-[#1d2327]">Class Card Image</span>
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOfferingFileChange(index, e.target.files?.[0] || null)}
                            className="text-xs text-[#2c3338]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#8c8f94] file:text-xs file:bg-white file:text-[#1d2327] file:cursor-pointer"
                          />
                          {(hasLocalPreview || offering.image) && (
                            <div className="w-12 h-12 rounded border border-[#dcdcde] overflow-hidden bg-[#f1f1f1] shrink-0">
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
            <div className="flex flex-col gap-6">
              {/* Insert Form */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">Upload Photo to Gallery</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Photo Title</label>
                    <input
                      type="text"
                      value={newPortTitle}
                      onChange={(e) => setNewPortTitle(e.target.value)}
                      placeholder="e.g. Alabaster Alignment"
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Gallery Tag Category</label>
                    <select
                      value={newPortCategory}
                      onChange={(e) => setNewPortCategory(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338] cursor-pointer"
                    >
                      <option value="Studio">Studio</option>
                      <option value="Classes">Classes</option>
                      <option value="Workshops">Workshops</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-[#f0f0f1]">
                  <label className="text-xs font-bold text-[#1d2327]">Select Image File</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewPortFileChange}
                      className="text-xs text-[#2c3338]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#8c8f94] file:text-xs file:bg-white file:text-[#1d2327] file:cursor-pointer"
                    />
                    {newPortPreview && (
                      <div className="w-12 h-12 rounded border border-[#dcdcde] overflow-hidden bg-[#f1f1f1] shrink-0">
                        <img src={newPortPreview} alt="New Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newPortTitle || !newPortFile}
                  onClick={handleAddPortfolioItem}
                  className="mt-2 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold uppercase rounded cursor-pointer disabled:opacity-30 transition-colors"
                >
                  Add Photo
                </button>
              </div>

              {/* List existing */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">Existing Gallery Photos</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentContent.portfolio.map((item) => {
                    const localPreview = portfolioPreviews[item.id];
                    return (
                      <div key={item.id} className="bg-white border border-[#dcdcde] rounded p-4 flex items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-14 rounded border border-[#dcdcde] overflow-hidden bg-[#f1f1f1] shrink-0">
                            {(localPreview || item.image) ? (
                              <img src={localPreview || item.image} alt="Thumbnail preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] opacity-40">Art</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[#1d2327] truncate leading-tight">{item.title}</h5>
                            <span className="text-[10px] uppercase font-bold text-[#2271b1] block mt-1">{item.category}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 uppercase shrink-0 cursor-pointer"
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
            <div className="flex flex-col gap-6">
              {/* Insert Form */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">Add Client Testimonial</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Client Name</label>
                    <input
                      type="text"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      placeholder="e.g. Claire Vance"
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Rating Score</label>
                    <select
                      value={newTestRating}
                      onChange={(e) => setNewTestRating(parseInt(e.target.value) || 5)}
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338] cursor-pointer"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Client Quote Text</label>
                  <textarea
                    value={newTestQuote}
                    onChange={(e) => setNewTestQuote(e.target.value)}
                    placeholder="Enter review quote..."
                    rows={3}
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Class context / Source description</label>
                  <input
                    type="text"
                    value={newTestSource}
                    onChange={(e) => setNewTestSource(e.target.value)}
                    placeholder="e.g. Private 1-on-1 Mentorship Client"
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                  />
                </div>

                <button
                  type="button"
                  disabled={!newTestName || !newTestQuote}
                  onClick={handleAddTestimonial}
                  className="mt-2 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold uppercase rounded cursor-pointer disabled:opacity-30 transition-colors"
                >
                  Add Testimonial
                </button>
              </div>

              {/* Existing List */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">Existing Reviews</span>
                <div className="flex flex-col gap-4">
                  {currentContent.testimonials.map((test) => (
                    <div key={test.id} className="bg-white border border-[#dcdcde] rounded p-6 flex justify-between items-start gap-6 shadow-xs">
                      <div className="flex-1 text-xs">
                        <span className="font-bold block text-[#1d2327] text-sm">{test.clientName} ({test.rating}★)</span>
                        <span className="text-[10px] text-[#2271b1] block font-bold mt-1">{test.source}</span>
                        <p className="text-xs text-[#2c3338] italic mt-2.5 leading-relaxed">&ldquo;{test.quote}&rdquo;</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(test.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 uppercase shrink-0 cursor-pointer"
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
            <div className="flex flex-col gap-6">
              {/* Insert Form */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">Publish New Blog Post</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Article Title</label>
                  <input
                    type="text"
                    value={newBlogTitle}
                    onChange={(e) => setNewBlogTitle(e.target.value)}
                    placeholder="e.g. Somatic Breathwork Nets"
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Category Tag</label>
                    <input
                      type="text"
                      value={newBlogCategory}
                      onChange={(e) => setNewBlogCategory(e.target.value)}
                      placeholder="Philosophy"
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Read Time duration</label>
                    <input
                      type="text"
                      value={newBlogReadTime}
                      onChange={(e) => setNewBlogReadTime(e.target.value)}
                      placeholder="5 min read"
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Excerpt Outline Summary</label>
                  <input
                    type="text"
                    value={newBlogExcerpt}
                    onChange={(e) => setNewBlogExcerpt(e.target.value)}
                    placeholder="Brief description outline..."
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Full Body Article Content</label>
                  <textarea
                    value={newBlogContent}
                    onChange={(e) => setNewBlogContent(e.target.value)}
                    placeholder="Write essay content..."
                    rows={6}
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-[#f0f0f1]">
                  <label className="text-xs font-bold text-[#1d2327]">Cover Image Asset</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewBlogFileChange}
                      className="text-xs text-[#2c3338]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#8c8f94] file:text-xs file:bg-white file:text-[#1d2327] file:cursor-pointer"
                    />
                    {newBlogPreview && (
                      <div className="w-12 h-12 rounded border border-[#dcdcde] overflow-hidden bg-[#f1f1f1] shrink-0">
                        <img src={newBlogPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newBlogTitle || !newBlogContent}
                  onClick={handleAddBlogPost}
                  className="mt-2 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold uppercase rounded cursor-pointer disabled:opacity-30 transition-colors"
                >
                  Publish Article
                </button>
              </div>

              {/* Published Grid */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">Published Articles</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentContent.blogPosts.map((post) => {
                    const localPreview = blogPreviews[post.id];
                    return (
                      <div key={post.id} className="bg-white border border-[#dcdcde] rounded p-4 flex items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-14 rounded border border-[#dcdcde] overflow-hidden bg-[#f1f1f1] shrink-0">
                            {(localPreview || post.featuredImage) ? (
                              <img src={localPreview || post.featuredImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] opacity-40">Cover</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[#1d2327] truncate leading-tight">{post.title}</h5>
                            <span className="text-[10px] text-[#2271b1] block mt-1">{post.date}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlogPost(post.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 uppercase shrink-0 cursor-pointer"
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

          {/* SIMPLIFIED Save Action Bar (Except overview tab) */}
          {activeTab !== "overview" && (
            <div className="border-t border-[#dcdcde] pt-6 flex flex-col gap-4 text-left">
              <button
                type="submit"
                disabled={isSaving}
                className="w-40 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold uppercase rounded shadow-xs cursor-pointer disabled:opacity-40 transition-colors"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}

        </form>
      </main>
    </div>
  );
}
