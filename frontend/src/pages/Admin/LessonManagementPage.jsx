import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createSectionService,
  createLessonService,
  deleteSectionService,
  deleteLessonService,
  getCourseLessonsService,
  getCourseSectionsService,
  updateSectionService,
} from "../../services/Course/CourseService";
import { useNotification } from "../../components/common/NotificationStack";
import RichTextEditor from "../../components/common/RichTextEditor";
import HtmlRenderer from "../../components/common/HtmlRenderer";

const initialSectionForm = {
  title: "",
  order: "",
};

const initialLessonForm = {
  sectionId: "",
  title: "",
  slug: "",
  type: "TEXT",
  content: "",
  videoUrl: "",
  duration: "",
  order: "",
  isPublished: false,
};

const normalizeErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.content ||
    error?.message ||
    fallbackMessage
  );
};

const hasTextContent = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const isNonNegativeInteger = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0;

const isPositiveInteger = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0;

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(String(value || ""));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const LessonManagementPage = () => {
  const { role, courseId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [courseTitle, setCourseTitle] = useState("");
  const [sectionsOnly, setSectionsOnly] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSectionSubmitting, setIsSectionSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionForm, setSectionForm] = useState(initialSectionForm);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [lessonForm, setLessonForm] = useState(initialLessonForm);
  const [expandedSectionIds, setExpandedSectionIds] = useState(new Set());

  const backToCoursesPath = useMemo(() => {
    const currentRole = String(role || "admin").toLowerCase();
    return `/${currentRole}/courses`;
  }, [role]);

  const loadSections = async () => {
    try {
      const response = await getCourseSectionsService(courseId);
      const payload = response?.data?.data ?? response?.data?.content;
      const nextSections = Array.isArray(payload) ? payload : [];
      setSectionsOnly(nextSections);
    } catch (error) {
      showError(
        "Load Sections Failed",
        normalizeErrorMessage(error, "Không thể tải danh sách section"),
      );
    }
  };

  const loadLessons = async () => {
    setIsLoading(true);

    try {
      const response = await getCourseLessonsService(courseId);
      const payload = response?.data?.data ?? response?.data?.content;
      const nextSections = Array.isArray(payload?.sections)
        ? payload.sections
        : [];

      setCourseTitle(payload?.title || "");
      setSections(nextSections);
      setExpandedSectionIds(new Set());
    } catch (error) {
      showError(
        "Load Lessons Failed",
        normalizeErrorMessage(error, "Không thể tải danh sách bài học"),
      );
      navigate(backToCoursesPath, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      if (!courseId) return;
      await Promise.all([loadLessons(), loadSections()]);
    };

    loadPageData();
  }, [courseId]);

  const resetSectionForm = () => {
    setSectionForm(initialSectionForm);
    setEditingSectionId(null);
  };

  const resetLessonForm = () => {
    setLessonForm(initialLessonForm);
  };

  const handleSectionInputChange = (event) => {
    const { name, value } = event.target;
    setSectionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionSubmit = async (event) => {
    event.preventDefault();

    if (!sectionForm.title.trim()) {
      showError("Validation Error", "Vui lòng nhập tên section");
      return;
    }

    if (sectionForm.order !== "" && !isPositiveInteger(sectionForm.order)) {
      showError("Validation Error", "Section order phải là số nguyên dương");
      return;
    }

    setIsSectionSubmitting(true);
    try {
      const payload = {
        title: sectionForm.title.trim(),
        order: sectionForm.order ? Number(sectionForm.order) : undefined,
      };

      if (editingSectionId) {
        await updateSectionService(courseId, editingSectionId, payload);
        showSuccess("Update Section Success", "Đã cập nhật section thành công");
      } else {
        await createSectionService(courseId, payload);
        showSuccess("Create Section Success", "Đã tạo section mới thành công");
      }

      resetSectionForm();
      await Promise.all([loadSections(), loadLessons()]);
    } catch (error) {
      showError(
        editingSectionId ? "Update Section Failed" : "Create Section Failed",
        normalizeErrorMessage(error, "Không thể lưu section"),
      );
    } finally {
      setIsSectionSubmitting(false);
    }
  };

  const handleEditSection = (section) => {
    setEditingSectionId(section.id);
    setSectionForm({
      title: section.title || "",
      order:
        section.order === null || section.order === undefined
          ? ""
          : String(section.order),
    });
  };

  const handleDeleteSection = async (section) => {
    const accepted = window.confirm(
      `Bạn chắc chắn muốn xoá section "${section.title}"? Tất cả bài học trong section cũng sẽ bị xoá.`,
    );

    if (!accepted) return;

    try {
      await deleteSectionService(courseId, section.id);
      showSuccess("Delete Section Success", "Đã xoá section thành công");

      if (editingSectionId === section.id) {
        resetSectionForm();
      }

      if (lessonForm.sectionId === section.id) {
        setLessonForm((prev) => ({ ...prev, sectionId: "" }));
      }

      await Promise.all([loadSections(), loadLessons()]);
    } catch (error) {
      showError(
        "Delete Section Failed",
        normalizeErrorMessage(error, "Không thể xoá section"),
      );
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleLessonInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setLessonForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildLessonPayload = () => {
    return {
      sectionId: lessonForm.sectionId,
      title: lessonForm.title.trim(),
      slug: lessonForm.slug.trim() || undefined,
      type: lessonForm.type,
      content: lessonForm.type === "TEXT" ? lessonForm.content : undefined,
      videoUrl:
        lessonForm.type === "VIDEO" ? lessonForm.videoUrl.trim() : undefined,
      duration: lessonForm.duration ? Number(lessonForm.duration) : undefined,
      order: lessonForm.order ? Number(lessonForm.order) : undefined,
      isPublished: Boolean(lessonForm.isPublished),
    };
  };

  const handleCreateLesson = async (event) => {
    event.preventDefault();

    if (!lessonForm.sectionId) {
      showError("Validation Error", "Vui lòng chọn section");
      return;
    }

    if (!lessonForm.title.trim()) {
      showError("Validation Error", "Vui lòng nhập tên bài học");
      return;
    }

    if (lessonForm.type === "VIDEO" && !lessonForm.videoUrl.trim()) {
      showError("Validation Error", "Bài học VIDEO cần video URL");
      return;
    }

    if (lessonForm.type === "TEXT" && !hasTextContent(lessonForm.content)) {
      showError("Validation Error", "Bài học TEXT cần nội dung hợp lệ");
      return;
    }

    if (
      lessonForm.type === "VIDEO" &&
      lessonForm.videoUrl.trim() &&
      !isValidHttpUrl(lessonForm.videoUrl.trim())
    ) {
      showError("Validation Error", "Video URL không hợp lệ (http/https)");
      return;
    }

    if (lessonForm.order !== "" && !isPositiveInteger(lessonForm.order)) {
      showError("Validation Error", "Lesson order phải là số nguyên dương");
      return;
    }

    if (
      lessonForm.duration !== "" &&
      !isNonNegativeInteger(lessonForm.duration)
    ) {
      showError("Validation Error", "Duration phải là số nguyên không âm");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildLessonPayload();
      await createLessonService(courseId, payload);
      showSuccess("Create Lesson Success", "Đã tạo bài học mới thành công");
      resetLessonForm();
      await Promise.all([loadSections(), loadLessons()]);
    } catch (error) {
      showError(
        "Create Lesson Failed",
        normalizeErrorMessage(error, "Không thể lưu bài học"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    const accepted = window.confirm(
      `Bạn chắc chắn muốn xoá bài học "${lessonTitle}"?`,
    );
    if (!accepted) return;

    try {
      await deleteLessonService(courseId, lessonId);
      showSuccess("Delete Lesson Success", "Đã xoá bài học thành công");
      await Promise.all([loadSections(), loadLessons()]);
    } catch (error) {
      showError(
        "Delete Lesson Failed",
        normalizeErrorMessage(error, "Không thể xoá bài học"),
      );
    }
  };

  const openEditLesson = (lessonId) => {
    const currentRole = String(role || "admin").toLowerCase();
    navigate(`/${currentRole}/course/${courseId}/lessons/${lessonId}/edit`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <div className="mb-3">
          <Link
            to={backToCoursesPath}
            className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            <ArrowLeft size={16} />
            Quay lại quản lý khoá học
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Quản lý bài học</h1>
        <p className="mt-1 text-sm text-slate-400">
          {courseTitle ? `Khoá học: ${courseTitle}` : "Đang tải khóa học..."}
        </p>
      </section>

      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <form
          onSubmit={handleSectionSubmit}
          className="space-y-3 rounded-lg border border-[#23263a] bg-[#0f1320] p-4"
        >
          <h3 className="text-sm font-semibold text-slate-100">
            {editingSectionId ? "Cập nhật section" : "Tạo section mới"}
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="title"
              value={sectionForm.title}
              onChange={handleSectionInputChange}
              placeholder="Tên section"
              className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <input
              name="order"
              type="number"
              value={sectionForm.order}
              onChange={handleSectionInputChange}
              placeholder="Section order (tuỳ chọn)"
              className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSectionSubmitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {isSectionSubmitting
                ? "Đang lưu..."
                : editingSectionId
                  ? "Cập nhật section"
                  : "Tạo section"}
            </button>
            <button
              type="button"
              onClick={resetSectionForm}
              className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-[#23263a]"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-lg border border-[#23263a] bg-[#0f1320] p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            Danh sách section
          </h3>

          {sectionsOnly.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có section nào.</p>
          ) : (
            <div className="space-y-2">
              {sectionsOnly.map((section) => (
                <div
                  key={section.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#23263a] bg-[#151925] p-3"
                >
                  <p className="text-sm text-slate-100">
                    Section {section.order}: {section.title} (
                    {section?._count?.lessons || 0} bài học)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSection(section)}
                      className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section)}
                      className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleCreateLesson}
          className="mt-4 space-y-3 rounded-lg border border-[#23263a] bg-[#0f1320] p-4"
        >
          <h3 className="text-sm font-semibold text-slate-100">
            Tạo bài học mới trong section
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              name="sectionId"
              value={lessonForm.sectionId}
              onChange={handleLessonInputChange}
              className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            >
              <option value="">Chọn section</option>
              {sectionsOnly.map((section) => (
                <option key={section.id} value={section.id}>
                  Section {section.order}: {section.title}
                </option>
              ))}
            </select>
            <input
              name="title"
              value={lessonForm.title}
              onChange={handleLessonInputChange}
              placeholder="Tên bài học"
              className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <input
              name="slug"
              value={lessonForm.slug}
              onChange={handleLessonInputChange}
              placeholder="Slug (tuỳ chọn)"
              className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <select
              name="type"
              value={lessonForm.type}
              onChange={handleLessonInputChange}
              className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            >
              <option value="TEXT">TEXT</option>
              <option value="VIDEO">VIDEO</option>
            </select>
            <input
              name="duration"
              type="number"
              value={lessonForm.duration}
              onChange={handleLessonInputChange}
              placeholder="Duration (giây)"
              className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <input
              name="order"
              type="number"
              value={lessonForm.order}
              onChange={handleLessonInputChange}
              placeholder="Lesson order (tuỳ chọn)"
              className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            {lessonForm.type === "VIDEO" && (
              <input
                name="videoUrl"
                value={lessonForm.videoUrl}
                onChange={handleLessonInputChange}
                placeholder="Video URL"
                className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              />
            )}
          </div>

          {lessonForm.type === "TEXT" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-300">
                Nội dung bài học
              </p>
              <RichTextEditor
                value={lessonForm.content}
                onChange={(html) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    content: html,
                  }))
                }
                placeholder="Viết nội dung bài học tại đây..."
              />
            </div>
          )}

          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="isPublished"
              checked={lessonForm.isPublished}
              onChange={handleLessonInputChange}
            />
            Publish bài học
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
            >
              {isSubmitting ? "Đang lưu..." : "Tạo bài học"}
            </button>
            <button
              type="button"
              onClick={resetLessonForm}
              className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-[#23263a]"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="rounded-lg border border-dashed border-[#2f3652] p-6 text-center text-sm text-slate-400">
              Đang tải danh sách bài học...
            </div>
          ) : sections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#2f3652] p-6 text-center text-sm text-slate-400">
              Chưa có section hoặc bài học nào.
            </div>
          ) : (
            sections.map((section) => (
              <div
                key={section.id}
                className="rounded-lg border border-[#23263a] bg-[#0f1320] p-4"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between rounded-md border border-transparent px-1 py-1 text-left transition hover:border-[#2f3652]"
                >
                  <h4 className="text-sm font-semibold text-slate-100">
                    Section {section.order}: {section.title}
                  </h4>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${
                      expandedSectionIds.has(section.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedSectionIds.has(section.id) && (
                  <div className="mt-3 space-y-3">
                    {(section.lessons || []).map((lesson) => (
                      <div
                        key={lesson.id}
                        className="rounded-lg border border-[#23263a] bg-[#151925] p-3"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-100">
                            {lesson.order}. {lesson.title}
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditLesson(lesson.id)}
                              className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteLesson(lesson.id, lesson.title)
                              }
                              className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                            >
                              Xoá
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400">
                          {lesson.type} · {lesson.duration || 0}s ·{" "}
                          {lesson.isPublished ? "Published" : "Draft"}
                        </p>

                        {lesson.type === "TEXT" && lesson.content ? (
                          <div className="mt-2 rounded border border-[#2a2f45] bg-[#0f1320] p-2 text-slate-200">
                            <HtmlRenderer htmlContent={lesson.content} />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default LessonManagementPage;
