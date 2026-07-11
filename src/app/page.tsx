"use client";

import React, { useState, useEffect } from "react";
import { YogaContent, OfferingItem, PortfolioItem, TestimonialItem, BlogPostItem } from "@/types";

export default function Home() {
  const [content, setContent] = useState<YogaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Admin panel open state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"general" | "offerings" | "portfolio" | "testimonials" | "blog">("general");
  const [editForm, setEditForm] = useState<YogaContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; msg: string }>({
    type: null,
    msg: "",
  });

  // Client Blog Post reader modal state
  const [activePost, setActivePost] = useState<BlogPostItem | null>(null);

  // Client like states (local overrides)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});

  // Admin file upload states
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [aboutFile, setAboutFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string>("");
  const [aboutPreview, setAboutPreview] = useState<string>("");

  // Dynamic list files states
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

  // Portfolio client filter state
  const [activePortfolioFilter, setActivePortfolioFilter] = useState("All");

  // Client Inquiry State
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" });

  // Resolve dynamic session auth state client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(sessionStorage.getItem("admin_logged_in") === "true");
    }
  }, []);

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

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setInquirySubmitted(true);
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", notes: "" });
    setInquirySubmitted(false);
  };

  // Secure Auth Submission
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
        setIsLoginOpen(false);
        setIsAdminOpen(true);
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

  // Admin banner change handlers
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

    setEditForm({
      ...editForm,
      portfolio: [...editForm.portfolio, newItem],
    });

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
    if (portfolioFiles[id]) {
      const updatedFiles = { ...portfolioFiles };
      delete updatedFiles[id];
      setPortfolioFiles(updatedFiles);
    }
  };

  // Testimonials CRUD functions
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

    setEditForm({
      ...editForm,
      testimonials: [...editForm.testimonials, newTest],
    });

    setNewTestName("");
    setNewTestQuote("");
    setNewTestRating(5);
    setNewTestSource("");
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      testimonials: editForm.testimonials.filter((t) => t.id !== id),
    });
  };

  // Blog CRUD functions
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

    // Update local post likes mapping
    setPostLikes((prev) => ({ ...prev, [newId]: 0 }));

    if (newBlogFile) {
      setBlogFiles((prev) => ({ ...prev, [newId]: newBlogFile }));
      setBlogPreviews((prev) => ({ ...prev, [newId]: newBlogPreview }));
    }

    setEditForm({
      ...editForm,
      blogPosts: [...editForm.blogPosts, newPost],
    });

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
    setEditForm({
      ...editForm,
      blogPosts: editForm.blogPosts.filter((b) => b.id !== id),
    });
    if (blogFiles[id]) {
      const updatedFiles = { ...blogFiles };
      delete updatedFiles[id];
      setBlogFiles(updatedFiles);
    }
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
      setEditForm(updatedContent);

      // Async sync database JSON
      const dataPayload = new FormData();
      dataPayload.append("content", JSON.stringify(updatedContent));
      fetch("/api/content", {
        method: "POST",
        body: dataPayload,
      }).catch((err) => console.warn("Failed to sync like count to database:", err));
    }
  };

  // Submit all FormData edits to backend serverless function
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

      // Append dynamic blog files
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
          msg: "Changes committed successfully! Main JSON file and uploaded images synced in Vercel Blob.",
        });

        // Revoke temporary previews
        if (heroPreview) URL.revokeObjectURL(heroPreview);
        if (aboutPreview) URL.revokeObjectURL(aboutPreview);
        Object.values(offeringPreviews).forEach(URL.revokeObjectURL);
        Object.values(portfolioPreviews).forEach(URL.revokeObjectURL);
        Object.values(blogPreviews).forEach(URL.revokeObjectURL);

        // Reset file inputs
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-brand-bg">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <span className="font-serif text-3xl tracking-[0.2em] text-[#F3EFEA] font-light">✦ ELENA</span>
          <div className="w-16 h-0.5 bg-brand-sage/40" />
          <span className="text-[10px] tracking-widest uppercase text-brand-sage">Entering Sanctuary...</span>
        </div>
      </div>
    );
  }

  const currentContent = content || editForm;
  if (!currentContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-brand-bg p-8 text-center">
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

  return (
    <div className="flex-1 flex flex-col font-sans bg-transparent">
      {/* 1. Navigation Bar (Secured: Content Editor toggle removed) */}
      <header className="w-full border-b border-brand-sage-light/20 py-7 px-8 md:px-16 bg-brand-bg/80 backdrop-blur-md sticky top-0 z-30">
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
          <div className="absolute inset-0 bg-brand-bg/85 -z-10" />
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

              <div className="absolute bottom-6 inset-x-6 text-center z-10 bg-brand-bg/60 backdrop-blur-xs py-2 rounded-full border border-brand-sage-light/20">
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
                <div className="absolute top-4 right-4 bg-brand-bg border border-brand-sage-light/30 px-4 py-2 rounded-full text-xs font-bold text-brand-sage shadow-sm font-mono tracking-wider">
                  ${offering.price} / hr
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
          {currentContent.blogPosts.length === 0 ? (
            <div className="py-20 text-center text-[#8E847C] italic text-sm">
              No journal articles published yet.
            </div>
          ) : (
            currentContent.blogPosts.map((post) => {
              const activeLikes = postLikes[post.id] !== undefined ? postLikes[post.id] : (post.likes || 0);
              const hasLiked = !!likedPosts[post.id];

              return (
                /* Full-width Stacked Row card */
                <div
                  key={post.id}
                  className="bg-[#161210] border border-[#26201C] p-8 md:p-10 rounded-3xl flex flex-col lg:flex-row gap-8 lg:gap-12 transition-all duration-350 hover:border-brand-sage/40 group shadow-sm items-stretch relative"
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
                      {/* Metadata row (Taupe Color #8E847C) */}
                      <div className="flex items-center gap-2.5 text-[9px] uppercase tracking-[0.25em] text-[#8E847C] font-semibold font-mono">
                        <span>{post.category || "Philosophy"}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime || "5 min read"}</span>
                      </div>

                      {/* Post Title (Striking Serif Off-White #F3EFEA) */}
                      <h3 className="text-2xl md:text-3xl font-serif text-[#F3EFEA] tracking-wide leading-snug group-hover:text-brand-sage transition-colors font-normal">
                        {post.title}
                      </h3>

                      <p className="text-xs md:text-sm text-brand-text/70 leading-relaxed font-normal tracking-wide">
                        {post.excerpt}
                      </p>
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

      {/* 8. Minimal Contact Form Section */}
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
          <form onSubmit={handleInquirySubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/60">Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="px-5 py-3.5 bg-brand-sage-light/20 border border-brand-sage-light/35 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text tracking-wide"
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
                className="px-5 py-3.5 bg-brand-sage-light/20 border border-brand-sage-light/35 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text tracking-wide"
                placeholder="yourname@domain.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/60">Message or Intentions</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="px-5 py-3.5 bg-brand-sage-light/20 border border-brand-sage-light/35 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text resize-none tracking-wide"
                placeholder="Any posture goals or injuries..."
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-4 bg-brand-sage hover:bg-brand-sage-hover text-[#111112] text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-xl cursor-pointer"
            >
              Send Request
            </button>
          </form>
        ) : (
          <div className="text-center py-8 flex flex-col items-center gap-5 border border-brand-sage-light/35 rounded-3xl bg-brand-sage-light/20 p-8">
            <div className="w-12 h-12 rounded-full border border-brand-sage flex items-center justify-center text-brand-sage text-sm font-bold">
              ✓
            </div>
            <h4 className="text-lg font-serif text-brand-text tracking-wide">Request Transmitted</h4>
            <p className="text-xs text-brand-text/65 max-w-sm leading-relaxed tracking-wide">
              Thank you, **{formData.name}**. Elena has received your request and will reach out to **{formData.email}** soon.
            </p>
            <button
              onClick={resetForm}
              className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-sage hover:underline cursor-pointer"
            >
              Reset Form
            </button>
          </div>
        )}
      </section>

      {/* Discreet Editorial Footer Entrance */}
      <footer className="border-t border-brand-sage-light/20 py-12 mt-auto text-center text-[10px] text-brand-text/45 uppercase tracking-[0.25em] bg-transparent">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <span>© {new Date().getFullYear()} Elena Yoga. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Peace • Alignment • Somatic Wisdom</span>
            <span>|</span>
            <button
              onClick={isLoggedIn ? () => setIsAdminOpen(true) : () => setIsLoginOpen(true)}
              className="text-brand-sage hover:text-brand-sage-hover transition-colors font-bold uppercase tracking-widest cursor-pointer text-[10px]"
            >
              {isLoggedIn ? "Admin Panel" : "Admin Login"}
            </button>
          </div>
        </div>
      </footer>

      {/* 9. Secure Login Overlay Modal (NEW) */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAuthSubmit}
            className="bg-[#111112] border border-brand-sage-light/30 rounded-3xl max-w-md w-full p-8 flex flex-col gap-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => {
                setIsLoginOpen(false);
                setAuthError("");
              }}
              className="absolute top-4 right-4 text-brand-text/50 hover:text-brand-text transition-colors text-lg"
            >
              ✕
            </button>

            <div className="text-center">
              <span className="text-[9px] uppercase tracking-[0.3em] text-brand-sage font-bold">Secure Access</span>
              <h4 className="text-2xl font-serif text-brand-text mt-1 tracking-wide">Staff Authorization</h4>
              <p className="text-xs text-brand-text/60 mt-1 leading-normal">
                Enter your administrative credentials to unlock the database dashboard interfaces.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-[0.25em] font-semibold text-brand-text/75">Admin Username</label>
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Username"
                  className="px-4 py-3 bg-brand-sage-light/25 border border-brand-sage-light/30 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-[0.25em] font-semibold text-brand-text/75">Admin Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Password"
                  className="px-4 py-3 bg-brand-sage-light/25 border border-brand-sage-light/30 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl leading-normal text-left font-normal animate-shake">
                <span className="font-bold block mb-0.5">Authorization Error</span>
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-4 bg-brand-sage hover:bg-brand-sage-hover text-[#111112] text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-xl cursor-pointer"
            >
              Verify Credentials
            </button>
          </form>
        </div>
      )}

      {/* 10. Collapsible Admin Panel Modal */}
      {isAdminOpen && isLoggedIn && editForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111112] border border-brand-sage-light/30 rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-brand-sage-light/20 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-brand-sage font-bold">Sanctuary Database</span>
                <h4 className="text-xl font-serif text-brand-text mt-0.5 tracking-wider">Control Center Console</h4>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem("admin_logged_in");
                    setIsLoggedIn(false);
                    setIsAdminOpen(false);
                  }}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-600 uppercase cursor-pointer border border-rose-500/25 px-3.5 py-1 rounded-full transition-colors"
                >
                  Log Out
                </button>
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
            </div>

            {/* Inner Dashboard Navigation tabs */}
            <div className="flex overflow-x-auto border-b border-brand-sage-light/10 bg-brand-sage-light/20 shrink-0 px-6 gap-2 scrollbar-none">
              {[
                { id: "general", label: "Copy & Banners" },
                { id: "offerings", label: "Yoga Classes" },
                { id: "portfolio", label: "Portfolio" },
                { id: "testimonials", label: "Testimonials" },
                { id: "blog", label: "Blog Editor" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-[0.15em] border-b-2 transition-all cursor-pointer shrink-0 ${
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
              
              {/* Tab 1: General Copy */}
              {adminTab === "general" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/70">Hero Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.heroTitle}
                      onChange={(e) => handleAdminChange(e, "heroTitle")}
                      className="px-4 py-3 bg-brand-sage-light/25 border border-brand-sage-light/30 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/70">Hero Subtitle</label>
                    <textarea
                      required
                      rows={3}
                      value={editForm.heroSubtitle}
                      onChange={(e) => handleAdminChange(e, "heroSubtitle")}
                      className="px-4 py-3 bg-brand-sage-light/25 border border-brand-sage-light/30 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/70">About Bio Text</label>
                    <textarea
                      required
                      rows={6}
                      value={editForm.aboutBioText}
                      onChange={(e) => handleAdminChange(e, "aboutBioText")}
                      className="px-4 py-3 bg-brand-sage-light/25 border border-brand-sage-light/30 focus:border-brand-sage focus:outline-none rounded-xl text-xs md:text-sm text-brand-text resize-none"
                    />
                  </div>

                  <div className="border-t border-brand-sage-light/20 pt-5 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-sage">Homepage Banners</span>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/70">Hero Background</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroFileChange}
                          className="text-xs text-brand-text/65 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-sage file:text-[#111112] hover:file:bg-brand-sage-hover"
                        />
                        {(heroPreview || currentContent.heroImageUrl) && (
                          <div className="w-12 h-12 rounded-lg border border-brand-sage-light/30 overflow-hidden shrink-0">
                            <img src={heroPreview || currentContent.heroImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-text/70">About Profile Picture</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAboutFileChange}
                          className="text-xs text-brand-text/65 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-sage file:text-[#111112] hover:file:bg-brand-sage-hover"
                        />
                        {(aboutPreview || currentContent.aboutImageUrl) && (
                          <div className="w-12 h-12 rounded-lg border border-brand-sage-light/30 overflow-hidden shrink-0">
                            <img src={aboutPreview || currentContent.aboutImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Yoga Classes / Offerings CRUD */}
              {adminTab === "offerings" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-sage">Offerings List ({editForm.offerings.length})</span>
                    <button
                      type="button"
                      onClick={handleAddOffering}
                      className="px-4 py-2 bg-brand-sage text-[#111112] text-[10px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-brand-sage-hover cursor-pointer"
                    >
                      + Add New Class
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {editForm.offerings.map((offering, index) => {
                      const hasLocalPreview = offeringPreviews[offering.id];
                      return (
                        <div key={offering.id} className="border border-brand-sage-light/25 rounded-2xl p-6 bg-brand-sage-light/20 flex flex-col gap-4 relative">
                          <button
                            type="button"
                            onClick={() => handleDeleteOffering(offering.id)}
                            className="absolute top-4 right-4 text-xs font-bold text-rose-500 hover:text-rose-700 uppercase cursor-pointer"
                          >
                            ✕ Remove
                          </button>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 flex flex-col gap-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Class Title</span>
                              <input
                                type="text"
                                required
                                value={offering.title}
                                onChange={(e) => handleOfferingChange(index, "title", e.target.value)}
                                className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Hourly Rate ($)</span>
                              <input
                                type="number"
                                required
                                value={offering.price}
                                onChange={(e) => handleOfferingChange(index, "price", parseInt(e.target.value) || 0)}
                                className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Description</span>
                            <textarea
                              required
                              rows={2}
                              value={offering.description}
                              onChange={(e) => handleOfferingChange(index, "description", e.target.value)}
                              className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text resize-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5 pt-2">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Class Card Photo</span>
                            <div className="flex items-center gap-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleOfferingFileChange(index, e.target.files?.[0] || null)}
                                className="text-[10px] text-brand-text/60 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-brand-sage file:text-[#111112]"
                              />
                              {(hasLocalPreview || offering.image) && (
                                <div className="w-10 h-10 rounded-lg border border-brand-sage-light/30 overflow-hidden shrink-0">
                                  <img src={hasLocalPreview || offering.image} alt="Preview" className="w-full h-full object-cover" />
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

              {/* Tab 3: Portfolio CRUD */}
              {adminTab === "portfolio" && (
                <div className="flex flex-col gap-6">
                  <div className="border border-brand-sage-light/25 rounded-2xl p-6 bg-brand-sage-light/25 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-sage">Add Photo to Gallery</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Photo Title</label>
                        <input
                          type="text"
                          value={newPortTitle}
                          onChange={(e) => setNewPortTitle(e.target.value)}
                          placeholder="e.g. Studio Sunrise"
                          className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Tag Category</label>
                        <select
                          value={newPortCategory}
                          onChange={(e) => setNewPortCategory(e.target.value)}
                          className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                        >
                          <option value="Studio">Studio</option>
                          <option value="Classes">Classes</option>
                          <option value="Workshops">Workshops</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Select Image File</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewPortFileChange}
                          className="text-[10px] text-brand-text/60 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-brand-sage file:text-[#111112]"
                        />
                        {newPortPreview && (
                          <div className="w-10 h-10 rounded-lg border border-brand-sage-light/30 overflow-hidden shrink-0">
                            <img src={newPortPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!newPortTitle || !newPortFile}
                      onClick={handleAddPortfolioItem}
                      className="mt-2 py-3 bg-brand-sage hover:bg-brand-sage-hover text-[#111112] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl cursor-pointer disabled:opacity-40"
                    >
                      Queue Photo Addition
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-sage">Existing Photos</span>
                    <div className="grid grid-cols-2 gap-4">
                      {editForm.portfolio.map((item) => {
                        const localPreview = portfolioPreviews[item.id];
                        return (
                          <div key={item.id} className="border border-brand-sage-light/20 rounded-xl p-4 bg-[#111112] flex items-center justify-between gap-4 shadow-sm animate-fade-in">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg border border-brand-sage-light/35 overflow-hidden shrink-0 bg-brand-sage-light/15">
                                {(localPreview || item.image) ? (
                                  <img src={localPreview || item.image} alt="Thumb" className="w-full h-full object-cover" />
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

              {/* Tab 4: Testimonials CRUD */}
              {adminTab === "testimonials" && (
                <div className="flex flex-col gap-6">
                  <div className="border border-brand-sage-light/25 rounded-2xl p-6 bg-brand-sage-light/25 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-sage">Add Client Review</span>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Client Name</label>
                        <input
                          type="text"
                          value={newTestName}
                          onChange={(e) => setNewTestName(e.target.value)}
                          placeholder="e.g. Jane Foster"
                          className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Rating (Stars)</label>
                        <select
                          value={newTestRating}
                          onChange={(e) => setNewTestRating(parseInt(e.target.value) || 5)}
                          className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Client Quote</label>
                      <textarea
                        value={newTestQuote}
                        onChange={(e) => setNewTestQuote(e.target.value)}
                        placeholder="Type review quote..."
                        rows={3}
                        className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Inquiry Context / Source</label>
                      <input
                        type="text"
                        value={newTestSource}
                        onChange={(e) => setNewTestSource(e.target.value)}
                        placeholder="e.g. Private Alignment Client"
                        className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!newTestName || !newTestQuote}
                      onClick={handleAddTestimonial}
                      className="mt-2 py-3 bg-brand-sage hover:bg-brand-sage-hover text-[#111112] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl cursor-pointer disabled:opacity-40"
                    >
                      Queue Review Addition
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-sage">Existing Testimonials</span>
                    <div className="flex flex-col gap-3">
                      {editForm.testimonials.map((test) => (
                        <div key={test.id} className="border border-brand-sage-light/20 rounded-xl p-4 bg-[#111112] flex justify-between items-start gap-4">
                          <div className="flex-1 text-xs">
                            <span className="font-semibold block text-brand-text">{test.clientName} ({test.rating}★)</span>
                            <span className="text-[9px] text-brand-sage block font-bold mt-0.5">{test.source}</span>
                            <p className="text-[11px] text-brand-text/70 italic mt-1.5 leading-relaxed">&ldquo;{test.quote}&rdquo;</p>
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

              {/* Tab 5: Blog Posts CRUD */}
              {adminTab === "blog" && (
                <div className="flex flex-col gap-6">
                  <div className="border border-brand-sage-light/25 rounded-2xl p-6 bg-brand-sage-light/25 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-sage">Publish Blog Post</span>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Article Title</label>
                      <input
                        type="text"
                        value={newBlogTitle}
                        onChange={(e) => setNewBlogTitle(e.target.value)}
                        placeholder="e.g. Diaphragm Control & Nervous Systems"
                        className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Category Tag</label>
                        <input
                          type="text"
                          value={newBlogCategory}
                          onChange={(e) => setNewBlogCategory(e.target.value)}
                          placeholder="e.g. Philosophy"
                          className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Read Time</label>
                        <input
                          type="text"
                          value={newBlogReadTime}
                          onChange={(e) => setNewBlogReadTime(e.target.value)}
                          placeholder="e.g. 5 min read"
                          className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Excerpt Summary</label>
                      <input
                        type="text"
                        value={newBlogExcerpt}
                        onChange={(e) => setNewBlogExcerpt(e.target.value)}
                        placeholder="Brief summary..."
                        className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Full Body Content</label>
                      <textarea
                        value={newBlogContent}
                        onChange={(e) => setNewBlogContent(e.target.value)}
                        placeholder="Write article details here..."
                        rows={6}
                        className="px-3 py-2 bg-[#111112] border border-brand-sage-light/20 rounded-lg text-xs text-brand-text resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-brand-text/50">Featured Cover Image</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewBlogFileChange}
                          className="text-[10px] text-brand-text/60 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-brand-sage file:text-[#111112]"
                        />
                        {newBlogPreview && (
                          <div className="w-10 h-10 rounded-lg border border-brand-sage-light/30 overflow-hidden shrink-0">
                            <img src={newBlogPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!newBlogTitle || !newBlogContent}
                      onClick={handleAddBlogPost}
                      className="mt-2 py-3 bg-brand-sage hover:bg-brand-sage-hover text-[#111112] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl cursor-pointer disabled:opacity-40"
                    >
                      Queue Article Publication
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-sage">Published Articles</span>
                    <div className="grid grid-cols-2 gap-4">
                      {editForm.blogPosts.map((post) => {
                        const localPreview = blogPreviews[post.id];
                        return (
                          <div key={post.id} className="border border-brand-sage-light/20 rounded-xl p-3 bg-[#111112] flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg border border-brand-sage-light/35 overflow-hidden shrink-0 bg-brand-sage-light/15">
                                {(localPreview || post.featuredImage) ? (
                                  <img src={localPreview || post.featuredImage} alt="Thumb" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] opacity-40">Cover</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-semibold text-brand-text truncate leading-tight">{post.title}</h5>
                                <span className="text-[8px] text-brand-sage block mt-0.5 font-mono">{post.date}</span>
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

              {/* Status and Action controls */}
              <div className="border-t border-brand-sage-light/20 pt-5 shrink-0">
                {saveStatus.type && (
                  <div
                    className={`p-4 rounded-xl text-xs leading-normal mb-4 ${
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
                  className="w-full py-4 bg-brand-sage hover:bg-brand-sage-hover text-[#111112] text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-xl cursor-pointer disabled:opacity-40 shadow-sm"
                >
                  {isSaving ? "Saving & Uploading Assets to Vercel Blob..." : "Commit All Changes & Sync Vercel Blob"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Client Blog Post Reader Modal */}
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
