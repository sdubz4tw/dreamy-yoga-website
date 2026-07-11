import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { YogaContent } from "@/types";

const DEFAULT_CONTENT: YogaContent = {
  heroTitle: "Returning to the wisdom of the body.",
  heroSubtitle: "Bespoke somatic practices, restorative alignments, and private mentorship programs designed to cultivate presence, stability, and cellular renewal.",
  aboutBioText: "My teaching path is rooted in somatic anatomy, sensory introspection, and traditional Hatha and Yin lineages. I believe that alignment is not a rigid physical ideal, but an intuitive conversation with your own skeleton, tissues, and breathing pathways.\n\nHaving spent over a decade guiding students through deep restorative processes, my goal is to hold a safe space where you can release chronic physical tension and slow down to the frequency of natural expansion.\n\nWhether you are stepping onto the mat to recover from injury, calm your nervous system, or refine your advanced structural alignment, we will cultivate a tailored path suited to your exact somatic geometry.",
  services: [
    {
      id: "private",
      name: "Private 1-on-1 Sessions",
      description: "Bespoke posture assessment, custom somatic adjustives, and individualized breath guidance. These private sessions are customized dynamically around your body's structural history, athletic goals, and specific nervous system needs.",
      price: 120,
    },
    {
      id: "group",
      name: "Group Classes",
      description: "Shared vinyasa patterns, slow-flowing transitions, and community yin gatherings. Practice inside an airy, light-filled environment alongside a supportive, collective community seeking physical strength, structural ease, and daily grounding.",
      price: 35,
    }
  ],
  heroImageUrl: "",
  aboutImageUrl: "",
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
    
    // 1. Extract JSON content string and parse it
    const contentStr = formData.get("content") as string;
    if (!contentStr) {
      return NextResponse.json({ error: "Missing content payload." }, { status: 400 });
    }
    const contentData = JSON.parse(contentStr) as YogaContent;

    // Helper for file extension
    const getExtension = (filename: string) => {
      const parts = filename.split(".");
      return parts.length > 1 ? `.${parts.pop()}` : "";
    };

    // 2. Extract uploaded files
    const heroImage = formData.get("heroImage") as File | null;
    const aboutImage = formData.get("aboutImage") as File | null;

    // 3. Upload Hero Image if provided
    if (heroImage && heroImage.size > 0) {
      const ext = getExtension(heroImage.name);
      const filename = `uploads/hero-bg-${Date.now()}${ext}`;
      const blob = await put(filename, heroImage, {
        access: "public",
        allowOverwrite: true,
      });
      contentData.heroImageUrl = blob.url;
    }

    // 4. Upload About Image if provided
    if (aboutImage && aboutImage.size > 0) {
      const ext = getExtension(aboutImage.name);
      const filename = `uploads/about-profile-${Date.now()}${ext}`;
      const blob = await put(filename, aboutImage, {
        access: "public",
        allowOverwrite: true,
      });
      contentData.aboutImageUrl = blob.url;
    }

    // 5. Overwrite the main configuration file
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
