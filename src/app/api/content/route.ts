import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { YogaContent } from "@/types";
import fs from "fs";
import path from "path";

const isLocal = process.env.NODE_ENV === "development" || !process.env.VERCEL;
const LOCAL_DATA_DIR = path.join(process.cwd(), "public/data");
const LOCAL_JSON_PATH = path.join(LOCAL_DATA_DIR, "homepage.json");
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const DEFAULT_CONTENT: YogaContent = {
  heroTitle: "Returning to the wisdom of the body.",
  heroSubtitle:
    "Bespoke somatic practices, restorative alignments, and private mentorship programs designed to cultivate presence, stability, and cellular renewal.",
  aboutBioText:
    "My teaching path is rooted in somatic anatomy, sensory introspection, and traditional Hatha and Yin lineages. I believe that alignment is not a rigid physical ideal, but an intuitive conversation with your own skeleton, tissues, and breathing pathways.\n\nHaving spent over a decade guiding students through deep restorative processes, my goal is to hold a safe space where you can release chronic physical tension and slow down to the frequency of natural expansion.\n\nWhether you are stepping onto the mat to recover from injury, calm your nervous system, or refine your advanced structural alignment, we will cultivate a tailored path suited to your exact somatic geometry.",
  services: [],
  heroImageUrl: "",
  aboutImageUrl: "",
  authorName: "Elena",
  authorBio:
    "Somatic educator, skeleto-tissue alignment specialist, and restorative Yin facilitator with 10+ years holding alignment sanctuaries.",
  contactEmail: "elena@example.com",
  leads: [],
  studioName: "Elena Yoga",
  hideHero: false,
  hideAbout: false,
  hideOfferings: false,
  hidePortfolio: false,
  hideTestimonials: false,
  hideBlog: false,

  // Default theme tokens
  themePrimary: "#8C7A6B",
  themeBackground: "#0B0807",
  themeCard: "#161210",
  themeText: "#E5E0D8",
  themeAccent: "#6B5D51",

  // Ambient audio defaults
  audioEnabled: false,
  audioPreset: "tibetan-bowl",

  // Contact portrait
  contactPortraitUrl: "",

  // Social media
  socialEnabled: false,
  socialInstagram: "",
  socialFacebook: "",
  socialYoutube: "",

  // ─── Section text labels & copy ───────────────────────────────────────
  navCtaLabel: "Book Session",
  heroTagline: "✦ Mindful Movement & Somatic Alignment",
  heroCtaLabel: "Book a Session",
  aboutTagline: "The Instructor",
  aboutHeading: "Hi, I am Elena",
  aboutImageSubtitle: "Elena • Founder of",
  aboutCtaLabel: "Explore Offerings",
  offeringsTagline: "Curated Programs",
  offeringsHeading: "Bespoke Offerings",
  offeringsSubtitle: "Quiet spaces and custom sequences created to align physical posture, mental pacing, and sensory stillness.",
  offeringsCtaLabel: "Inquire Space",
  portfolioTagline: "Visual Sanctuary",
  portfolioHeading: "Portfolio Gallery",
  testimonialsTagline: "Resonance",
  testimonialsHeading: "Client Testimonials",
  blogTagline: "Insights",
  blogHeading: "The Philosophy Journal",
  blogSubtitle: "Essays, research notes, and reflections on somatic anatomy and mindful living.",
  contactTagline: "Begin Journey",
  contactHeading: "Book a Session",
  contactSubtitle: "Leave your details below, and Elena will get back to coordinate your custom session within 24 hours.",
  contactNameLabel: "Name",
  contactEmailLabel: "Email",
  contactLocationLabel: "Preferred Location",
  contactMessageLabel: "Message or Intentions",
  contactSubmitLabel: "Send Request",
  contactSuccessTitle: "Request Transmitted",
  contactSuccessMessage: "Elena has received your request and will reach out soon.",
  footerTagline: "Peace • Alignment • Somatic Wisdom",

  offerings: [
    {
      id: "private",
      title: "Private 1-on-1 Sessions",
      price: 120,
      description:
        "Bespoke posture assessment, custom somatic adjustives, and individualized breath guidance. These private sessions are customized dynamically around your body's structural history, athletic goals, and specific nervous system needs.",
      image: "",
    },
    {
      id: "group",
      title: "Group Classes",
      price: 35,
      description:
        "Shared vinyasa patterns, slow-flowing transitions, and community yin gatherings. Practice inside an airy, light-filled environment alongside a supportive, collective community seeking physical strength, structural ease, and daily grounding.",
      image: "",
    },
  ],
  portfolio: [
    { id: "port-1", title: "Morning Sun Asana", image: "", category: "Classes" },
    { id: "port-2", title: "Alabaster Studio Space", image: "", category: "Studio" },
    { id: "port-3", title: "Somatic Breathwork Circle", image: "", category: "Workshops" },
  ],
  testimonials: [
    {
      id: "test-1",
      clientName: "Claire Miller",
      quote: "Elena has a unique ability to read alignment issues. My chronic lower back compression resolved completely in four private sessions.",
      rating: 5,
      source: "Private Alignment Client",
    },
    {
      id: "test-2",
      clientName: "Marcus Vance",
      quote: "The group Yin and Sound bath classes on Sunday have become my non-negotiable mental reset. Peace is immediate.",
      rating: 5,
      source: "Weekly Group Flow Attendee",
    },
  ],
  blogPosts: [
    {
      id: "blog-1",
      title: "The Fascial System & Involuntary Tension",
      excerpt: "An exploration of how long static holds communicate safety directly to the amygdala, releasing emotional holding states.",
      content:
        "In the modern tempo, our bodies are continuously registering micro-signals of threat. The sound of a notification, the haste of a schedule, the posture of sitting—all translate into a persistent sympathetic buzz. Yin Yoga operates as an intentional counter-signal.\n\nBy maintaining static postures for minutes at a time, we bypass the superficial muscle fibers and target the deep fascial nets. Fascia is highly innervated, holding a significant portion of our sensory nerve endings. When we yield into gravity without force, we slowly change the mechanical tension in these tissues.\n\nThis gentle, sustained traction stimulates the mechanoreceptors in our joints and fascia. They transmit signals to the vagus nerve, which in turn commands the amygdala to stand down. Heart rate slows, digestion active, and the body shifts from defensive posture to restorative cellular repair.",
      featuredImage: "",
      date: "July 9, 2026",
      category: "Philosophy",
      readTime: "5 min read",
      likes: 12,
      status: "published",
      tags: ["Philosophy", "Restorative"],
      isFeatured: true,
    },
  ],
};

