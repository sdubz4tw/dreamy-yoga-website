"use client";

import React, { useState, useEffect } from "react";
import { YogaContent, OfferingItem, PortfolioItem, TestimonialItem, BlogPostItem, LeadItem } from "@/types";

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
  const [activeTab, setActiveTab] = useState<"overview" | "heroAbout" | "offerings" | "portfolio" | "testimonials" | "blog" | "leads" | "customization">("overview");

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

  // Contact portrait upload
  const [contactPortraitFile, setContactPortraitFile] = useState<File | null>(null);
  const [contactPortraitPreview, setContactPortraitPreview] = useState<string>("");

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
  const [newBlogStatus, setNewBlogStatus] = useState<"draft" | "published">("published");
  const [newBlogTags, setNewBlogTags] = useState("");
  const [newBlogIsFeatured, setNewBlogIsFeatured] = useState(false);
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

  const handleContactPortraitFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setContactPortraitFile(file);
    if (file) setContactPortraitPreview(URL.createObjectURL(file));
    else setContactPortraitPreview("");
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

    const tagsArray = newBlogTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

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
      status: newBlogStatus,
      tags: tagsArray.length > 0 ? tagsArray : [newBlogCategory || "Philosophy"],
      isFeatured: newBlogIsFeatured,
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
    setNewBlogStatus("published");
    setNewBlogTags("");
    setNewBlogIsFeatured(false);
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

  // Compile Leads to structured Excel-compatible CSV Blob & Download
  const handleExportLeadsCSV = () => {
    const leads = editForm?.leads || content?.leads || [];
    if (leads.length === 0) {
      alert("No active leads in repository to export.");
      return;
    }

    const headers = ["Name", "Email", "Timestamp", "Message"];
    const rows = leads.map((lead) => [
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.email.replace(/"/g, '""')}"`,
      `"${new Date(lead.timestamp).toISOString()}"`,
      `"${lead.message.replace(/"/g, '""')}"`,
    ]);

    const csvString = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      if (contactPortraitFile) dataPayload.append("contactPortraitImage", contactPortraitFile);

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
        setContactPortraitFile(null);
        setHeroPreview("");
        setAboutPreview("");
        setContactPortraitPreview("");
        setOfferingFiles({});
        setOfferingPreviews({});
        setPortfolioFiles({});
        setPortfolioPreviews({});
        setBlogFiles({});
        setBlogPreviews({});
      } else {
        // Show exact error message to user
        setSaveStatus({
          type: "error",
          msg: `Error: ${result.error || "Failed to commit database modifications."}${
            result.details ? ` (${result.details})` : ""
          }`,
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: `Error: Failed to connect to dynamic serverless endpoint. Details: ${err?.message || String(err)}`,
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

  // Center Light WordPress Admin Login
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

  // Calculate unread leads count
  const newLeadsCount = currentContent.leads?.filter((l) => l.status === "New").length || 0;

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
            { id: "heroAbout", label: "Hero, About & Author" },
            { id: "offerings", label: "Yoga Classes" },
            { id: "portfolio", label: "Portfolio Gallery" },
            { id: "testimonials", label: "Testimonials" },
            { id: "blog", label: "Journal Blog" },
            { id: "leads", label: `Inquiries / Leads ${newLeadsCount > 0 ? `(${newLeadsCount})` : ""}` },
            { id: "customization", label: "Customization" },
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
            {activeTab === "heroAbout" && "Hero, About & Author Settings"}
            {activeTab === "offerings" && "Manage Yoga Classes"}
            {activeTab === "portfolio" && "Manage Portfolio Gallery"}
            {activeTab === "testimonials" && "Manage Testimonials"}
            {activeTab === "blog" && "Manage Journal Blog"}
            {activeTab === "leads" && "Manage Inquiries / Leads"}
            {activeTab === "customization" && "Customization"}
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
            <div className="flex flex-col gap-6">
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
              </div>

              {/* Studio branding configuration */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Global Branding Settings</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d2327]">Studio Business Name (displays globally in headers and footers)</label>
                  <input
                    type="text"
                    required
                    value={currentContent.studioName || ""}
                    onChange={(e) => {
                      if (!editForm) return;
                      setEditForm({ ...editForm, studioName: e.target.value });
                    }}
                    placeholder="Elena Yoga"
                    className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs md:text-sm text-[#2c3338] max-w-md"
                  />
                </div>
              </div>

              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs">
                <h4 className="text-base font-bold text-[#1d2327] mb-1">Welcome to Elena Yoga CMS</h4>
                <p className="text-xs text-[#2c3338] leading-relaxed max-w-3xl">
                  Use the left vertical navigation menu options to switch dashboard panels. You can customize studio naming, check leads list, hide main pages blocks, configure class cards, publish articles, and verify layout integrations. Clicking "Save" instantly commits all changes to local storage or Vercel Blob.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HERO & ABOUT & AUTHOR PANEL */}
          {activeTab === "heroAbout" && (
            <div className="flex flex-col gap-6">
              {/* Section Visibility toggles */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Hero & About Section Visibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Hero Section Banner</label>
                    <select
                      value={currentContent.hideHero ? "off" : "on"}
                      onChange={(e) => {
                        if (!editForm) return;
                        setEditForm({ ...editForm, hideHero: e.target.value === "off" });
                      }}
                      className="px-3.5 py-2 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    >
                      <option value="on">On (Visible)</option>
                      <option value="off">Off (Hidden)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">About Me Section</label>
                    <select
                      value={currentContent.hideAbout ? "off" : "on"}
                      onChange={(e) => {
                        if (!editForm) return;
                        setEditForm({ ...editForm, hideAbout: e.target.value === "off" });
                      }}
                      className="px-3.5 py-2 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    >
                      <option value="on">On (Visible)</option>
                      <option value="off">Off (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

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

              {/* Global Author Settings Card */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Global Blog Author Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Author Display Name</label>
                    <input
                      type="text"
                      value={currentContent.authorName || ""}
                      onChange={(e) => {
                        if (!editForm) return;
                        setEditForm({ ...editForm, authorName: e.target.value });
                      }}
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs md:text-sm text-[#2c3338]"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Author Biography Bio</label>
                    <input
                      type="text"
                      value={currentContent.authorBio || ""}
                      onChange={(e) => {
                        if (!editForm) return;
                        setEditForm({ ...editForm, authorBio: e.target.value });
                      }}
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs md:text-sm text-[#2c3338]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFERINGS CRUD PANEL */}
          {activeTab === "offerings" && (
            <div className="flex flex-col gap-5">
              {/* Offerings visibility toggle */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Offerings Section Visibility</h3>
                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-bold text-[#1d2327]">Offerings Section</label>
                  <select
                    value={currentContent.hideOfferings ? "off" : "on"}
                    onChange={(e) => {
                      if (!editForm) return;
                      setEditForm({ ...editForm, hideOfferings: e.target.value === "off" });
                    }}
                    className="px-3.5 py-2 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                  >
                    <option value="on">On (Visible)</option>
                    <option value="off">Off (Hidden)</option>
                  </select>
                </div>
              </div>

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
                          <span className="text-xs font-bold text-[#1d2327]">Flat Fee Price ($)</span>
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
              {/* Portfolio visibility toggle */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Portfolio Section Visibility</h3>
                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-bold text-[#1d2327]">Portfolio Section</label>
                  <select
                    value={currentContent.hidePortfolio ? "off" : "on"}
                    onChange={(e) => {
                      if (!editForm) return;
                      setEditForm({ ...editForm, hidePortfolio: e.target.value === "off" });
                    }}
                    className="px-3.5 py-2 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                  >
                    <option value="on">On (Visible)</option>
                    <option value="off">Off (Hidden)</option>
                  </select>
                </div>
              </div>

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
              {/* Testimonials visibility toggle */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Testimonials Section Visibility</h3>
                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-bold text-[#1d2327]">Testimonials Section</label>
                  <select
                    value={currentContent.hideTestimonials ? "off" : "on"}
                    onChange={(e) => {
                      if (!editForm) return;
                      setEditForm({ ...editForm, hideTestimonials: e.target.value === "off" });
                    }}
                    className="px-3.5 py-2 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                  >
                    <option value="on">On (Visible)</option>
                    <option value="off">Off (Hidden)</option>
                  </select>
                </div>
              </div>

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
              {/* Blog visibility toggle */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Blog Section Visibility</h3>
                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-bold text-[#1d2327]">Philosophy Journal Section</label>
                  <select
                    value={currentContent.hideBlog ? "off" : "on"}
                    onChange={(e) => {
                      if (!editForm) return;
                      setEditForm({ ...editForm, hideBlog: e.target.value === "off" });
                    }}
                    className="px-3.5 py-2 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                  >
                    <option value="on">On (Visible)</option>
                    <option value="off">Off (Hidden)</option>
                  </select>
                </div>
              </div>

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

                {/* Status, Tags, and Pin options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#f0f0f1]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Post Status</label>
                    <select
                      value={newBlogStatus}
                      onChange={(e) => setNewBlogStatus(e.target.value as any)}
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338] cursor-pointer"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Categories/Tags (comma separated)</label>
                    <input
                      type="text"
                      value={newBlogTags}
                      onChange={(e) => setNewBlogTags(e.target.value)}
                      placeholder="e.g. Vinyasa, Meditation"
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 justify-center pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="newBlogIsFeatured"
                        checked={newBlogIsFeatured}
                        onChange={(e) => setNewBlogIsFeatured(e.target.checked)}
                        className="w-4 h-4 text-[#2271b1] border-[#8c8f94] rounded focus:ring-[#2271b1] cursor-pointer"
                      />
                      <label htmlFor="newBlogIsFeatured" className="text-xs font-bold text-[#1d2327] cursor-pointer select-none">
                        Pin as Featured Post
                      </label>
                    </div>
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

              {/* Published List with Quick inline edits */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">Published Articles & Drafts</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentContent.blogPosts.map((post) => {
                    const localPreview = blogPreviews[post.id];
                    return (
                      <div key={post.id} className="bg-white border border-[#dcdcde] rounded p-5 flex flex-col gap-3 shadow-xs">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-14 h-14 rounded border border-[#dcdcde] overflow-hidden bg-[#f1f1f1] shrink-0">
                              {(localPreview || post.featuredImage) ? (
                                  <img src={localPreview || post.featuredImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] opacity-40">Cover</div>
                                )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-[#1d2327] truncate leading-tight">
                                {post.title} {post.isFeatured && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono ml-1 font-bold">Featured</span>}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-[#2271b1] font-semibold">{post.date}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase font-mono ${
                                  post.status === "draft" ? "bg-gray-100 text-gray-700" : "bg-emerald-50 text-emerald-700"
                                }`}>
                                  {post.status || "published"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlogPost(post.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 uppercase shrink-0 cursor-pointer animate-fade-in"
                          >
                            Delete
                          </button>
                        </div>

                        {/* Inline editor panel */}
                        <div className="grid grid-cols-2 gap-3 border-t border-[#f0f0f1] pt-3 text-left">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-[#1d2327] uppercase">Post Status</label>
                            <select
                              value={post.status || "published"}
                              onChange={(e) => {
                                if (!editForm) return;
                                const updated = editForm.blogPosts.map((b) =>
                                  b.id === post.id ? { ...b, status: e.target.value as any } : b
                                );
                                setEditForm({ ...editForm, blogPosts: updated });
                              }}
                              className="px-2 py-1 bg-white border border-[#8c8f94] rounded text-[11px] text-[#2c3338]"
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1 justify-center pt-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                id={`isFeatured_${post.id}`}
                                checked={post.isFeatured || false}
                                onChange={(e) => {
                                  if (!editForm) return;
                                  const updated = editForm.blogPosts.map((b) =>
                                    b.id === post.id ? { ...b, isFeatured: e.target.checked } : b
                                  );
                                  setEditForm({ ...editForm, blogPosts: updated });
                                }}
                                className="w-3.5 h-3.5 text-[#2271b1] border-[#8c8f94] rounded focus:ring-[#2271b1] cursor-pointer"
                              />
                              <label htmlFor={`isFeatured_${post.id}`} className="text-[11px] font-bold text-[#1d2327] cursor-pointer select-none">
                                Featured Pin
                              </label>
                            </div>
                          </div>

                          <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-[#1d2327] uppercase">Tags (comma separated)</label>
                            <input
                              type="text"
                              value={Array.isArray(post.tags) ? post.tags.join(", ") : ""}
                              onChange={(e) => {
                                if (!editForm) return;
                                const updated = editForm.blogPosts.map((b) =>
                                  b.id === post.id
                                    ? { ...b, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }
                                    : b
                                );
                                setEditForm({ ...editForm, blogPosts: updated });
                              }}
                              className="px-2 py-1 bg-white border-[#8c8f94] rounded text-[11px] text-[#2c3338]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LEADS PANEL */}
          {activeTab === "leads" && (
            <div className="flex flex-col gap-6 text-left">
              {/* Notification setting & CSV Export Card at the top */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Leads Integration & Settings</h3>
                
                <div className="flex flex-col md:flex-row md:items-end gap-5">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Notification Email Address</label>
                    <input
                      type="email"
                      required
                      value={currentContent.contactEmail || ""}
                      onChange={(e) => {
                        if (!editForm) return;
                        setEditForm({ ...editForm, contactEmail: e.target.value });
                      }}
                      placeholder="elena@example.com"
                      className="px-3.5 py-2 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExportLeadsCSV}
                    className="h-9 px-4 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-xs"
                  >
                    Export All Leads (CSV)
                  </button>
                </div>
              </div>

              {/* Leads inbox review */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Visitor Inquiries Inbox</h3>
                
                {(!currentContent.leads || currentContent.leads.length === 0) ? (
                  <div className="p-8 text-center text-[#8c8f94] italic text-sm">
                    No inquiries received yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#dcdcde] bg-[#f9f9f9]">
                          <th className="p-3 font-bold text-[#1d2327] w-36">Name</th>
                          <th className="p-3 font-bold text-[#1d2327] w-48">Email</th>
                          <th className="p-3 font-bold text-[#1d2327] w-44">Date / Time</th>
                          <th className="p-3 font-bold text-[#1d2327]">Inquiry Message</th>
                          <th className="p-3 font-bold text-[#1d2327] w-24 text-center">Status</th>
                          <th className="p-3 font-bold text-[#1d2327] w-48 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentContent.leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-[#f0f0f1] hover:bg-[#fafafa]">
                            <td className="p-3 font-bold text-[#1d2327]">{lead.name}</td>
                            <td className="p-3">
                              <a href={`mailto:${lead.email}`} className="text-[#2271b1] hover:underline font-mono">{lead.email}</a>
                            </td>
                            <td className="p-3 text-[#8c8f94] font-mono">
                              {new Date(lead.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3 whitespace-pre-wrap leading-relaxed text-[#2c3338]">{lead.message}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                lead.status === "New" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
                              }`}>
                                {lead.status || "New"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!editForm) return;
                                    const updated = editForm.leads?.map(l => l.id === lead.id ? { ...l, status: (l.status === "New" ? "Read" : "New") as "New" | "Read" } : l) || [];
                                    setEditForm({ ...editForm, leads: updated });
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold border border-[#8c8f94] rounded bg-white hover:bg-[#f9f9f9] text-[#2c3338] cursor-pointer"
                                >
                                  {lead.status === "New" ? "Mark Read" : "Mark New"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!editForm) return;
                                    const updated = editForm.leads?.filter(l => l.id !== lead.id) || [];
                                    setEditForm({ ...editForm, leads: updated });
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold border border-rose-300 rounded bg-white hover:bg-rose-50 text-rose-600 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────── CUSTOMIZATION TAB ───────────── */}
          {activeTab === "customization" && editForm && (
            <div className="flex flex-col gap-8">

              {/* Contact Portrait Uploader */}
              <div className="bg-white border border-[#dcdcde] rounded-lg p-6 flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold text-[#1d2327] mb-1">Contact Section Portrait</h3>
                  <p className="text-xs text-[#646970]">Upload a photo of Elena that will appear as a portrait column beside the inquiry form on the public website.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {(contactPortraitPreview || editForm.contactPortraitUrl) && (
                    <div className="w-36 h-44 rounded-lg overflow-hidden border border-[#dcdcde] shrink-0">
                      <img
                        src={contactPortraitPreview || editForm.contactPortraitUrl}
                        alt="Contact portrait preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-3 flex-1">
                    <label className="text-xs font-semibold text-[#1d2327]">Upload Portrait Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleContactPortraitFileChange}
                      className="text-xs text-[#2c3338] file:mr-3 file:py-1.5 file:px-4 file:rounded file:border file:border-[#8c8f94] file:bg-white file:text-xs file:font-medium file:cursor-pointer"
                    />
                    {editForm.contactPortraitUrl && !contactPortraitFile && (
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, contactPortraitUrl: "" })}
                        className="text-[11px] text-rose-600 hover:underline text-left w-max"
                      >
                        Remove portrait
                      </button>
                    )}
                    <p className="text-[11px] text-[#646970]">Recommended: portrait orientation (e.g. 600×800px). JPG or PNG.</p>
                  </div>
                </div>
              </div>

              {/* Theme Color Scheme */}
              <div className="bg-white border border-[#dcdcde] rounded-lg p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-semibold text-[#1d2327] mb-1">Theme Color Scheme</h3>
                  <p className="text-xs text-[#646970]">Set the primary design tokens for the public website. Changes take effect immediately after saving.</p>
                </div>

                {/* Preset palette quick-select buttons */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#1d2327]">Quick Palette Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Dark Espresso", primary: "#8C7A6B", background: "#0B0807", card: "#161210", text: "#E5E0D8", accent: "#6B5D51" },
                      { label: "Deep Ocean", primary: "#4A90A4", background: "#050F14", card: "#0D1E26", text: "#D8EBF0", accent: "#2E6B7E" },
                      { label: "Forest Sage", primary: "#6B8F71", background: "#070E08", card: "#101A11", text: "#D8EAD9", accent: "#4A6B4F" },
                      { label: "Onyx Rose", primary: "#A07080", background: "#0E090B", card: "#1C1014", text: "#EAD8DC", accent: "#7A5060" },
                      { label: "Warm Stone", primary: "#B09070", background: "#100E0A", card: "#1E1A14", text: "#EDE5D8", accent: "#8A7050" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setEditForm({
                          ...editForm,
                          themePrimary: preset.primary,
                          themeBackground: preset.background,
                          themeCard: preset.card,
                          themeText: preset.text,
                          themeAccent: preset.accent,
                        })}
                        className="flex items-center gap-2 px-3 py-1.5 border border-[#dcdcde] rounded bg-white hover:bg-[#f6f7f7] text-xs font-medium text-[#2c3338] cursor-pointer"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-[#dcdcde] shrink-0"
                          style={{ backgroundColor: preset.primary }}
                        />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual color token pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { field: "themePrimary", label: "Primary / Accent Color", desc: "Buttons, tags, links" },
                    { field: "themeBackground", label: "Page Background", desc: "Main body background" },
                    { field: "themeCard", label: "Card Background", desc: "Post cards, panels" },
                    { field: "themeText", label: "Primary Text Color", desc: "Headlines, body text" },
                    { field: "themeAccent", label: "Secondary Accent", desc: "Borders, subtle glows" },
                  ].map(({ field, label, desc }) => (
                    <div key={field} className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[#1d2327]">{label}</label>
                      <p className="text-[11px] text-[#646970] -mt-1">{desc}</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={(editForm as any)[field] || "#000000"}
                          onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                          className="w-10 h-10 rounded border border-[#8c8f94] cursor-pointer bg-white p-0.5"
                        />
                        <input
                          type="text"
                          value={(editForm as any)[field] || ""}
                          onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                          placeholder="#000000"
                          maxLength={7}
                          className="px-3 py-2 border border-[#8c8f94] rounded text-xs text-[#2c3338] w-28 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ambient Audio Presets */}
              <div className="bg-white border border-[#dcdcde] rounded-lg p-6 flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold text-[#1d2327] mb-1">Ambient Audio</h3>
                  <p className="text-xs text-[#646970]">When enabled, a subtle ambient sound plays at very low volume on the visitor's first click or interaction with the site.</p>
                </div>

                {/* On/Off Toggle */}
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-[#1d2327]">Ambient Audio</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, audioEnabled: true })}
                      className={`px-4 py-1.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                        editForm.audioEnabled
                          ? "bg-[#2271b1] text-white border-[#2271b1]"
                          : "bg-white text-[#646970] border-[#dcdcde] hover:bg-[#f6f7f7]"
                      }`}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, audioEnabled: false })}
                      className={`px-4 py-1.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                        !editForm.audioEnabled
                          ? "bg-[#2271b1] text-white border-[#2271b1]"
                          : "bg-white text-[#646970] border-[#dcdcde] hover:bg-[#f6f7f7]"
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>

                {/* Preset Selection */}
                {editForm.audioEnabled && (
                  <div className="flex flex-col gap-3 pl-1">
                    <label className="text-xs font-semibold text-[#1d2327]">Audio Preset</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { value: "tibetan-bowl", label: "Tibetan Bowl", desc: "Warm, resonant bowl singing tones" },
                        { value: "sacred-gong", label: "Sacred Gong", desc: "Deep, expansive gong reverberations" },
                        { value: "peace-chimes", label: "Peace Chimes", desc: "Gentle wind chime ambience" },
                      ].map((preset) => (
                        <label
                          key={preset.value}
                          className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-[#f6f7f7] transition-colors"
                          style={{ borderColor: editForm.audioPreset === preset.value ? "#2271b1" : "#dcdcde", backgroundColor: editForm.audioPreset === preset.value ? "#f0f6fc" : "" }}
                        >
                          <input
                            type="radio"
                            name="audioPreset"
                            value={preset.value}
                            checked={editForm.audioPreset === preset.value}
                            onChange={() => setEditForm({ ...editForm, audioPreset: preset.value as any })}
                            className="mt-0.5 accent-[#2271b1]"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#1d2327]">{preset.label}</span>
                            <p className="text-[11px] text-[#646970] mt-0.5">{preset.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Footer */}
              <div className="bg-white border border-[#dcdcde] rounded-lg p-6 flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold text-[#1d2327] mb-1">Social Media Footer Icons</h3>
                  <p className="text-xs text-[#646970]">When enabled, social media icons will appear in the public website footer. Leave a handle blank to hide that platform's icon.</p>
                </div>

                {/* Master On/Off Toggle */}
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-[#1d2327]">Show Social Icons in Footer</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, socialEnabled: true })}
                      className={`px-4 py-1.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                        editForm.socialEnabled
                          ? "bg-[#2271b1] text-white border-[#2271b1]"
                          : "bg-white text-[#646970] border-[#dcdcde] hover:bg-[#f6f7f7]"
                      }`}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, socialEnabled: false })}
                      className={`px-4 py-1.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                        !editForm.socialEnabled
                          ? "bg-[#2271b1] text-white border-[#2271b1]"
                          : "bg-white text-[#646970] border-[#dcdcde] hover:bg-[#f6f7f7]"
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#646970]">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={editForm.socialInstagram || ""}
                      onChange={(e) => setEditForm({ ...editForm, socialInstagram: e.target.value })}
                      placeholder="@elenayoga"
                      className="px-3 py-2.5 border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#646970]">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook Handle
                    </label>
                    <input
                      type="text"
                      value={editForm.socialFacebook || ""}
                      onChange={(e) => setEditForm({ ...editForm, socialFacebook: e.target.value })}
                      placeholder="ElenaMindfulYoga"
                      className="px-3 py-2.5 border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#646970]">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      YouTube Channel
                    </label>
                    <input
                      type="text"
                      value={editForm.socialYoutube || ""}
                      onChange={(e) => setEditForm({ ...editForm, socialYoutube: e.target.value })}
                      placeholder="@ElenaMindfulYoga"
                      className="px-3 py-2.5 border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SIMPLIFIED Save Action Bar */}
          <div className="border-t border-[#dcdcde] pt-6 flex flex-col gap-4 text-left">
            <button
              type="submit"
              disabled={isSaving}
              className="w-40 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold uppercase rounded shadow-xs cursor-pointer disabled:opacity-40 transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
