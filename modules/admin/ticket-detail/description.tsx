"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

/**
 * Detect whether a string contains HTML tags.
 */
function isHtml(str: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(str);
}

function HtmlRenderer({ html }: { html: string }) {
  return (
    <div
      className="text-sm leading-relaxed space-y-4
        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
        [&_h3:first-child]:mt-0
        [&_p]:text-muted-foreground [&_p]:leading-relaxed
        [&_ul]:text-muted-foreground [&_ul]:pl-5 [&_ul]:space-y-1
        [&_ol]:text-muted-foreground [&_ol]:pl-5 [&_ol]:space-y-1
        [&_li]:text-muted-foreground [&_li]:leading-relaxed [&_li]:pl-1
        [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5
        [&_code]:text-xs [&_code]:font-mono
        [&_strong]:font-semibold [&_strong]:text-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const MARKDOWN_COMPONENTS: Components = {
  h3: ({ children }) => (
    <h3 className="text-base font-semibold mt-8 mb-3 first:mt-0 text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold mt-6 mb-2 text-foreground">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-muted-foreground leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-muted-foreground pl-5 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-muted-foreground pl-5 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-muted-foreground leading-relaxed pl-1">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
      {children}
    </code>
  ),
};

function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div className="text-sm leading-relaxed space-y-4">
      <ReactMarkdown components={MARKDOWN_COMPONENTS}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export default function DescriptionRenderer({
  content,
}: {
  content: string | null;
}) {
  if (!content) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No description provided.
      </p>
    );
  }

  if (isHtml(content)) {
    return <HtmlRenderer html={content} />;
  }

  return <MarkdownRenderer markdown={content} />;
}
