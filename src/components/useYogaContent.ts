"use client";

import { useState, useEffect } from "react";
import { YogaContent } from "@/types";

export function useYogaContent() {
  const [content, setContent] = useState<YogaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to resolve endpoint.");
        return res.json();
      })
      .then((data: YogaContent) => {
        setContent(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!content) return;
    const root = document.documentElement;
    if (content.themePrimary) root.style.setProperty("--color-sage", content.themePrimary);
    if (content.themeBackground) root.style.setProperty("--color-bg", content.themeBackground);
    if (content.themeCard) root.style.setProperty("--color-card", content.themeCard);
    if (content.themeText) root.style.setProperty("--color-text", content.themeText);
    if (content.themeAccent) root.style.setProperty("--color-accent", content.themeAccent);
    document.body.style.backgroundColor = content.themeBackground || "#0B0807";
  }, [content]);

  return { content, isLoading };
}
