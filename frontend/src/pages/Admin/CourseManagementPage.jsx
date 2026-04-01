import React, { useEffect, useMemo, useState } from "react";
import {
  createCourseService,
  deleteCourseService,
  getCourseCatalogService,
  updateCourseService,
} from "../../services/Course/CourseService";
import { useNotification } from "../../components/common/NotificationStack";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  thumbnail: "",
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
