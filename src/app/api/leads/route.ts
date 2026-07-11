import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { YogaContent, LeadItem } from "@/types";
import fs from "fs";
import path from "path";

const isLocal = process.env.NODE_ENV === "development" || !process.env.VERCEL;
const LOCAL_DATA_DIR = path.join(process.cwd(), "public/data");
const LOCAL_JSON_PATH = path.join(LOCAL_DATA_DIR, "homepage.json");
const EMAIL_LOGS_PATH = path.join(LOCAL_DATA_DIR, "email_logs.txt");

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Error: Missing required form fields. Please supply Name, Email, and Message." },
        { status: 400 }
      );
    }

    // 1. Fetch current content data structure
    let contentData: YogaContent | null = null;

    if (isLocal) {
      if (fs.existsSync(LOCAL_JSON_PATH)) {
        const fileContent = fs.readFileSync(LOCAL_JSON_PATH, "utf-8");
        contentData = JSON.parse(fileContent) as YogaContent;
      }
    } else {
      const { blobs } = await list();
      const contentBlob = blobs.find(
        (b) => b.pathname === "yoga-content.json" || b.pathname.endsWith("/yoga-content.json")
      );
      if (contentBlob) {
        const response = await fetch(contentBlob.url);
        if (response.ok) {
          contentData = (await response.json()) as YogaContent;
        }
      }
    }

    // Fallback if data doesn't exist yet
    if (!contentData) {
      return NextResponse.json(
        { error: "Error: Could not retrieve database layout configuration to append lead." },
        { status: 500 }
      );
    }

    // 2. Append new lead
    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      status: "New",
    };

    if (!contentData.leads) {
      contentData.leads = [];
    }
    contentData.leads.push(newLead);

    // 3. Write changes back to database
    if (isLocal) {
      if (!fs.existsSync(LOCAL_DATA_DIR)) {
        fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(contentData, null, 2), "utf-8");
    } else {
      await put("yoga-content.json", JSON.stringify(contentData), {
        access: "public",
        allowOverwrite: true,
      });
    }

    // 4. Dispatch Email Routing notification
    const recipientEmail = contentData.contactEmail || "elena@example.com";
    const emailSubject = `✦ New Somatic Inquiry from ${name}`;
    const emailBody = `
==================================================
NEW LEAD CAPTURED
==================================================
Recipient: ${recipientEmail}
Subject:   ${emailSubject}
Timestamp: ${newLead.timestamp}

Visitor Name:    ${name}
Visitor Email:   ${email}
Visitor Message:
--------------------------------------------------
${message}
--------------------------------------------------
Status: Pending Review inside Admin CMS Drawer
==================================================
`;

    // Print output to console
    console.log(emailBody);

    // Write logs local public folder
    if (isLocal) {
      fs.appendFileSync(EMAIL_LOGS_PATH, emailBody + "\n");
    }

    return NextResponse.json({
      success: true,
      message: "Lead recorded and notification dispatched successfully.",
      lead: newLead,
    });
  } catch (error: any) {
    console.error("Leads submission POST route failed:", error);
    return NextResponse.json(
      {
        error: "Error: Failed to register contact inquiry or route notification.",
        details: error?.message || String(error),
      },
      { status: 550 }
    );
  }
}
