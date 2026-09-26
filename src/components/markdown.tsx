"use client";

import React from "react";

interface MarkdownProps {
  content: string;
}

const MARKDOWN_STYLES = `
  h1 { font-size: 2.25rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; color: #f8fafc; }
  h2 { font-size: 1.75rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #f1f5f9; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
  h3 { font-size: 1.35rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #e2e8f0; }
  h4 { font-size: 1.15rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #e2e8f0; }
  p { margin-bottom: 1rem; line-height: 1.75; color: #e2e8f0; }
  strong { font-weight: 600; color: #f8fafc; }
  em { font-style: italic; }
  ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
  ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
  li { margin-bottom: 0.5rem; line-height: 1.7; }
  li::marker { color: #94a3b8; }
  a { color: #22d3ee; text-decoration: underline; text-underline-offset: 2px; }
  a:hover { color: #67e8f9; }
  table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
  th, td { border: 1px solid #334155; padding: 0.625rem 0.875rem; text-align: left; }
  th { background-color: #1e293b; font-weight: 600; color: #f8fafc; }
  td { color: #e2e8f0; }
  tr:nth-child(even) td { background-color: #0f172a; }
  code { background-color: #1e293b; color: #fbbf24; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.9em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  pre { background-color: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 1rem; overflow-x: auto; margin: 1.5rem 0; }
  pre code { background: none; padding: 0; color: #e2e8f0; font-size: 0.875rem; }
  blockquote { border-left: 3px solid #22d3ee; padding-left: 1rem; margin: 1.5rem 0; color: #94a3b8; font-style: italic; }
  hr { border: none; border-top: 1px solid #334155; margin: 2rem 0; }
  mark { background-color: #fef08a; color: #713f12; padding: 0.125rem 0.25rem; border-radius: 0.125rem; }
`;

export function Markdown({ content }: MarkdownProps) {
  const [html, setHtml] = React.useState<string>("");

  React.useEffect(() => {
    const styleTag = `<style>${MARKDOWN_STYLES}</style>`;
    let html = content
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^\*\*(.+?)\*\*/gim, "<strong>$1</strong>")
      .replace(/^\*(.+?)\*/gim, "<em>$1</em>")
      .replace(/^`(.+?)`/gim, "<code>$1</code>")
      .replace(/^```[\s\S]*?```/gim, (match) => {
        const code = match.replace(/^```\w*\n/, "").replace(/\n```$/, "");
        return `<pre><code>${code}</code></pre>`;
      })
      .replace(/^\|(.+)\|$/gim, (match) => {
        const cells = match.split("|").slice(1, -1).map((c) => c.trim());
        return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
      })
      .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/^---$/gim, "<hr />")
      .replace(/^--- .*$/gim, "")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br />");

    // Wrap paragraphs
    html = html.replace(/^(?!<[hutblo])/gm, "<p>").replace(/(?!<\/[hutblo])$/gm, "</p>");
    html = html.replace(/<p><\/p>/g, "").replace(/<p>(<h[1-6]>)/g, "$1").replace(/(<\/h[1-6]>)<\/p>/g, "$1");
    html = html.replace(/<p>(<ul>)/g, "$1").replace(/(<\/ul>)<\/p>/g, "$1");
    html = html.replace(/<p>(<ol>)/g, "$1").replace(/(<\/ol>)<\/p>/g, "$1");
    html = html.replace(/<p>(<pre>)/g, "$1").replace(/(<\/pre>)<\/p>/g, "$1");
    html = html.replace(/<p>(<blockquote>)/g, "$1").replace(/(<\/blockquote>)<\/p>/g, "$1");
    html = html.replace(/<p>(<hr \/>)/g, "$1").replace(/(<hr \/>?)<\/p>/g, "$1");
    html = html.replace(/<p>(<table>)/g, "$1").replace(/(<\/table>)<\/p>/g, "$1");

    // Fix table rows
    html = html.replace(/(<tr>.*?<\/tr>)/g, (match) => {
      if (match.includes("<td>")) return match;
      return match.replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
    });

    setHtml(styleTag + html);
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}