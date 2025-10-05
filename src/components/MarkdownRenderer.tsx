"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { ComponentPropsWithoutRef } from "react";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
      components={{
        // Headings
        h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
          <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
          <h2 className="text-xl font-bold mt-5 mb-3 first:mt-0" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
          <h3 className="text-lg font-semibold mt-4 mb-2 first:mt-0" {...props}>
            {children}
          </h3>
        ),
        h4: ({ children, ...props }: ComponentPropsWithoutRef<"h4">) => (
          <h4 className="text-base font-semibold mt-3 mb-2 first:mt-0" {...props}>
            {children}
          </h4>
        ),

        // Paragraphs
        p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
          <p className="mb-4 last:mb-0 leading-7" {...props}>
            {children}
          </p>
        ),

        // Lists
        ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
          <ul className="list-disc list-inside mb-4 space-y-2 ml-4" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 ml-4" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
          <li className="leading-7" {...props}>
            {children}
          </li>
        ),

        // Code blocks
        code: ({ className, children, ...props }: ComponentPropsWithoutRef<"code"> & { inline?: boolean }) => {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;

          if (isInline) {
            return (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code className={`${className} block`} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 border" {...props}>
            {children}
          </pre>
        ),

        // Blockquotes
        blockquote: ({ children, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
          <blockquote
            className="border-l-4 border-primary pl-4 py-2 mb-4 italic text-muted-foreground"
            {...props}
          >
            {children}
          </blockquote>
        ),

        // Links
        a: ({ children, href, ...props }: ComponentPropsWithoutRef<"a">) => (
          <a
            href={href}
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),

        // Tables
        table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
          <div className="mb-4 overflow-x-auto">
            <table className="min-w-full border-collapse border border-border" {...props}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
          <thead className="bg-muted" {...props}>
            {children}
          </thead>
        ),
        th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
          <th className="border border-border px-4 py-2 text-left font-semibold" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
          <td className="border border-border px-4 py-2" {...props}>
            {children}
          </td>
        ),

        // Horizontal rule
        hr: ({ ...props }: ComponentPropsWithoutRef<"hr">) => (
          <hr className="my-6 border-border" {...props} />
        ),

        // Strong/Bold
        strong: ({ children, ...props }: ComponentPropsWithoutRef<"strong">) => (
          <strong className="font-bold" {...props}>
            {children}
          </strong>
        ),

        // Emphasis/Italic
        em: ({ children, ...props }: ComponentPropsWithoutRef<"em">) => (
          <em className="italic" {...props}>
            {children}
          </em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
