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
  ]
};

export async function GET() {
  try {
    // 1. List files in Vercel Blob to search for our content JSON file
    // Note: If BLOB_READ_WRITE_TOKEN is not configured, list() will throw
    const { blobs } = await list();
    const contentBlob = blobs.find(
      (b) => b.pathname === "yoga-content.json" || b.pathname.endsWith("/yoga-content.json")
    );

    if (contentBlob) {
      // 2. Fetch the JSON file contents directly from the public blob URL
      const response = await fetch(contentBlob.url);
      if (response.ok) {
        const data = (await response.json()) as YogaContent;
        return NextResponse.json(data);
      }
    }
  } catch (error) {
    console.warn("Vercel Blob GET failed. Returning fallback baseline content.", error);
  }

  // 3. Fallback content if the file does not exist yet or connection fails
  return NextResponse.json(DEFAULT_CONTENT);
}

export async function POST(request: NextRequest) {
  try {
    const updatedData = (await request.json()) as YogaContent;

    // Validate request structure briefly
    if (!updatedData.heroTitle || !updatedData.services) {
      return NextResponse.json({ error: "Invalid content structure." }, { status: 400 });
    }

    // 4. Overwrite/Stream directly to Vercel Blob with the required allowOverwrite flag
    const blob = await put("yoga-content.json", JSON.stringify(updatedData), {
      access: "public",
      allowOverwrite: true,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error("Vercel Blob POST failed:", error);
    return NextResponse.json(
      {
        error: "Failed to write content to Vercel Blob database.",
        details: error?.message || "Missing BLOB_READ_WRITE_TOKEN or network error.",
      },
      { status: 500 }
    );
  }
}
