import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["code-block", "link"],
  ["clean"],
];

const modules = {
  toolbar: toolbarOptions,
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "code-block",
  "link",
];

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Nhap noi dung bai hoc...",
}) => {
  const handleChange = (content) => {
    if (typeof onChange === "function") {
      onChange(content);
    }
  };

  return (
    <div className="rounded-lg border border-[#2f3652] bg-[#0f1320]">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="text-slate-100"
      />
    </div>
  );
};

export default RichTextEditor;
