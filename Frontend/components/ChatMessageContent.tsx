"use client";

import React from "react";
import Link from "next/link";

interface ChatMessageContentProps {
  content: string;
  isUser?: boolean;
}

export default function ChatMessageContent({ content, isUser = false }: ChatMessageContentProps) {
  if (isUser) {
    return <span>{content}</span>;
  }

  // Parse markdown-like content into structured React nodes
  const renderFormattedText = (text: string) => {
    // Split text by bold patterns (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g);

    return parts.map((part, index) => {
      if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
        const inner = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-foreground">
            {inner}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        const inner = part.slice(1, -1);
        return (
          <em key={index} className="italic text-foreground/90">
            {inner}
          </em>
        );
      }
      // Remove any lingering single asterisks
      const cleaned = part.replace(/\*/g, "");
      return <span key={index}>{cleaned}</span>;
    });
  };

  // Split content by lines
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (currentList.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-1.5 space-y-1">
            {currentList}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-1.5 space-y-1">
            {currentList}
          </ul>
        );
      }
      currentList = [];
      isNumberedList = false;
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      elements.push(<div key={`br-${idx}`} className="h-1.5" />);
      return;
    }

    // Heading (e.g. ### Heading or ## Heading)
    if (line.startsWith("###") || line.startsWith("##") || line.startsWith("#")) {
      flushList();
      const headingText = line.replace(/^#+\s*/, "");
      elements.push(
        <div key={`h-${idx}`} className="font-serif font-bold text-sm text-foreground pt-1.5 pb-0.5">
          {renderFormattedText(headingText)}
        </div>
      );
      return;
    }

    // Bullet point (e.g. "* text" or "- text" or "• text")
    const bulletMatch = line.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      if (isNumberedList) flushList();
      currentList.push(
        <li key={`li-${idx}`} className="leading-relaxed">
          {renderFormattedText(bulletMatch[1])}
        </li>
      );
      return;
    }

    // Numbered list item (e.g. "1. text", "2) text")
    const numberedMatch = line.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numberedMatch) {
      if (!isNumberedList && currentList.length > 0) flushList();
      isNumberedList = true;
      currentList.push(
        <li key={`nli-${idx}`} className="leading-relaxed">
          {renderFormattedText(numberedMatch[2])}
        </li>
      );
      return;
    }

    // Regular line / paragraph
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed my-0.5">
        {renderFormattedText(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-inherit">{elements}</div>;
}