function ensureLocalDirsExist() {
  if (isLocal) {
    if (!fs.existsSync(LOCAL_DATA_DIR)) fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    if (!fs.existsSync(LOCAL_UPLOAD_DIR)) fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    if (isLocal) {
      ensureLocalDirsExist();
      if (fs.existsSync(LOCAL_JSON_PATH)) {
        const fileContent = fs.readFileSync(LOCAL_JSON_PATH, "utf-8");
        const data = JSON.parse(fileContent) as YogaContent;
        patchContentDataDefaults(data);
        return NextResponse.json(data);
      } else {
        fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(DEFAULT_CONTENT, null, 2), "utf-8");
        return NextResponse.json(DEFAULT_CONTENT);
      }
    } else {
      const { blobs } = await list();
      const contentBlob = blobs.find(
        (b) => b.pathname === "yoga-content.json" || b.pathname.endsWith("/yoga-content.json")
      );
      if (contentBlob) {
        const response = await fetch(contentBlob.url);
        if (response.ok) {
          const data = (await response.json()) as YogaContent;
          patchContentDataDefaults(data);
          return NextResponse.json(data);
        }
      }
    }
  } catch (error) {
    console.warn("GET content fetch failed. Returning baseline content fallback.", error);
  }
  return NextResponse.json(DEFAULT_CONTENT);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const contentStr = formData.get("content") as string;
    if (!contentStr) {
      return NextResponse.json({ error: "Missing content payload." }, { status: 400 });
    }

    const contentData = JSON.parse(contentStr) as YogaContent;
    const getExtension = (filename: string) => {
      const parts = filename.split(".");
      return parts.length > 1 ? `.${parts.pop()}` : "";
    };

    ensureLocalDirsExist();

    // Process image uploads
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const ext = getExtension(value.name);
        const filename = `${key.replace(/[_\s]/g, "-")}-${Date.now()}${ext}`;
        let imageUrl = "";

        if (isLocal) {
          const filePath = path.join(LOCAL_UPLOAD_DIR, filename);
          const buffer = Buffer.from(await value.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          imageUrl = `/uploads/${filename}`;
        } else {
          const blob = await put(`uploads/${filename}`, value, { access: "public" });
          imageUrl = blob.url;
        }

        if (key === "heroImage") contentData.heroImageUrl = imageUrl;
        else if (key === "aboutImage") contentData.aboutImageUrl = imageUrl;
        else if (key === "contactPortraitImage") contentData.contactPortraitUrl = imageUrl;
        else if (key.startsWith("offeringImage_")) {
          const id = key.substring("offeringImage_".length);
          const offering = contentData.offerings.find((o) => o.id === id);
          if (offering) offering.image = imageUrl;
        } else if (key.startsWith("portfolioImage_")) {
          const id = key.substring("portfolioImage_".length);
          const portItem = contentData.portfolio.find((p) => p.id === id);
          if (portItem) portItem.image = imageUrl;
        } else if (key.startsWith("blogImage_")) {
          const id = key.substring("blogImage_".length);
          const blogPost = contentData.blogPosts.find((b) => b.id === id);
          if (blogPost) blogPost.featuredImage = imageUrl;
        }
      }
    }

    patchContentDataDefaults(contentData);

    let savedUrl = "";
    if (isLocal) {
      fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(contentData, null, 2), "utf-8");
      savedUrl = "/data/homepage.json";
    } else {
      const contentBlob = await put("yoga-content.json", JSON.stringify(contentData), {
        access: "public",
        allowOverwrite: true,
      });
      savedUrl = contentBlob.url;
    }

    return NextResponse.json({ success: true, url: savedUrl, content: contentData });
  } catch (error: any) {
    console.error("Content POST sync failed:", error);
    return NextResponse.json(
      { error: "Failed to write data or save uploaded images.", details: error?.message || String(error) },
      { status: 550 }
    );
  }
}

