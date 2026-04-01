import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  getCourseLessonProgressService,
  getMyCourseDetailService,
  updateLessonProgressService,
} from "../../services/Course/CourseService";
import { useCourseProgressStore } from "../../store/CourseProgressStore";

const normalizePayload = (response) =>
  response?.data?.data ?? response?.data?.content;

const formatDuration = (seconds) => {
  const value = Number(seconds || 0);
  if (!value) return "--";

  const minutes = Math.floor(value / 60);
  const remainSeconds = value % 60;
  return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
};

const CourseDetailPage = () => {
  const { role = "user", courseId } = useParams();
  const navigate = useNavigate();
  const setCourseProgress = useCourseProgressStore(
    (state) => state.setCourseProgress,
  );

  const [courseDetail, setCourseDetail] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [expandedSectionIds, setExpandedSectionIds] = useState(new Set());
  const [savingLessonId, setSavingLessonId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [detailRes, progressRes] = await Promise.all([
        getMyCourseDetailService(courseId),
        getCourseLessonProgressService(courseId),
      ]);

      const detailPayload = normalizePayload(detailRes);
      const progressPayload = normalizePayload(progressRes);

      const completed = new Set(
        (Array.isArray(progressPayload) ? progressPayload : [])
          .filter((item) => item?.isCompleted)
          .map((item) => item?.lessonId),
      );

      setCourseDetail(detailPayload || null);
      setCompletedLessons(completed);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Khong the tai chi tiet khoa hoc",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    loadData();
  }, [courseId]);

  const allLessons = useMemo(() => {
    const sections = courseDetail?.course?.sections || [];
    return sections.flatMap((section) => section.lessons || []);
  }, [courseDetail]);

  const completedCount = useMemo(() => {
    return allLessons.filter((lesson) => completedLessons.has(lesson.id))
      .length;
  }, [allLessons, completedLessons]);

  const progressPercent = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  const nextLessonId = useMemo(() => {
    const firstUncompleted = allLessons.find(
      (lesson) => !completedLessons.has(lesson.id),
    );

    if (firstUncompleted) return firstUncompleted.id;
    return allLessons[0]?.id;
  }, [allLessons, completedLessons]);

  useEffect(() => {
    if (!courseId) return;
    setCourseProgress(courseId, progressPercent);
  }, [courseId, progressPercent, setCourseProgress]);

  const course = courseDetail?.course;
  const sections = course?.sections || [];

  useEffect(() => {
    setExpandedSectionIds(new Set());
  }, [courseId, sections.length]);

  const handleToggleLesson = async (lessonId) => {
    if (!lessonId) return;

    const isCompleted = completedLessons.has(lessonId);
    setSavingLessonId(lessonId);

    try {
      await updateLessonProgressService(lessonId, {
        isCompleted: !isCompleted,
      });

      setCompletedLessons((prev) => {
        const next = new Set(prev);
        if (isCompleted) {
          next.delete(lessonId);
        } else {
          next.add(lessonId);
        }
        return next;
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Khong the cap nhat tien do bai hoc",
      );
    } finally {
      setSavingLessonId("");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#23263a] bg-[#151925] p-8 text-center text-slate-400">
        Dang tai chi tiet khoa hoc...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(`/${role}/my-courses`)}
          className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a]"
        >
          Quay lại
        </button>

        <div className="rounded-xl border border-red-700/40 bg-red-950/20 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/${role}/my-courses`)}
        className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a]"
      >
        Quay lại
      </button>

      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-100">
            {course?.title || "Course detail"}
          </h1>

          <button
            type="button"
            disabled={!nextLessonId}
            onClick={() =>
              navigate(
                `/${role}/my-courses/${courseId}/lessons/${nextLessonId}`,
              )
            }
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Bắt đầu học
          </button>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          {course?.description || "Khong co mo ta"}
        </p>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
            <span>Tổng tiến độ</span>
            <span>
              {progressPercent}% ({completedCount}/{allLessons.length})
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#23263a]">
            <div
              className="h-2 rounded-full bg-cyan-600 transition-all"
              style={{
                width: `${Math.max(0, Math.min(100, progressPercent))}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {sections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2f3652] bg-[#151925] p-8 text-center text-slate-400">
            Chưa có bài học nào trong khóa học này.
          </div>
        ) : (
          sections.map((section) => (
            <article
              key={section.id}
              className="rounded-xl border border-[#23263a] bg-[#151925] p-5"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between rounded-lg border border-transparent px-1 py-1 text-left transition hover:border-[#2f3652]"
              >
                <h2 className="text-lg font-semibold text-slate-100">
                  Section {section.order}: {section.title}
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${
                    expandedSectionIds.has(section.id) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedSectionIds.has(section.id) && (
                <div className="mt-4 space-y-3">
                  {(section.lessons || []).map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isSaving = savingLessonId === lesson.id;

                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#23263a] bg-[#0f1320] p-3"
                      >
                        <div>
                          <p className="font-medium text-slate-100">
                            {lesson.order}. {lesson.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {lesson.type} · {formatDuration(lesson.duration)}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleToggleLesson(lesson.id)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            isCompleted
                              ? "bg-emerald-600 text-white hover:bg-emerald-500"
                              : "bg-cyan-600 text-white hover:bg-cyan-500"
                          } ${isSaving ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                          {isSaving
                            ? "Đang lưu..."
                            : isCompleted
                              ? "Đã hoàn thành"
                              : "Đánh dấu hoàn thành"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default CourseDetailPage;
