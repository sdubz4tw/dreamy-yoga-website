import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { YogaContent } from "@/types";

const DEFAULT_CONTENT: YogaContent = {
  heroTitle: "Returning to the wisdom of the body.",
  heroSubtitle: "Bespoke somatic practices, restorative alignments, and private mentorship programs designed to cultivate presence, stability, and cellular renewal.",
  aboutBioText: "My teaching path is rooted in somatic anatomy, sensory introspection, and traditional Hatha and Yin lineages. I believe that alignment is not a rigid physical ideal, but an intuitive conversation with your own skeleton, tissues, and breathing pathways.\n\nHaving spent over a decade guiding students through deep restorative processes, my goal is to hold a safe space where you can release chronic physical tension and slow down to the frequency of natural expansion.\n\nWhether you are stepping onto the mat to recover from injury, calm your nervous system, or refine your advanced structural alignment, we will cultivate a tailored path suited to your exact somatic geometry.",
  services: [],
  heroImageUrl: "",
  aboutImageUrl: "",
  offerings: [
    {
      id: "private",
      title: "Private 1-on-1 Sessions",
      price: 120,
      description: "Bespoke posture assessment, custom somatic adjustives, and individualized breath guidance. These private sessions are customized dynamically around your body's structural history, athletic goals, and specific nervous system needs.",
      image: "",
    },
    {
      id: "group",
      title: "Group Classes",
      price: 35,
      description: "Shared vinyasa patterns, slow-flowing transitions, and community yin gatherings. Practice inside an airy, light-filled environment alongside a supportive, collective community seeking physical strength, structural ease, and daily grounding.",
      image: "",
    },
  ],
  portfolio: [
    {
      id: "port-1",
      title: "Morning Sun Asana",
      image: "",
      category: "Classes",
    },
    {
      id: "port-2",
      title: "Alabaster Studio Space",
      image: "",
      category: "Studio",
    },
    {
      id: "port-3",
      title: "Somatic Breathwork Circle",
      image: "",
      category: "Workshops",
    },
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
      content: "In the modern tempo, our bodies are continuously registering micro-signals of threat. The sound of a notification, the haste of a schedule, the posture of sitting—all translate into a persistent sympathetic buzz. Yin Yoga operates as an intentional counter-signal.\n\nBy maintaining static postures for minutes at a time, we bypass the superficial muscle fibers and target the deep fascial nets. Fascia is highly innervated, holding a significant portion of our sensory nerve endings. When we yield into gravity without force, we slowly change the mechanical tension in these tissues.\n\nThis gentle, sustained traction stimulates the mechanoreceptors in our joints and fascia. They transmit signals to the vagus nerve, which in turn commands the amygdala to stand down. Heart rate slows, digestion active, and the body shifts from defensive posture to restorative cellular repair.",
      featuredImage: "",
      date: "July 9, 2026",
      category: "Philosophy",
      readTime: "5 min read",
      likes: 12,
    },
  ],
};

export async function GET() {
  try {
    const { blobs } = await list();
    const contentBlob = blobs.find(
      (b) => b.pathname === "yoga-content.json" || b.pathname.endsWith("/yoga-content.json")
    );

    if (contentBlob) {
      const response = await fetch(contentBlob.url);
      if (response.ok) {
        const data = (await response.json()) as YogaContent;
        
        // Dynamic schema patching: ensure new parameters exist in fetched JSON configurations
        if (!data.offerings) data.offerings = DEFAULT_CONTENT.offerings;
        if (!data.portfolio) data.portfolio = DEFAULT_CONTENT.portfolio;
        if (!data.testimonials) data.testimonials = DEFAULT_CONTENT.testimonials;
        if (!data.blogPosts) data.blogPosts = DEFAULT_CONTENT.blogPosts;

        // Apply metadata defaults to blog posts
        data.blogPosts = data.blogPosts.map((post) => ({
          ...post,
          category: post.category || "Philosophy",
          readTime: post.readTime || "5 min read",
          likes: typeof post.likes === "number" ? post.likes : 0,
        }));

        return NextResponse.json(data);
      }
    }
  } catch (error) {
    console.warn("Vercel Blob GET failed. Returning fallback baseline content.", error);
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

    // Scan files dynamically
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const ext = getExtension(value.name);

        if (key === "heroImage") {
          const blob = await put(`uploads/hero-bg-${Date.now()}${ext}`, value, { access: "public" });
          contentData.heroImageUrl = blob.url;
        } else if (key === "aboutImage") {
          const blob = await put(`uploads/about-profile-${Date.now()}${ext}`, value, { access: "public" });
          contentData.aboutImageUrl = blob.url;
        } else if (key.startsWith("offeringImage_")) {
          const id = key.substring("offeringImage_".length);
          const blob = await put(`uploads/offering-${id}-${Date.now()}${ext}`, value, { access: "public" });
          
          const offering = contentData.offerings.find((o) => o.id === id);
          if (offering) offering.image = blob.url;
        } else if (key.startsWith("portfolioImage_")) {
          const id = key.substring("portfolioImage_".length);
          const blob = await put(`uploads/portfolio-${id}-${Date.now()}${ext}`, value, { access: "public" });
          
          const portItem = contentData.portfolio.find((p) => p.id === id);
          if (portItem) portItem.image = blob.url;
        } else if (key.startsWith("blogImage_")) {
          const id = key.substring("blogImage_".length);
          const blob = await put(`uploads/blog-${id}-${Date.now()}${ext}`, value, { access: "public" });
          
          const blogPost = contentData.blogPosts.find((b) => b.id === id);
          if (blogPost) blogPost.featuredImage = blob.url;
        }
      }
    }

    // Force default properties on all blogs before save
    contentData.blogPosts = contentData.blogPosts.map((post) => ({
      ...post,
      category: post.category || "Philosophy",
      readTime: post.readTime || "5 min read",
      likes: typeof post.likes === "number" ? post.likes : 0,
    }));

    const contentBlob = await put("yoga-content.json", JSON.stringify(contentData), {
      access: "public",
      allowOverwrite: true,
    });

    return NextResponse.json({
      success: true,
      url: contentBlob.url,
      content: contentData
    });
  } catch (error: any) {
    console.error("Vercel Blob POST failed:", error);
    return NextResponse.json(
      {
        error: "Failed to write data or images to Vercel Blob.",
        details: error?.message || "Missing BLOB_READ_WRITE_TOKEN or payload parsing error.",
      },
      { status: 500 }
    );
  }
}
