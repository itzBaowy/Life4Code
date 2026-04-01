import React, { useEffect, useMemo, useState } from "react";
import {
  createCourseService,
  createLessonService,
  deleteLessonService,
  deleteCourseService,
  getCourseLessonsService,
  getCourseCatalogService,
  updateLessonService,
  updateCourseService,
} from "../../services/Course/CourseService";
import { useNotification } from "../../components/common/NotificationStack";
import RichTextEditor from "../../components/common/RichTextEditor";
import HtmlRenderer from "../../components/common/HtmlRenderer";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  thumbnail: "",
  isPublished: false,
};

const initialLessonForm = {
  sectionTitle: "",
  sectionOrder: "",
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

const CourseManagementPage = () => {
  const { showSuccess, showError } = useNotification();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [lessonManagerCourse, setLessonManagerCourse] = useState(null);
  const [lessonSections, setLessonSections] = useState([]);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [isLessonSubmitting, setIsLessonSubmitting] = useState(false);
  const [lessonForm, setLessonForm] = useState(initialLessonForm);
  const [editingLessonId, setEditingLessonId] = useState(null);

  const filteredCourses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return courses;

    return courses.filter((course) => {
      const title = String(course?.title || "").toLowerCase();
      const slug = String(course?.slug || "").toLowerCase();
      return title.includes(keyword) || slug.includes(keyword);
    });
  }, [courses, searchTerm]);

  const loadCatalog = async () => {
    setIsLoading(true);

    try {
      const response = await getCourseCatalogService();
      const payload = response?.data?.data ?? response?.data?.content;
      const nextData = Array.isArray(payload) ? payload : [];

      setCourses(nextData);
    } catch (error) {
      showError(
        "Load Courses Failed",
        normalizeErrorMessage(error, "Không thể tải danh sách khóa học"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setIsFormOpen(true);
    setFormData({
      title: course.title || "",
      slug: course.slug || "",
      description: course.description || "",
      thumbnail: course.thumbnail || "",
      isPublished: Boolean(course.isPublished),
    });
  };

  const handleDelete = async (courseId, title) => {
    const accepted = window.confirm(
      `ạn chắc chắn muốn xóa khóa học "${title}"?`,
    );
    if (!accepted) return;

    try {
      await deleteCourseService(courseId);
      showSuccess("Delete Success", "Đã xoá khoa học thành công");
      await loadCatalog();

      if (editingId === courseId) {
        resetForm();
      }
    } catch (error) {
      showError(
        "Delete Failed",
        normalizeErrorMessage(error, "Không thể xóa khóa học"),
      );
    }
  };

  const buildPayload = () => {
    const payload = {
      title: formData.title.trim(),
      isPublished: Boolean(formData.isPublished),
    };

    if (formData.slug.trim()) payload.slug = formData.slug.trim();
    if (formData.description.trim())
      payload.description = formData.description.trim();
    if (formData.thumbnail.trim())
      payload.thumbnail = formData.thumbnail.trim();

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      showError("Validation Error", "Vui lòng nhập tên khóa học");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();

      if (editingId) {
        await updateCourseService(editingId, payload);
        showSuccess("Update Success", "Đã cập nhật khóa học thành công");
      } else {
        await createCourseService(payload);
        showSuccess("Create Success", "Đã tạo khóa học mới thành công");
      }

      resetForm();
      await loadCatalog();
    } catch (error) {
      showError(
        editingId ? "Update Failed" : "Create Failed",
        normalizeErrorMessage(error, "Không thể lưu khóa học"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      await updateCourseService(course.id, {
        isPublished: !course.isPublished,
      });
      showSuccess("Update Success", "Đã cập nhật trạng thái publish");
      await loadCatalog();
    } catch (error) {
      showError(
        "Update Failed",
        normalizeErrorMessage(error, "Không thể cập nhật trạng thái publish"),
      );
    }
  };

  const resetLessonForm = () => {
    setLessonForm(initialLessonForm);
    setEditingLessonId(null);
  };

  const openLessonManager = async (course) => {
    setLessonManagerCourse(course);
    setIsLessonLoading(true);
    resetLessonForm();

    try {
      const response = await getCourseLessonsService(course.id);
      const payload = response?.data?.data ?? response?.data?.content;
      setLessonSections(
        Array.isArray(payload?.sections) ? payload.sections : [],
      );
    } catch (error) {
      showError(
        "Load Lessons Failed",
        normalizeErrorMessage(error, "Không thể tải danh sách bài học"),
      );
      setLessonSections([]);
    } finally {
      setIsLessonLoading(false);
    }
  };

  const reloadLessonManager = async () => {
    if (!lessonManagerCourse?.id) return;

    try {
      const response = await getCourseLessonsService(lessonManagerCourse.id);
      const payload = response?.data?.data ?? response?.data?.content;
      setLessonSections(
        Array.isArray(payload?.sections) ? payload.sections : [],
      );
    } catch (error) {
      showError(
        "Reload Lessons Failed",
        normalizeErrorMessage(error, "Không thể tải lại danh sách bài học"),
      );
    }
  };

  const handleLessonInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setLessonForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditLesson = (section, lesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      sectionTitle: section.title || "",
      sectionOrder: String(section.order ?? ""),
      title: lesson.title || "",
      slug: lesson.slug || "",
      type: lesson.type || "TEXT",
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      duration:
        lesson.duration === null || lesson.duration === undefined
          ? ""
          : String(lesson.duration),
      order:
        lesson.order === null || lesson.order === undefined
          ? ""
          : String(lesson.order),
      isPublished: Boolean(lesson.isPublished),
    });
  };

  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!lessonManagerCourse?.id) return;

    const accepted = window.confirm(
      `Bạn chắc chắn muốn xoá bài học "${lessonTitle}"?`,
    );
    if (!accepted) return;

    try {
      await deleteLessonService(lessonManagerCourse.id, lessonId);
      showSuccess("Delete Lesson Success", "Đã xoá bài học thành công");
      if (editingLessonId === lessonId) {
        resetLessonForm();
      }
      await reloadLessonManager();
    } catch (error) {
      showError(
        "Delete Lesson Failed",
        normalizeErrorMessage(error, "Không thể xoá bài học"),
      );
    }
  };

  const buildLessonPayload = () => {
    return {
      sectionTitle: lessonForm.sectionTitle.trim(),
      sectionOrder: lessonForm.sectionOrder
        ? Number(lessonForm.sectionOrder)
        : undefined,
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

  const handleLessonSubmit = async (event) => {
    event.preventDefault();
    if (!lessonManagerCourse?.id) return;

    if (!lessonForm.sectionTitle.trim()) {
      showError("Validation Error", "Vui lòng nhập tên section");
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

    setIsLessonSubmitting(true);
    try {
      const payload = buildLessonPayload();

      if (editingLessonId) {
        await updateLessonService(
          lessonManagerCourse.id,
          editingLessonId,
          payload,
        );
        showSuccess("Update Lesson Success", "Đã cập nhật bài học thành công");
      } else {
        await createLessonService(lessonManagerCourse.id, payload);
        showSuccess("Create Lesson Success", "Đã tạo bài học mới thành công");
      }

      resetLessonForm();
      await reloadLessonManager();
      await loadCatalog();
    } catch (error) {
      showError(
        editingLessonId ? "Update Lesson Failed" : "Create Lesson Failed",
        normalizeErrorMessage(error, "Không thể lưu bài học"),
      );
    } finally {
      setIsLessonSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <h1 className="text-2xl font-bold text-slate-100">Quản lý khoá học</h1>
        <p className="mt-1 text-sm text-slate-400">
          Quản lý tất cả khoá học, tạo mới, cập nhật thông tin và theo dõi trạng
          thái publish.
        </p>
      </section>

      <section className="space-y-6">
        <div className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-100">
              Danh sách Khoá học
            </h2>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tim theo ten hoac slug..."
                className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500 sm:w-72"
              />
              <button
                type="button"
                onClick={openCreateForm}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                Tạo Khoá Học
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-dashed border-[#2f3652] p-8 text-center text-slate-400">
              Đang tải danh sách khóa học...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#2f3652] p-8 text-center text-slate-400">
              Không có khóa học nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-[#2a2f45] text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-3">Khoá học</th>
                    <th className="px-3 py-3">Slug</th>
                    <th className="px-3 py-3">Sections</th>
                    <th className="px-3 py-3">Enrollments</th>
                    <th className="px-3 py-3">Trang Thái</th>
                    <th className="px-3 py-3 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b border-[#1f2438]">
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-100">
                          {course.title}
                        </div>
                        <div className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {course.description || "Khong co mo ta"}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-300">
                        {course.slug}
                      </td>
                      <td className="px-3 py-3 text-slate-300">
                        {course?._count?.sections || 0}
                      </td>
                      <td className="px-3 py-3 text-slate-300">
                        {course?._count?.enrollments || 0}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            course.isPublished
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(course)}
                            className="rounded-md border border-[#2f3652] px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-[#23263a]"
                          >
                            {course.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(course)}
                            className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => openLessonManager(course)}
                            className="rounded-md bg-violet-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-violet-500"
                          >
                            Bài học
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(course.id, course.title)
                            }
                            className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-500"
                          >
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {lessonManagerCourse && (
          <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-100">
                Quản lý bài học: {lessonManagerCourse.title}
              </h2>
              <button
                type="button"
                onClick={() => setLessonManagerCourse(null)}
                className="rounded-lg border border-[#2f3652] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#23263a]"
              >
                Đóng panel bài học
              </button>
            </div>

            <form
              onSubmit={handleLessonSubmit}
              className="space-y-3 rounded-lg border border-[#23263a] bg-[#0f1320] p-4"
            >
              <h3 className="text-sm font-semibold text-slate-100">
                {editingLessonId ? "Cập nhật bài học" : "Tạo bài học mới"}
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="sectionTitle"
                  value={lessonForm.sectionTitle}
                  onChange={handleLessonInputChange}
                  placeholder="Tên section"
                  className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                />
                <input
                  name="sectionOrder"
                  type="number"
                  value={lessonForm.sectionOrder}
                  onChange={handleLessonInputChange}
                  placeholder="Section order (tuỳ chọn)"
                  className="rounded-lg border border-[#2f3652] bg-[#151925] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                />
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
                  disabled={isLessonSubmitting}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
                >
                  {isLessonSubmitting
                    ? "Đang lưu..."
                    : editingLessonId
                      ? "Cập nhật bài học"
                      : "Tạo bài học"}
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
              {isLessonLoading ? (
                <div className="rounded-lg border border-dashed border-[#2f3652] p-6 text-center text-sm text-slate-400">
                  Đang tải danh sách bài học...
                </div>
              ) : lessonSections.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#2f3652] p-6 text-center text-sm text-slate-400">
                  Chưa có section hoặc bài học nào.
                </div>
              ) : (
                lessonSections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-lg border border-[#23263a] bg-[#0f1320] p-4"
                  >
                    <h4 className="text-sm font-semibold text-slate-100">
                      Section {section.order}: {section.title}
                    </h4>

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
                                onClick={() =>
                                  handleEditLesson(section, lesson)
                                }
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
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-[#23263a] bg-[#151925] p-5"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-100">
              {editingId ? "Cập Nhật Khoá Học" : "Tạo Khoá Học Mới"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Tên khóa học
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="VD: React for Beginners"
                  className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Slug (không bắt buộc)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="react-for-beginners"
                  className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Nhập mô tả khóa học"
                  className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </div>

              <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[#2f3652] bg-[#0f1320]"
                />
                Publish ngay sau khi lưu
              </label>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập Nhật"
                    : "Tạo Mới"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a]"
              >
                Đóng
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default CourseManagementPage;
