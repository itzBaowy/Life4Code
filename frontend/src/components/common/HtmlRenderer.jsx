import React, { useMemo } from "react";
import DOMPurify from "dompurify";

const HtmlRenderer = ({ htmlContent = "" }) => {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(String(htmlContent || ""), {
      ADD_ATTR: ["target", "rel", "class"],
    });
  }, [htmlContent]);

  return (
    <div
      className="prose prose-invert max-w-none overflow-x-hidden wrap-break-word text-slate-200 **:max-w-full [&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-tight [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-2xl [&_h3]:font-semibold [&_p]:my-4 [&_p]:text-lg [&_p]:leading-8 [&_p]:wrap-break-word [&_strong]:font-bold [&_strong]:text-slate-100 [&_a]:break-all [&_a]:text-cyan-300 [&_a]:underline [&_li]:my-2 [&_li]:text-lg [&_li]:leading-8 [&_code]:break-all [&_code]:rounded [&_code]:bg-[#232741] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-cyan-200 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[#2f3652] [&_pre]:bg-[#1a1e34] [&_pre]:p-4 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_img]:h-auto [&_img]:max-w-full [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-500 [&_blockquote]:bg-[#111a2e] [&_blockquote]:px-4 [&_blockquote]:py-2"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default HtmlRenderer;