function patchContentDataDefaults(data: YogaContent) {
  if (!data.offerings) data.offerings = DEFAULT_CONTENT.offerings;
  if (!data.portfolio) data.portfolio = DEFAULT_CONTENT.portfolio;
  if (!data.testimonials) data.testimonials = DEFAULT_CONTENT.testimonials;
  if (!data.blogPosts) data.blogPosts = DEFAULT_CONTENT.blogPosts;
  if (!data.authorName) data.authorName = DEFAULT_CONTENT.authorName;
  if (!data.authorBio) data.authorBio = DEFAULT_CONTENT.authorBio;
  if (!data.contactEmail) data.contactEmail = DEFAULT_CONTENT.contactEmail;
  if (!data.leads) data.leads = [];
  if (!data.studioName) data.studioName = DEFAULT_CONTENT.studioName;

  data.hideHero = typeof data.hideHero === "boolean" ? data.hideHero : false;
  data.hideAbout = typeof data.hideAbout === "boolean" ? data.hideAbout : false;
  data.hideOfferings = typeof data.hideOfferings === "boolean" ? data.hideOfferings : false;
  data.hidePortfolio = typeof data.hidePortfolio === "boolean" ? data.hidePortfolio : false;
  data.hideTestimonials = typeof data.hideTestimonials === "boolean" ? data.hideTestimonials : false;
  data.hideBlog = typeof data.hideBlog === "boolean" ? data.hideBlog : false;

  // Theme colors
  if (!data.themePrimary) data.themePrimary = DEFAULT_CONTENT.themePrimary;
  if (!data.themeBackground) data.themeBackground = DEFAULT_CONTENT.themeBackground;
  if (!data.themeCard) data.themeCard = DEFAULT_CONTENT.themeCard;
  if (!data.themeText) data.themeText = DEFAULT_CONTENT.themeText;
  if (!data.themeAccent) data.themeAccent = DEFAULT_CONTENT.themeAccent;

  // Audio
  data.audioEnabled = typeof data.audioEnabled === "boolean" ? data.audioEnabled : false;
  if (!data.audioPreset) data.audioPreset = "tibetan-bowl";

  // Contact portrait
  if (data.contactPortraitUrl === undefined) data.contactPortraitUrl = "";

  // Social media
  data.socialEnabled = typeof data.socialEnabled === "boolean" ? data.socialEnabled : false;
  if (data.socialInstagram === undefined) data.socialInstagram = "";
  if (data.socialFacebook === undefined) data.socialFacebook = "";
  if (data.socialYoutube === undefined) data.socialYoutube = "";

  // Section text labels — patch with defaults so old JSON stays fully populated
  if (!data.navCtaLabel) data.navCtaLabel = DEFAULT_CONTENT.navCtaLabel;
  if (!data.heroTagline) data.heroTagline = DEFAULT_CONTENT.heroTagline;
  if (!data.heroCtaLabel) data.heroCtaLabel = DEFAULT_CONTENT.heroCtaLabel;
  if (!data.aboutTagline) data.aboutTagline = DEFAULT_CONTENT.aboutTagline;
  if (!data.aboutHeading) data.aboutHeading = DEFAULT_CONTENT.aboutHeading;
  if (!data.aboutImageSubtitle) data.aboutImageSubtitle = DEFAULT_CONTENT.aboutImageSubtitle;
  if (!data.aboutCtaLabel) data.aboutCtaLabel = DEFAULT_CONTENT.aboutCtaLabel;
  if (!data.offeringsTagline) data.offeringsTagline = DEFAULT_CONTENT.offeringsTagline;
  if (!data.offeringsHeading) data.offeringsHeading = DEFAULT_CONTENT.offeringsHeading;
  if (!data.offeringsSubtitle) data.offeringsSubtitle = DEFAULT_CONTENT.offeringsSubtitle;
  if (!data.offeringsCtaLabel) data.offeringsCtaLabel = DEFAULT_CONTENT.offeringsCtaLabel;
  if (!data.portfolioTagline) data.portfolioTagline = DEFAULT_CONTENT.portfolioTagline;
  if (!data.portfolioHeading) data.portfolioHeading = DEFAULT_CONTENT.portfolioHeading;
  if (!data.testimonialsTagline) data.testimonialsTagline = DEFAULT_CONTENT.testimonialsTagline;
  if (!data.testimonialsHeading) data.testimonialsHeading = DEFAULT_CONTENT.testimonialsHeading;
  if (!data.blogTagline) data.blogTagline = DEFAULT_CONTENT.blogTagline;
  if (!data.blogHeading) data.blogHeading = DEFAULT_CONTENT.blogHeading;
  if (!data.blogSubtitle) data.blogSubtitle = DEFAULT_CONTENT.blogSubtitle;
  if (!data.contactTagline) data.contactTagline = DEFAULT_CONTENT.contactTagline;
  if (!data.contactHeading) data.contactHeading = DEFAULT_CONTENT.contactHeading;
  if (!data.contactSubtitle) data.contactSubtitle = DEFAULT_CONTENT.contactSubtitle;
  if (!data.contactNameLabel) data.contactNameLabel = DEFAULT_CONTENT.contactNameLabel;
  if (!data.contactEmailLabel) data.contactEmailLabel = DEFAULT_CONTENT.contactEmailLabel;
  if (!data.contactLocationLabel) data.contactLocationLabel = DEFAULT_CONTENT.contactLocationLabel;
  if (!data.contactMessageLabel) data.contactMessageLabel = DEFAULT_CONTENT.contactMessageLabel;
  if (!data.contactSubmitLabel) data.contactSubmitLabel = DEFAULT_CONTENT.contactSubmitLabel;
  if (!data.contactSuccessTitle) data.contactSuccessTitle = DEFAULT_CONTENT.contactSuccessTitle;
  if (!data.contactSuccessMessage) data.contactSuccessMessage = DEFAULT_CONTENT.contactSuccessMessage;
  if (!data.footerTagline) data.footerTagline = DEFAULT_CONTENT.footerTagline;

  data.blogPosts = data.blogPosts.map((post) => ({
    ...post,
    category: post.category || "Philosophy",
    readTime: post.readTime || "5 min read",
    likes: typeof post.likes === "number" ? post.likes : 0,
    status: post.status || "published",
    tags: Array.isArray(post.tags) ? post.tags : post.category ? [post.category] : [],
    isFeatured: typeof post.isFeatured === "boolean" ? post.isFeatured : false,
  }));

  data.leads = data.leads.map((lead) => ({
    ...lead,
    status: lead.status || "New",
  }));
}
