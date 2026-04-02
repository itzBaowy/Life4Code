import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCourseSectionsService,
  getCourseLessonsService,
  updateLessonService,
} from "../../services/Course/CourseService";
import { useNotification } from "../../components/common/NotificationStack";
import RichTextEditor from "../../components/common/RichTextEditor";
import {
  getVideoPresignedUrlService,
  uploadFileToPresignedUrl,
} from "../../services/Upload/UploadService";

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

const MAX_VIDEO_SIZE_MB = 300;

const formatEta = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--";
  if (seconds < 60) return `${Math.ceil(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  const remainSeconds = Math.ceil(seconds % 60);
  return `${minutes}m ${remainSeconds}s`;
};

const LessonEditPage = () => {
  const navigate = useNavigate();
  const { role, courseId, lessonId } = useParams();
  const { showError, showSuccess } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    percent: 0,
    speedMBps: 0,
    remainingSeconds: Number.POSITIVE_INFINITY,
  });
  const [videoFile, setVideoFile] = useState(null);
  const uploadCancelRef = useRef(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    sectionId: "",
    title: "",
    slug: "",
    type: "TEXT",
    content: "",
    videoUrl: "",
    duration: "",
    order: "",
    isPublished: false,
  });

  const backToLessonManagementPath = useMemo(() => {
    const currentRole = String(role || "admin").toLowerCase();
    return `/${currentRole}/course/${courseId}/lessons`;
  }, [courseId, role]);

  useEffect(() => {
    const loadLesson = async () => {
      setIsLoading(true);

      try {
        const [sectionsResponse, lessonsResponse] = await Promise.all([
          getCourseSectionsService(courseId),
          getCourseLessonsService(courseId),
        ]);
        const sectionsPayload =
          sectionsResponse?.data?.data ?? sectionsResponse?.data?.content;
        const sectionOptions = Array.isArray(sectionsPayload)
          ? sectionsPayload
          : [];
        setSections(sectionOptions);

        const payload =
          lessonsResponse?.data?.data ?? lessonsResponse?.data?.content;
        const sectionsInLessonTree = Array.isArray(payload?.sections)
          ? payload.sections
          : [];

        const matchedSection = sectionsInLessonTree.find((section) =>
          (section.lessons || []).some((lesson) => lesson.id === lessonId),
        );
        const matchedLesson = (matchedSection?.lessons || []).find(
          (lesson) => lesson.id === lessonId,
        );

        if (!matchedSection || !matchedLesson) {
          showError("Lesson Not Found", "Không tìm thấy bài học để chỉnh sửa");
          navigate(backToLessonManagementPath, { replace: true });
          return;
        }

        setCourseTitle(payload?.title || "");
        setLessonTitle(matchedLesson.title || "");
        setFormData({
          sectionId: matchedSection.id || "",
          title: matchedLesson.title || "",
          slug: matchedLesson.slug || "",
          type: matchedLesson.type || "TEXT",
          content: matchedLesson.content || "",
          videoUrl: matchedLesson.videoUrl || "",
          duration:
            matchedLesson.duration === null ||
            matchedLesson.duration === undefined
              ? ""
              : String(matchedLesson.duration),
          order:
            matchedLesson.order === null || matchedLesson.order === undefined
              ? ""
              : String(matchedLesson.order),
          isPublished: Boolean(matchedLesson.isPublished),
        });
      } catch (error) {
        showError(
          "Load Lesson Failed",
          normalizeErrorMessage(error, "Không thể tải dữ liệu bài học"),
        );
        navigate(backToLessonManagementPath, { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && lessonId) {
      loadLesson();
    }
  }, [backToLessonManagementPath, courseId, lessonId, navigate, showError]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectVideoFile = (event) => {
    const file = event.target.files?.[0] || null;

    if (file && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      showError(
        "Validation Error",
        `Kích thước video vượt quá ${MAX_VIDEO_SIZE_MB}MB. Vui lòng chọn file nhỏ hơn.`,
      );
      event.target.value = "";
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
    setUploadStats({
      percent: 0,
      speedMBps: 0,
      remainingSeconds: Number.POSITIVE_INFINITY,
    });
  };

  const handleCancelUpload = () => {
    if (uploadCancelRef.current) {
      uploadCancelRef.current();
      uploadCancelRef.current = null;
      setIsUploadingVideo(false);
      showError("Upload Cancelled", "Đã hủy upload video");
    }
  };

  const handleUploadVideoToS3 = async () => {
    if (!videoFile) {
      showError("Validation Error", "Vui lòng chọn file video trước khi upload");
      return;
    }

    if (!String(videoFile.type || "").startsWith("video/")) {
      showError("Validation Error", "Chỉ chấp nhận file video");
      return;
    }

    setIsUploadingVideo(true);
    setUploadStats({
      percent: 0,
      speedMBps: 0,
      remainingSeconds: Number.POSITIVE_INFINITY,
    });
    try {
      const response = await getVideoPresignedUrlService({
        fileName: videoFile.name,
        fileType: videoFile.type,
      });

      const payload = response?.data?.data ?? response?.data?.content;
      const uploadUrl = payload?.uploadUrl;
      const fileUrl = payload?.fileUrl;

      if (!uploadUrl || !fileUrl) {
        throw new Error("Invalid presigned URL response");
      }

      const uploadTask = uploadFileToPresignedUrl({
        uploadUrl,
        file: videoFile,
        fileType: videoFile.type,
        onProgress: (stats) =>
          setUploadStats({
            percent: stats?.percent || 0,
            speedMBps: stats?.speedMBps || 0,
            remainingSeconds:
              stats?.remainingSeconds ?? Number.POSITIVE_INFINITY,
          }),
      });
      uploadCancelRef.current = uploadTask.cancel;

      await uploadTask.promise;

      setFormData((prev) => ({
        ...prev,
        type: "VIDEO",
        videoUrl: fileUrl,
      }));

      showSuccess("Upload Success", "Upload video lên S3 thành công");
    } catch (error) {
      const errorMessage =
        String(error?.message || "").toLowerCase() ===
        "upload video aborted"
          ? "Đã hủy upload video"
          : normalizeErrorMessage(error, "Không thể upload video lên S3");

      showError(
        "Upload Failed",
        errorMessage,
      );
    } finally {
      uploadCancelRef.current = null;
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.sectionId) {
      showError("Validation Error", "Vui lòng chọn section");
      return;
    }

    if (!formData.title.trim()) {
      showError("Validation Error", "Vui lòng nhập tên bài học");
      return;
    }

    if (formData.type === "VIDEO" && !formData.videoUrl.trim()) {
      showError("Validation Error", "Bài học VIDEO cần video URL");
      return;
    }

    if (formData.type === "TEXT" && !hasTextContent(formData.content)) {
      showError("Validation Error", "Bài học TEXT cần nội dung hợp lệ");
      return;
    }

    if (
      formData.type === "VIDEO" &&
      formData.videoUrl.trim() &&
      !isValidHttpUrl(formData.videoUrl.trim())
    ) {
      showError("Validation Error", "Video URL không hợp lệ (http/https)");
      return;
    }

    if (formData.order !== "" && !isPositiveInteger(formData.order)) {
      showError("Validation Error", "Lesson order phải là số nguyên dương");
      return;
    }

    if (formData.duration !== "" && !isNonNegativeInteger(formData.duration)) {
      showError("Validation Error", "Duration phải là số nguyên không âm");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateLessonService(courseId, lessonId, {
        sectionId: formData.sectionId,
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        type: formData.type,
        content: formData.type === "TEXT" ? formData.content : undefined,
        videoUrl:
          formData.type === "VIDEO" ? formData.videoUrl.trim() : undefined,
        duration: formData.duration ? Number(formData.duration) : undefined,
        order: formData.order ? Number(formData.order) : undefined,
        isPublished: Boolean(formData.isPublished),
      });

      showSuccess("Update Lesson Success", "Đã cập nhật bài học thành công");
      navigate(backToLessonManagementPath);
    } catch (error) {
      showError(
        "Update Lesson Failed",
        normalizeErrorMessage(error, "Không thể cập nhật bài học"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <div className="mb-3">
          <Link
            to={backToLessonManagementPath}
            className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            <ArrowLeft size={16} />
            Quay lại quản lý bài học
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Chỉnh sửa bài học</h1>
        <p className="mt-1 text-sm text-slate-400">
          {courseTitle ? `Khoá học: ${courseTitle}` : ""}
          {lessonTitle ? ` | Bài học: ${lessonTitle}` : ""}
        </p>
      </section>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-[#2f3652] bg-[#151925] p-8 text-center text-slate-400">
          Đang tải dữ liệu bài học...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-[#23263a] bg-[#151925] p-5"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <select
              name="sectionId"
              value={formData.sectionId}
              onChange={handleInputChange}
              className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            >
              <option value="">Chọn section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  Section {section.order}: {section.title}
                </option>
              ))}
            </select>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Tên bài học"
              className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <input
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="Slug (tuỳ chọn)"
              className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            >
              <option value="TEXT">TEXT</option>
              <option value="VIDEO">VIDEO</option>
            </select>
            <input
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="Duration (giây)"
              className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <input
              name="order"
              type="number"
              value={formData.order}
              onChange={handleInputChange}
              placeholder="Lesson order (tuỳ chọn)"
              className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            {formData.type === "VIDEO" && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleSelectVideoFile}
                    className="block w-full max-w-md rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-cyan-500"
                  />
                  <button
                    type="button"
                    disabled={isUploadingVideo || !videoFile}
                    onClick={handleUploadVideoToS3}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                  >
                    {isUploadingVideo ? "Đang upload..." : "Upload video S3"}
                  </button>
                  {isUploadingVideo && (
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      Hủy upload
                    </button>
                  )}
                </div>

                {videoFile ? (
                  <p className="text-xs text-slate-400">
                    File đã chọn: {videoFile.name}
                  </p>
                ) : null}

                {(isUploadingVideo || uploadStats.percent > 0) && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Tiến độ upload</span>
                      <span>{uploadStats.percent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#23263a]">
                      <div
                        className="h-2 rounded-full bg-cyan-600 transition-all"
                        style={{
                          width: `${Math.max(0, Math.min(100, uploadStats.percent))}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Tốc độ: {uploadStats.speedMBps.toFixed(2)} MB/s</span>
                      <span>ETA: {formatEta(uploadStats.remainingSeconds)}</span>
                    </div>
                  </div>
                )}

                <input
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="Video URL (tự động sau khi upload hoặc nhập tay)"
                  className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {formData.type === "TEXT" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-300">
                Nội dung bài học
              </p>
              <RichTextEditor
                value={formData.content}
                onChange={(html) =>
                  setFormData((prev) => ({
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
              checked={formData.isPublished}
              onChange={handleInputChange}
            />
            Publish bài học
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
            >
              {isSubmitting ? "Đang lưu..." : "Cập nhật bài học"}
            </button>
            <button
              type="button"
              onClick={() => navigate(backToLessonManagementPath)}
              className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-[#23263a]"
            >
              Huỷ
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LessonEditPage;
