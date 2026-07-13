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
  const [activeTab, setActiveTab] = useState<"overview" | "heroAbout" | "offerings" | "portfolio" | "testimonials" | "blog" | "bookSession" | "contactMe" | "customization">("overview");

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

  // Editing blog post modal states
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostExcerpt, setEditPostExcerpt] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostCategory, setEditPostCategory] = useState("Philosophy");
  const [editPostStatus, setEditPostStatus] = useState<"draft" | "published">("published");
  const [editPostTags, setEditPostTags] = useState("");
  const [editPostIsFeatured, setEditPostIsFeatured] = useState(false);
  const [editPostFile, setEditPostFile] = useState<File | null>(null);
  const [editPostPreview, setEditPostPreview] = useState("");

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

  const startEditingPost = (post: BlogPostItem) => {
    setEditingPost(post);
    setEditPostTitle(post.title);
    setEditPostExcerpt(post.excerpt || "");
    setEditPostContent(post.content);
    setEditPostCategory(post.category || "Philosophy");
    setEditPostStatus(post.status || "published");
    setEditPostTags(Array.isArray(post.tags) ? post.tags.join(", ") : "");
    setEditPostIsFeatured(post.isFeatured || false);
    setEditPostFile(null);
    setEditPostPreview(post.featuredImage || "");
  };

  const handleEditPostFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditPostFile(file);
    if (file) setEditPostPreview(URL.createObjectURL(file));
  };

  const handleSavePostEdit = async () => {
    if (!editForm || !editingPost) return;

    const updatedPosts = editForm.blogPosts.map((b) => {
      if (b.id === editingPost.id) {
        return {
          ...b,
          title: editPostTitle,
          excerpt: editPostExcerpt,
          content: editPostContent,
          category: editPostCategory,
          status: editPostStatus,
          tags: editPostTags.split(",").map((t) => t.trim()).filter(Boolean),
          isFeatured: editPostIsFeatured,
        };
      }
      return b;
    });

    const newForm = { ...editForm, blogPosts: updatedPosts };

    setIsSaving(true);
    setSaveStatus({ type: null, msg: "" });

    try {
      const dataPayload = new FormData();
      dataPayload.append("content", JSON.stringify(newForm));

      if (editPostFile) {
        dataPayload.append("blogImage_" + editingPost.id, editPostFile);
      }

      if (heroFile) dataPayload.append("heroImage", heroFile);
      if (aboutFile) dataPayload.append("aboutImage", aboutFile);
      if (contactPortraitFile) dataPayload.append("contactPortraitImage", contactPortraitFile);
      Object.entries(offeringFiles).forEach(([id, file]) => {
        dataPayload.append("offeringImage_" + id, file);
      });
      Object.entries(portfolioFiles).forEach(([id, file]) => {
        dataPayload.append("portfolioImage_" + id, file);
      });
      Object.entries(blogFiles).forEach(([id, file]) => {
        if (id !== editingPost.id) {
          dataPayload.append("blogImage_" + id, file);
        }
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
          msg: "Success! Article changes have been saved.",
        });
        setTimeout(() => {
          setSaveStatus({ type: null, msg: "" });
        }, 3500);

        setEditPostFile(null);
        setEditingPost(null);
      } else {
        setSaveStatus({
          type: "error",
          msg: `Error: ${result.error || "Failed to commit article changes."}`,
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: `Error: ${err.message || "Failed to save changes."}`,
      });
    } finally {
      setIsSaving(false);
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

  // Export live content data to JSON for portability
  const handleExportAllContent = async () => {
    try {
      const res = await fetch("/api/content?t=" + Date.now());
      if (!res.ok) throw new Error("Failed to retrieve live backup copy.");
      const data = await res.json();
      
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `dreamy-yoga-site-backup-${dateStr}.json`;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const objectUrl = URL.createObjectURL(blob);
      
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = fileName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(objectUrl);

      // Show success alert toast
      setSaveStatus({
        type: "success",
        msg: "Success! Website backup downloaded successfully.",
      });
      setTimeout(() => {
        setSaveStatus({ type: null, msg: "" });
      }, 3500);
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: `Error: ${err.message || "Failed to download backup."}`,
      });
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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0807] px-6 py-12 text-[#E5E0D8]">
        <form
          onSubmit={handleAuthSubmit}
          className="bg-[#161210] border border-[#8C7A6B]/20 rounded-3xl max-w-sm w-full p-8 flex flex-col gap-5 shadow-lg text-left"
        >
          <div className="text-center pb-2 border-b border-[#8C7A6B]/20">
            <h4 className="text-xl font-serif text-[#E5E0D8] font-normal tracking-wide">Yoga CMS Portal Login</h4>
            <p className="text-xs text-[#E5E0D8]/60 mt-1">
              Enter your administration login credentials to manage website configs.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Username or Email Address</label>
              <input
                type="text"
                required
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Username"
                className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
              />
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-955/40 border-l-4 border-rose-500 text-rose-200 text-xs rounded font-normal border border-rose-500/20">
              <span className="font-bold block mb-0.5">Error</span>
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-[#8C7A6B] hover:bg-[#6B5D51] text-[#0B0807] text-xs font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0807] text-[#E5E0D8] font-serif">
        Failed to construct configuration form.
      </div>
    );
  }

  // Calculate unread leads count
  const newLeadsCount = currentContent.leads?.filter((l) => l.status === "New").length || 0;

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#f1f1f1] text-[#2c3338] font-sans antialiased">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in {
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          /* Visual Editor Dark Mode overrides */
          .bg-white {
            background-color: #161210 !important;
          }
          .border-\\[\\#dcdcde\\] {
            border-color: rgba(140, 122, 107, 0.2) !important;
          }
          .text-\\[\\#1d2327\\] {
            color: #E5E0D8 !important;
          }
          .text-\\[\\#2c3338\\] {
            color: #E5E0D8 !important;
          }
          .text-\\[\\#646970\\] {
            color: rgba(229, 224, 216, 0.6) !important;
          }
          .text-\\[\\#8c8f94\\] {
            color: rgba(229, 224, 216, 0.4) !important;
          }
          .border-b-\\[\\#f0f0f1\\] {
            border-bottom-color: rgba(140, 122, 107, 0.2) !important;
          }
          input[type="text"], 
          input[type="number"], 
          input[type="email"], 
          input[type="password"], 
          textarea, 
          select {
            background-color: rgba(140, 122, 107, 0.1) !important;
            border-color: rgba(140, 122, 107, 0.4) !important;
            color: #E5E0D8 !important;
            border-radius: 0.75rem !important;
            font-family: inherit !important;
          }
          input[type="text"]:focus, 
          input[type="number"]:focus, 
          input[type="email"]:focus, 
          input[type="password"]:focus, 
          textarea:focus, 
          select:focus {
            border-color: #8C7A6B !important;
            outline: none !important;
          }
          h3, h4 {
            font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
            font-weight: 300 !important;
            letter-spacing: 0.05em !important;
          }
          .hover\\:bg-\\[\\#fafafa\\]:hover {
            background-color: rgba(140, 122, 107, 0.05) !important;
          }
          .bg-\\[\\#f9f9f9\\] {
            background-color: #0B0807 !important;
          }
          .border-b-\\[\\#f0f0f1\\] {
            border-bottom-color: rgba(140, 122, 107, 0.2) !important;
          }
          .bg-\\[\\#2271b1\\] {
            background-color: #8C7A6B !important;
            color: #0B0807 !important;
          }
          .hover\\:bg-\\[\\#135e96\\]:hover {
            background-color: #6B5D51 !important;
            color: #0B0807 !important;
          }
          .border-\\[\\#8c8f94\\] {
            border-color: rgba(140, 122, 107, 0.4) !important;
          }
        `
      }} />
      
      {/* LEFT SIDEBAR: cohesive visual editor dark drawer */}
      <aside className="w-full md:w-60 border-r border-[#8C7A6B]/20 bg-[#161210] flex flex-col shrink-0">
        {/* Sidebar Brand Header */}
        <div className="p-4 bg-[#0B0807] flex items-center gap-2 border-b border-[#8C7A6B]/20 text-[#E5E0D8] shrink-0 font-serif">
          <span className="text-sm font-semibold tracking-wide">✦ Yoga website dashboard</span>
        </div>

        {/* Navigation Drawer options */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5">
          {[
            { id: "overview", label: "Dashboard" },
            { id: "heroAbout", label: "Hero & About Me" },
            { id: "offerings", label: "Offerings" },
            { id: "portfolio", label: "Portfolio Gallery" },
            { id: "testimonials", label: "Testimonials" },
            { id: "blog", label: "Philosophy Journal" },
            { id: "bookSession", label: "Book a Session" },
            { id: "contactMe", label: `Contact Me ${newLeadsCount > 0 ? `(${newLeadsCount})` : ""}` },
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
                    ? "bg-[#0B0807] border-[#8C7A6B] text-[#E5E0D8]"
                    : "border-transparent text-[#E5E0D8]/60 hover:bg-[#0B0807] hover:text-[#E5E0D8]"
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
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0B0807] text-[#E5E0D8]">
        
        {/* HEADER NAVIGATION & TOP BAR */}
        <header className="px-6 py-4 bg-[#161210] border-b border-[#8C7A6B]/20 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-serif text-[#E5E0D8] font-light tracking-wide">
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "heroAbout" && "Hero & About Me Settings"}
            {activeTab === "offerings" && "Manage Offerings"}
            {activeTab === "portfolio" && "Manage Portfolio Gallery"}
            {activeTab === "testimonials" && "Manage Testimonials"}
            {activeTab === "blog" && "Manage Philosophy Journal"}
            {activeTab === "bookSession" && "Manage Booking Form"}
            {activeTab === "contactMe" && "Contact Me Inbox"}
            {activeTab === "customization" && "Customization"}
          </h2>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#8C7A6B] hover:bg-[#6B5D51] text-[#0B0807] text-xs font-bold uppercase rounded-full tracking-wider transition-colors cursor-pointer"
          >
            View Website
          </a>
        </header>

        {/* Master CMS Form */}
        <form onSubmit={handleSaveAllChanges} className="p-6 md:p-8 flex flex-col gap-6 max-w-5xl text-left">
          
          {/* WordPress Success Toast Notification - Floating popup */}
          {saveStatus.type === "success" && (
            <div className="fixed top-5 right-5 z-50 bg-[#161210] border border-[#8C7A6B]/30 border-l-4 border-l-[#8C7A6B] p-4 rounded-md shadow-lg flex items-center gap-3 text-sm text-[#E5E0D8] animate-slide-in max-w-sm">
              <span className="text-[#8C7A6B] bg-[#8C7A6B]/10 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">✓</span>
              <div>
                <p className="font-bold text-[#E5E0D8]">System Alert</p>
                <p className="text-xs text-[#E5E0D8]/60 mt-0.5">{saveStatus.msg}</p>
              </div>
            </div>
          )}

          {/* WordPress Error banner */}
          {saveStatus.type === "error" && (
            <div className="fixed top-5 right-5 z-50 bg-[#161210] border border-rose-500/30 border-l-4 border-l-rose-500 p-4 rounded-md shadow-lg flex items-start gap-3 text-sm text-[#E5E0D8] animate-slide-in max-w-sm">
              <span className="text-rose-400 bg-rose-500/10 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">✕</span>
              <div>
                <p className="font-bold text-rose-400">Save Error</p>
                <p className="text-xs text-[#E5E0D8]/60 mt-0.5">{saveStatus.msg}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSaveStatus({ type: null, msg: "" })}
                className="text-xs text-[#8c8f94] hover:text-[#E5E0D8] ml-auto cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW PANEL */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { title: "Offerings", count: currentContent.offerings.length, tag: "Offerings" },
                  { title: "Gallery Photos", count: currentContent.portfolio.length, tag: "Portfolio Items" },
                  { title: "Client Reviews", count: currentContent.testimonials.length, tag: "Testimonials" },
                  { title: "Journal Articles", count: currentContent.blogPosts.length, tag: "Blog Posts" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161210] border border-[#8C7A6B]/20 p-5 rounded-3xl flex flex-col justify-between min-h-[110px] shadow-md">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">{stat.title}</span>
                    <span className="text-3xl font-sans font-bold text-[#8C7A6B] my-1">{stat.count}</span>
                    <span className="text-[10px] text-[#E5E0D8]/40 font-semibold uppercase tracking-wider">{stat.tag}</span>
                  </div>
                ))}
              </div>

              {/* Data Backup & Portability Section */}
              <div className="bg-[#161210] border border-[#8C7A6B]/20 p-6 md:p-8 rounded-3xl flex flex-col gap-5 shadow-md text-left">
                <div>
                  <h3 className="text-lg font-serif font-light text-[#E5E0D8] border-b border-[#8C7A6B]/20 pb-3 mb-1">Data Backup & Portability</h3>
                  <p className="text-xs text-[#E5E0D8]/60">Download or export all website content and configurations safely.</p>
                </div>

                <div className="flex flex-col gap-2 max-w-xl text-left">
                  <button
                    type="button"
                    onClick={handleExportAllContent}
                    className="w-fit px-6 py-3 bg-[#8C7A6B] hover:bg-[#6B5D51] text-[#0B0807] text-xs font-bold uppercase rounded-full shadow-md cursor-pointer transition-colors"
                  >
                    Export All Website Content (JSON)
                  </button>
                  <p className="text-[11px] text-[#E5E0D8]/50 mt-1 leading-relaxed">
                    This downloads a universal master copy of all your custom text, offerings, journal articles, drafts, and settings. You can use this file to fully restore your content or migrate it to another platform at any time.
                  </p>
                </div>
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

                {/* ── Hero Text Labels ── */}
                <div className="pt-2 border-t border-[#f0f0f1] flex flex-col gap-3">
                  <p className="text-[11px] font-bold text-[#646970] uppercase tracking-wider">Hero Section Labels</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d2327]">Eyebrow Tagline</label>
                      <p className="text-[10px] text-[#646970] -mt-1">Small label above the main title</p>
                      <input
                        type="text"
                        value={currentContent.heroTagline || ""}
                        onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, heroTagline: e.target.value }); }}
                        placeholder="✦ Mindful Movement & Somatic Alignment"
                        className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d2327]">Hero CTA Button Label</label>
                      <p className="text-[10px] text-[#646970] -mt-1">Large button inside the hero banner</p>
                      <input
                        type="text"
                        value={currentContent.heroCtaLabel || ""}
                        onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, heroCtaLabel: e.target.value }); }}
                        placeholder="Book a Session"
                        className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d2327]">Nav Header Button Label</label>
                      <p className="text-[10px] text-[#646970] -mt-1">Pill button in the top-right navigation</p>
                      <input
                        type="text"
                        value={currentContent.navCtaLabel || ""}
                        onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, navCtaLabel: e.target.value }); }}
                        placeholder="Book Session"
                        className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                      />
                    </div>
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

                {/* ── About Section Text Labels ── */}
                <div className="pt-2 border-t border-[#f0f0f1] flex flex-col gap-3">
                  <p className="text-[11px] font-bold text-[#646970] uppercase tracking-wider">About Section Labels</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d2327]">Section Eyebrow Tagline</label>
                      <p className="text-[10px] text-[#646970] -mt-1">Small label above the heading e.g. 'The Instructor'</p>
                      <input
                        type="text"
                        value={currentContent.aboutTagline || ""}
                        onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, aboutTagline: e.target.value }); }}
                        placeholder="The Instructor"
                        className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d2327]">Greeting Heading</label>
                      <p className="text-[10px] text-[#646970] -mt-1">Large serif heading e.g. 'Hi, I am Elena'</p>
                      <input
                        type="text"
                        value={currentContent.aboutHeading || ""}
                        onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, aboutHeading: e.target.value }); }}
                        placeholder="Hi, I am Elena"
                        className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d2327]">Image Subtitle Overlay</label>
                      <p className="text-[10px] text-[#646970] -mt-1">Caption overlaid on the about image e.g. 'Elena • Founder of'</p>
                      <input
                        type="text"
                        value={currentContent.aboutImageSubtitle || ""}
                        onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, aboutImageSubtitle: e.target.value }); }}
                        placeholder="Elena • Founder of"
                        className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d2327]">CTA Link Text</label>
                      <p className="text-[10px] text-[#646970] -mt-1">Underlined link at bottom of bio e.g. 'Explore Offerings'</p>
                      <input
                        type="text"
                        value={currentContent.aboutCtaLabel || ""}
                        onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, aboutCtaLabel: e.target.value }); }}
                        placeholder="Explore Offerings"
                        className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                      />
                    </div>
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

              {/* ── Offerings Section Labels ── */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Offerings Section Labels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Section Eyebrow Tagline</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Small label above the heading e.g. 'Curated Programs'</p>
                    <input
                      type="text"
                      value={currentContent.offeringsTagline || ""}
                      onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, offeringsTagline: e.target.value }); }}
                      placeholder="Curated Programs"
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Section Heading</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Large section title e.g. 'Bespoke Offerings'</p>
                    <input
                      type="text"
                      value={currentContent.offeringsHeading || ""}
                      onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, offeringsHeading: e.target.value }); }}
                      placeholder="Bespoke Offerings"
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#1d2327]">Section Subtitle Paragraph</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Descriptive intro paragraph below the heading</p>
                    <textarea
                      rows={2}
                      value={currentContent.offeringsSubtitle || ""}
                      onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, offeringsSubtitle: e.target.value }); }}
                      placeholder="Quiet spaces and custom sequences..."
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338] resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Card CTA Link Text</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Underlined link on each class card e.g. 'Inquire Space'</p>
                    <input
                      type="text"
                      value={currentContent.offeringsCtaLabel || ""}
                      onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, offeringsCtaLabel: e.target.value }); }}
                      placeholder="Inquire Space"
                      className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]"
                    />
                  </div>
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

                      <div className="flex flex-col gap-1.5">
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

              {/* ── Portfolio Section Labels ── */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Gallery Section Labels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Section Eyebrow Tagline</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Small label e.g. 'Visual Sanctuary'</p>
                    <input type="text" value={currentContent.portfolioTagline || ""} onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, portfolioTagline: e.target.value }); }} placeholder="Visual Sanctuary" className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Section Heading</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Large section title e.g. 'Portfolio Gallery'</p>
                    <input type="text" value={currentContent.portfolioHeading || ""} onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, portfolioHeading: e.target.value }); }} placeholder="Portfolio Gallery" className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]" />
                  </div>
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

              {/* ── Testimonials Section Labels ── */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Testimonials Section Labels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Section Eyebrow Tagline</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Small label e.g. 'Resonance'</p>
                    <input type="text" value={currentContent.testimonialsTagline || ""} onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, testimonialsTagline: e.target.value }); }} placeholder="Resonance" className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Section Heading</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Large section title e.g. 'Client Testimonials'</p>
                    <input type="text" value={currentContent.testimonialsHeading || ""} onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, testimonialsHeading: e.target.value }); }} placeholder="Client Testimonials" className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]" />
                  </div>
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

              {/* ── Blog Section Labels ── */}
              <div className="bg-white border border-[#dcdcde] p-6 rounded shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3.5">Journal Section Labels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Section Eyebrow Tagline</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Small label e.g. 'Insights'</p>
                    <input type="text" value={currentContent.blogTagline || ""} onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, blogTagline: e.target.value }); }} placeholder="Insights" className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d2327]">Section Heading</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Large section title e.g. 'The Philosophy Journal'</p>
                    <input type="text" value={currentContent.blogHeading || ""} onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, blogHeading: e.target.value }); }} placeholder="The Philosophy Journal" className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338]" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#1d2327]">Section Subtitle Paragraph</label>
                    <p className="text-[10px] text-[#646970] -mt-1">Intro copy beneath the blog section heading</p>
                    <textarea rows={2} value={currentContent.blogSubtitle || ""} onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, blogSubtitle: e.target.value }); }} placeholder="Essays, research notes, and reflections..." className="px-3.5 py-2.5 bg-white border border-[#8c8f94] focus:border-[#2271b1] focus:outline-none rounded text-xs text-[#2c3338] resize-none" />
                  </div>
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
                      <div key={post.id} className="bg-white border border-[#dcdcde] rounded-3xl p-5 flex flex-col gap-3 shadow-xs">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-14 h-14 rounded-xl border border-[#8C7A6B]/20 overflow-hidden bg-[#8C7A6B]/10 shrink-0">
                              {(localPreview || post.featuredImage) ? (
                                  <img src={localPreview || post.featuredImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] opacity-40">Cover</div>
                                )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-serif font-semibold text-[#E5E0D8] truncate leading-tight">
                                {post.title} {post.isFeatured && <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono ml-1 font-bold">Featured</span>}
                              </h5>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[10px] text-[#8C7A6B] font-semibold">{post.date}</span>
                                <span className="text-[10px] text-[#E5E0D8]/40">•</span>
                                <span className="text-[10px] text-[#E5E0D8]/60 italic">{post.category || "Philosophy"}</span>
                                <span className="text-[10px] text-[#E5E0D8]/40">•</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase font-mono ${
                                  post.status === "draft" ? "bg-gray-500/10 text-gray-400 border border-gray-500/20" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                }`}>
                                  {post.status || "published"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditingPost(post)}
                              className="px-3 py-1 bg-[#8C7A6B]/10 hover:bg-[#8C7A6B]/20 text-[#E5E0D8] border border-[#8C7A6B]/20 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBlogPost(post.id)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {post.excerpt && (
                          <p className="text-[11px] text-[#E5E0D8]/60 line-clamp-2 border-t border-[#8C7A6B]/10 pt-2.5">
                            {post.excerpt}
                          </p>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.tags.map((t) => (
                              <span key={t} className="text-[9px] bg-[#8C7A6B]/5 text-[#E5E0D8]/50 border border-[#8C7A6B]/10 px-1.5 py-0.5 rounded-md font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CONTACT ME PANEL (Leads Inbox) */}
          {activeTab === "contactMe" && (
            <div className="flex flex-col gap-6 text-left">
              {/* Notification setting & CSV Export Card at the top */}
              <div className="bg-[#161210] border border-[#8C7A6B]/20 p-6 rounded-3xl flex flex-col gap-4 shadow-md">
                <h3 className="text-lg font-serif font-light text-[#E5E0D8] border-b border-[#8C7A6B]/20 pb-3">Inquiry Settings & Integration</h3>
                
                <div className="flex flex-col md:flex-row md:items-end gap-5">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Notification Email Address</label>
                    <input
                      type="email"
                      required
                      value={currentContent.contactEmail || ""}
                      onChange={(e) => {
                        if (!editForm) return;
                        setEditForm({ ...editForm, contactEmail: e.target.value });
                      }}
                      placeholder="elena@example.com"
                      className="px-5 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExportLeadsCSV}
                    className="h-10 px-5 bg-[#8C7A6B] hover:bg-[#6B5D51] text-[#0B0807] text-xs font-bold uppercase rounded-full transition-colors cursor-pointer shadow-md"
                  >
                    Export All Inquiries (CSV)
                  </button>
                </div>
              </div>

              {/* Leads inbox review */}
              <div className="bg-[#161210] border border-[#8C7A6B]/20 p-6 rounded-3xl flex flex-col gap-4 shadow-md">
                <h3 className="text-lg font-serif font-light text-[#E5E0D8] border-b border-[#8C7A6B]/20 pb-3">Visitor Inquiries Inbox</h3>
                
                {(!currentContent.leads || currentContent.leads.length === 0) ? (
                  <div className="p-8 text-center text-[#E5E0D8]/40 italic text-sm">
                    No inquiries received yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#8C7A6B]/20 bg-[#0B0807]">
                          <th className="p-3 font-semibold text-[#E5E0D8]/80 uppercase tracking-wider text-[10px] w-28">Name</th>
                          <th className="p-3 font-semibold text-[#E5E0D8]/80 uppercase tracking-wider text-[10px] w-36">Email</th>
                          <th className="p-3 font-semibold text-[#E5E0D8]/80 uppercase tracking-wider text-[10px] w-28">Location</th>
                          <th className="p-3 font-semibold text-[#E5E0D8]/80 uppercase tracking-wider text-[10px] w-32">Date / Time</th>
                          <th className="p-3 font-semibold text-[#E5E0D8]/80 uppercase tracking-wider text-[10px]">Inquiry Message</th>
                          <th className="p-3 font-semibold text-[#E5E0D8]/80 uppercase tracking-wider text-[10px] w-20 text-center">Status</th>
                          <th className="p-3 font-semibold text-[#E5E0D8]/80 uppercase tracking-wider text-[10px] w-40 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentContent.leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-[#8C7A6B]/10 hover:bg-[#8C7A6B]/5 text-[#E5E0D8] transition-colors">
                            <td className="p-3 font-semibold">{lead.name}</td>
                            <td className="p-3">
                              <a href={`mailto:${lead.email}`} className="text-[#8C7A6B] hover:underline font-mono">{lead.email}</a>
                            </td>
                            <td className="p-3 text-[#E5E0D8]/70 font-serif italic">{lead.location || "Not Provided"}</td>
                            <td className="p-3 text-[#E5E0D8]/60 font-mono">
                              {new Date(lead.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3 whitespace-pre-wrap leading-relaxed text-[#E5E0D8]/90">{lead.message}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                                lead.status === "New" 
                                  ? "bg-blue-950/40 text-blue-300 border-blue-500/20" 
                                  : "bg-gray-800/40 text-gray-400 border-gray-700/20"
                              }`}>
                                {lead.status || "New"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!editForm) return;
                                    const updated = editForm.leads?.map(l => l.id === lead.id ? { ...l, status: (l.status === "New" ? "Read" : "New") as "New" | "Read" } : l) || [];
                                    setEditForm({ ...editForm, leads: updated });
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-semibold border border-[#8C7A6B]/40 rounded-full bg-[#8C7A6B]/10 hover:bg-[#8C7A6B]/20 text-[#E5E0D8] cursor-pointer transition-colors"
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
                                  className="px-2.5 py-1 text-[10px] font-semibold border border-rose-500/40 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 cursor-pointer transition-colors"
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

          {/* TAB 8: BOOK A SESSION IN-CONTEXT VISUAL EDITOR */}
          {activeTab === "bookSession" && editForm && (
            <div className="flex flex-col gap-6 text-left">
              
              <div className="bg-[#161210] border border-[#8C7A6B]/20 rounded-3xl p-8 flex flex-col gap-8 shadow-md">
                <div>
                  <h3 className="text-lg font-serif font-light text-[#E5E0D8] border-b border-[#8C7A6B]/20 pb-3 mb-1">Book a Session In-Context Visual Editor</h3>
                  <p className="text-xs text-[#E5E0D8]/60">Every input field, layout structure, and design matches the live booking component exactly.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  
                  {/* Left Column - Simulated Portrait Image Box */}
                  <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Form Portrait Column Banner</span>
                    
                    <div className="relative overflow-hidden rounded-2xl w-full h-[400px] bg-[#8C7A6B]/10 border border-[#8C7A6B]/20 shadow-inner group">
                      {(contactPortraitPreview || editForm.contactPortraitUrl) ? (
                        <img
                          src={contactPortraitPreview || editForm.contactPortraitUrl}
                          alt="Book a session image preview"
                          className="w-full h-full object-cover object-center absolute inset-0"
                        />
                      ) : (
                        <img
                          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop"
                          alt="Book a session fallback"
                          className="w-full h-full object-cover object-center absolute inset-0 opacity-40"
                        />
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ background: "linear-gradient(to top, #0B0807E6 0%, transparent 60%)" }}>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#E5E0D8]/60">{currentContent.studioName || "Elena Yoga"}</span>
                        <span className="text-sm font-serif font-semibold mt-0.5 text-[#E5E0D8]">In-Context Portrait</span>
                      </div>
                    </div>

                    {/* Vercel Blob Image Manager Controls */}
                    <div className="flex flex-col gap-3 bg-[#0B0807] border border-[#8C7A6B]/20 p-4 rounded-xl">
                      <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Upload Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleContactPortraitFileChange}
                        className="text-xs text-[#E5E0D8] file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border file:border-[#8C7A6B]/40 file:bg-[#8C7A6B]/10 file:text-[#E5E0D8] file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-[#8C7A6B]/20"
                      />
                      {editForm.contactPortraitUrl && !contactPortraitFile && (
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, contactPortraitUrl: "" })}
                          className="text-[10px] text-rose-400 hover:underline text-left w-max font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                      <p className="text-[10px] text-[#E5E0D8]/40">Recommended: portrait aspect ratio (e.g. 600×800px). JPG or PNG.</p>
                    </div>
                  </div>

                  {/* Right Column - Simulated Contact Form Editable Fields */}
                  <div className="flex-1 flex flex-col gap-5 bg-[#0B0807] border border-[#8C7A6B]/20 p-6 md:p-8 rounded-2xl w-full">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Interactive Labels & Heading Configurator</span>
                    
                    {/* Headings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#8C7A6B]/20 pb-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Section Eyebrow Tagline</label>
                        <input
                          type="text"
                          value={editForm.contactTagline || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactTagline: e.target.value })}
                          placeholder="Begin Journey"
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Section Heading</label>
                        <input
                          type="text"
                          value={editForm.contactHeading || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactHeading: e.target.value })}
                          placeholder="Book a Session"
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Subtitle / Intro Paragraph</label>
                        <textarea
                          rows={2}
                          value={editForm.contactSubtitle || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactSubtitle: e.target.value })}
                          placeholder="Leave your details below..."
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide resize-none placeholder-[#E5E0D8]/30"
                        />
                      </div>
                    </div>

                    {/* Simulated Fields Configuration */}
                    <div className="flex flex-col gap-4 border-b border-[#8C7A6B]/20 pb-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/60">Name Input Label</label>
                        <input
                          type="text"
                          value={editForm.contactNameLabel || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactNameLabel: e.target.value })}
                          placeholder="Name"
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/60">Email Input Label</label>
                        <input
                          type="text"
                          value={editForm.contactEmailLabel || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactEmailLabel: e.target.value })}
                          placeholder="Email"
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/60">Location Input Label</label>
                        <input
                          type="text"
                          value={editForm.contactLocationLabel || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactLocationLabel: e.target.value })}
                          placeholder="Preferred Location"
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/60">Message Input Label</label>
                        <input
                          type="text"
                          value={editForm.contactMessageLabel || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactMessageLabel: e.target.value })}
                          placeholder="Message or Intentions"
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/60">Submit Button Label</label>
                        <input
                          type="text"
                          value={editForm.contactSubmitLabel || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactSubmitLabel: e.target.value })}
                          placeholder="Send Request"
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                        />
                      </div>
                    </div>

                    {/* Success states */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Success Confirmation Title</label>
                        <input
                          type="text"
                          value={editForm.contactSuccessTitle || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactSuccessTitle: e.target.value })}
                          placeholder="Request Transmitted"
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Success Confirmation Message</label>
                        <textarea
                          rows={2}
                          value={editForm.contactSuccessMessage || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactSuccessMessage: e.target.value })}
                          placeholder="Elena has received your request..."
                          className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide resize-none placeholder-[#E5E0D8]/30"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ───────────── CUSTOMIZATION TAB ───────────── */}
          {activeTab === "customization" && editForm && (
            <div className="flex flex-col gap-6 text-left">

              {/* Theme Color Scheme */}
              <div className="bg-[#161210] border border-[#8C7A6B]/20 p-6 rounded-3xl flex flex-col gap-6 shadow-md">
                <div>
                  <h3 className="text-lg font-serif font-light text-[#E5E0D8] border-b border-[#8C7A6B]/20 pb-3 mb-1">Theme Color Scheme</h3>
                  <p className="text-xs text-[#E5E0D8]/60">Set the design tokens for the public website. Changes apply immediately after saving.</p>
                </div>

                {/* Presets */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Quick Palette Presets</label>
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
                        className="flex items-center gap-2 px-3.5 py-1.5 border border-[#8C7A6B]/40 rounded-full bg-[#8C7A6B]/10 hover:bg-[#8C7A6B]/20 text-xs font-semibold text-[#E5E0D8] cursor-pointer transition-colors"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-[#E5E0D8]/20 shrink-0"
                          style={{ backgroundColor: preset.primary }}
                        />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Picker grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { field: "themePrimary", label: "Primary / Accent Color", desc: "Buttons, tags, links" },
                    { field: "themeBackground", label: "Page Background", desc: "Main body background" },
                    { field: "themeCard", label: "Card Background", desc: "Post cards, panels" },
                    { field: "themeText", label: "Primary Text Color", desc: "Headlines, body text" },
                    { field: "themeAccent", label: "Secondary Accent", desc: "Borders, subtle glows" },
                  ].map(({ field, label, desc }) => (
                    <div key={field} className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">{label}</label>
                      <p className="text-[10px] text-[#E5E0D8]/40 -mt-1">{desc}</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={(editForm as any)[field] || "#000000"}
                          onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                          className="w-10 h-10 rounded border border-[#8C7A6B]/40 cursor-pointer bg-[#0B0807] p-0.5"
                        />
                        <input
                          type="text"
                          value={(editForm as any)[field] || ""}
                          onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                          placeholder="#000000"
                          maxLength={7}
                          className="px-3.5 py-2 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 font-mono w-28"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Footer Tagline ── */}
              <div className="bg-[#161210] border border-[#8C7A6B]/20 p-6 rounded-3xl flex flex-col gap-4 shadow-md">
                <h3 className="text-lg font-serif font-light text-[#E5E0D8] border-b border-[#8C7A6B]/20 pb-3 mb-1">Footer Tagline</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Footer Tagline Text</label>
                  <p className="text-[10px] text-[#E5E0D8]/40 -mt-1">Short motto displayed in the website footer e.g. 'Peace • Alignment • Somatic Wisdom'</p>
                  <input type="text" value={editForm.footerTagline || ""} onChange={(e) => { if (!editForm) return; setEditForm({ ...editForm, footerTagline: e.target.value }); }} placeholder="Peace • Alignment • Somatic Wisdom" className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 max-w-lg" />
                </div>
              </div>

              {/* Social Media Footer */}
              <div className="bg-[#161210] border border-[#8C7A6B]/20 p-6 rounded-3xl flex flex-col gap-5 shadow-md">
                <div>
                  <h3 className="text-lg font-serif font-light text-[#E5E0D8] border-b border-[#8C7A6B]/20 pb-3 mb-1">Social Media Footer Icons</h3>
                  <p className="text-xs text-[#E5E0D8]/60">When enabled, social media icons will appear in the public website footer. Leave blank to hide.</p>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-4">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Show Social Icons in Footer</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, socialEnabled: true })}
                      className={`px-4 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                        editForm.socialEnabled
                          ? "bg-[#8C7A6B] text-[#0B0807] border-[#8C7A6B]"
                          : "bg-transparent text-[#E5E0D8]/60 border-[#8C7A6B]/40 hover:bg-[#8C7A6B]/10"
                      }`}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, socialEnabled: false })}
                      className={`px-4 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                        !editForm.socialEnabled
                          ? "bg-[#8C7A6B] text-[#0B0807] border-[#8C7A6B]"
                          : "bg-transparent text-[#E5E0D8]/60 border-[#8C7A6B]/40 hover:bg-[#8C7A6B]/10"
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80 flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#E5E0D8]/60">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={editForm.socialInstagram || ""}
                    onChange={(e) => setEditForm({ ...editForm, socialInstagram: e.target.value })}
                    placeholder="@elenayoga"
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80 flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#E5E0D8]/60">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook Handle
                  </label>
                  <input
                    type="text"
                    value={editForm.socialFacebook || ""}
                    onChange={(e) => setEditForm({ ...editForm, socialFacebook: e.target.value })}
                    placeholder="ElenaMindfulYoga"
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80 flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#E5E0D8]/60">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    YouTube Channel
                  </label>
                  <input
                    type="text"
                    value={editForm.socialYoutube || ""}
                    onChange={(e) => setEditForm({ ...editForm, socialYoutube: e.target.value })}
                    placeholder="@ElenaMindfulYoga"
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

          {/* SIMPLIFIED Save Action Bar */}
          <div className="border-t border-[#8C7A6B]/20 pt-6 flex flex-col gap-4 text-left">
            <button
              type="submit"
              disabled={isSaving}
              className="w-40 py-2.5 bg-[#8C7A6B] hover:bg-[#6B5D51] text-[#0B0807] text-xs font-bold uppercase rounded-full shadow-md cursor-pointer disabled:opacity-40 transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

        </form>

      {/* Article Edit Modal Popup */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0807]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161210] border border-[#8C7A6B]/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-6 shadow-2xl animate-scale-up text-left">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#8C7A6B]/20 pb-4">
              <h3 className="text-xl font-serif font-light text-[#E5E0D8]">Edit Article Details</h3>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-[#E5E0D8]/60 hover:text-[#E5E0D8] text-sm uppercase tracking-wider font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Article Title</label>
                  <input
                    type="text"
                    required
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    placeholder="Enter article title..."
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 w-full"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Category</label>
                  <input
                    type="text"
                    required
                    value={editPostCategory}
                    onChange={(e) => setEditPostCategory(e.target.value)}
                    placeholder="e.g. Philosophy, Somatic, Alignment"
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 w-full"
                  />
                </div>

                {/* Status Toggle / Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Article Status</label>
                  <select
                    value={editPostStatus}
                    onChange={(e) => setEditPostStatus(e.target.value as any)}
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide"
                  >
                    <option value="published" className="bg-[#161210]">Published</option>
                    <option value="draft" className="bg-[#161210]">Draft</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editPostTags}
                    onChange={(e) => setEditPostTags(e.target.value)}
                    placeholder="e.g. yoga, posture, breath"
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 w-full"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="flex flex-col gap-1.5 justify-center">
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="editPostIsFeatured"
                      checked={editPostIsFeatured}
                      onChange={(e) => setEditPostIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-[#8C7A6B] border-[#8C7A6B]/40 rounded focus:ring-[#8C7A6B] cursor-pointer bg-[#8C7A6B]/10"
                    />
                    <label htmlFor="editPostIsFeatured" className="text-xs font-semibold text-[#E5E0D8]/80 cursor-pointer select-none">
                      Pin Article to Featured Section
                    </label>
                  </div>
                </div>

                {/* Cover Photo Uploader & Live Preview */}
                <div className="flex flex-col gap-1.5 md:col-span-2 border-t border-[#8C7A6B]/10 pt-4 mt-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Cover Photo</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-1">
                    <div className="w-24 h-24 rounded-2xl border border-[#8C7A6B]/20 overflow-hidden bg-[#8C7A6B]/10 shrink-0">
                      {editPostPreview ? (
                        <img src={editPostPreview} alt="Cover preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#E5E0D8]/40">No Cover</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditPostFileChange}
                        className="text-xs text-[#E5E0D8]/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-[#8C7A6B]/30 file:text-[10px] file:font-semibold file:bg-[#8C7A6B]/10 file:text-[#E5E0D8] hover:file:bg-[#8C7A6B]/20 file:cursor-pointer"
                      />
                      <p className="text-[9px] text-[#E5E0D8]/40">Recommended size: 1200x800px. Maximum upload limit is 4.5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="flex flex-col gap-1.5 md:col-span-2 border-t border-[#8C7A6B]/10 pt-4 mt-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Short Excerpt / Summary</label>
                  <input
                    type="text"
                    value={editPostExcerpt}
                    onChange={(e) => setEditPostExcerpt(e.target.value)}
                    placeholder="Short description displayed on article cards..."
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 w-full"
                  />
                </div>

                {/* Main Content Body */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Article Content (Main Body)</label>
                  <textarea
                    rows={8}
                    required
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    placeholder="Write your article body here..."
                    className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 w-full resize-none font-sans"
                  />
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 border-t border-[#8C7A6B]/20 pt-5 mt-2">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="px-5 py-2.5 rounded-full border border-[#8C7A6B]/40 text-[#E5E0D8] hover:bg-[#8C7A6B]/10 text-xs font-bold uppercase transition-colors cursor-pointer animate-fade-in"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving || !editPostTitle || !editPostContent}
                onClick={handleSavePostEdit}
                className="px-6 py-2.5 bg-[#8C7A6B] hover:bg-[#6B5D51] text-[#0B0807] text-xs font-bold uppercase rounded-full shadow-md cursor-pointer disabled:opacity-40 transition-colors"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  </div>
);
}
