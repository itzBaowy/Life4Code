import React, { useMemo } from "react";
import DOMPurify from "dompurify";

const HtmlRenderer = ({ htmlContent = "" }) => {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(String(htmlContent || ""));
  }, [htmlContent]);

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default HtmlRenderer;
