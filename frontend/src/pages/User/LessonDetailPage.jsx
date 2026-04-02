import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  getCourseLessonProgressService,
  getLessonDetailService,
  getMyCourseDetailService,
  updateLessonProgressService,
} from "../../services/Course/CourseService";
import { useCourseProgressStore } from "../../store/CourseProgressStore";
import HtmlRenderer from "../../components/common/HtmlRenderer";
import VideoPlayer from "../../components/common/VideoPlayer";

const normalizePayload = (response) =>
  response?.data?.data ?? response?.data?.content;

const formatDuration = (seconds) => {
  const value = Number(seconds || 0);
  if (!value) return "--";

  const minutes = Math.floor(value / 60);
  const remainSeconds = value % 60;
  return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
};

const LessonDetailPage = () => {
  const { role = "user", courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const setCourseProgress = useCourseProgressStore(
    (state) => state.setCourseProgress,
  );

  const [courseDetail, setCourseDetail] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [expandedSectionIds, setExpandedSectionIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lessonDetail, setLessonDetail] = useState(null);

  useEffect(() => {
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
          error?.response?.data?.message || "Khong the tai bai hoc",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId]);

  useEffect(() => {
    const loadLessonDetail = async () => {
      if (!lessonId) return;

      setIsLessonLoading(true);
      try {
        const response = await getLessonDetailService(lessonId);
        const payload = normalizePayload(response);
        setLessonDetail(payload || null);
      } catch (error) {
        setLessonDetail(null);
        setErrorMessage(
          error?.response?.data?.message || "Khong the tai chi tiet bai hoc",
        );
      } finally {
        setIsLessonLoading(false);
      }
    };

    setLessonDetail(null);
    if (courseId && lessonId) {
      loadLessonDetail();
    }
  }, [courseId, lessonId]);

  const allLessons = useMemo(() => {
    const sections = courseDetail?.course?.sections || [];
    return sections.flatMap((section) => section.lessons || []);
  }, [courseDetail]);

  const currentLesson = useMemo(
    () => allLessons.find((lesson) => lesson.id === lessonId),
    [allLessons, lessonId],
  );

  const resolvedLesson = useMemo(() => {
    if (!currentLesson) return null;
    if (lessonDetail?.id !== currentLesson.id) return currentLesson;

    return {
      ...currentLesson,
      ...lessonDetail,
    };
  }, [currentLesson, lessonDetail]);

  const currentLessonIndex = useMemo(
    () => allLessons.findIndex((lesson) => lesson.id === lessonId),
    [allLessons, lessonId],
  );

  const previousLesson =
    currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  const currentSectionId = useMemo(() => {
    const sections = courseDetail?.course?.sections || [];
    const section = sections.find((item) =>
      (item.lessons || []).some((lesson) => lesson.id === lessonId),
    );
    return section?.id;
  }, [courseDetail, lessonId]);

  const completedCount = useMemo(
    () => allLessons.filter((lesson) => completedLessons.has(lesson.id)).length,
    [allLessons, completedLessons],
  );

  const progressPercent = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  useEffect(() => {
    if (!courseId) return;
    setCourseProgress(courseId, progressPercent);
  }, [courseId, progressPercent, setCourseProgress]);

  useEffect(() => {
    const sections = courseDetail?.course?.sections || [];
    if (!sections.length) {
      setExpandedSectionIds(new Set());
      return;
    }

    const nextExpanded = new Set(sections.map((section) => section.id));
    setExpandedSectionIds(nextExpanded);
  }, [courseId, courseDetail, currentSectionId]);

  const handleToggleCompleted = async () => {
    if (!resolvedLesson?.id) return;

    const nextStatus = !completedLessons.has(resolvedLesson.id);
    setIsSaving(true);

    try {
      await updateLessonProgressService(resolvedLesson.id, {
        isCompleted: nextStatus,
      });

      setCompletedLessons((prev) => {
        const next = new Set(prev);
        if (nextStatus) {
          next.add(resolvedLesson.id);
        } else {
          next.delete(resolvedLesson.id);
        }
        return next;
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Khong the cap nhat trang thai bai hoc",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoEnded = async () => {
    if (!resolvedLesson?.id || completedLessons.has(resolvedLesson.id) || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await updateLessonProgressService(resolvedLesson.id, {
        isCompleted: true,
      });

      setCompletedLessons((prev) => {
        const next = new Set(prev);
        next.add(resolvedLesson.id);
        return next;
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Khong the cap nhat trang thai bai hoc",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#23263a] bg-[#151925] p-8 text-center text-slate-400">
        Dang tai bai hoc...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(`/${role}/my-courses/${courseId}`)}
          className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a]"
        >
          Quay lai khoa hoc
        </button>

        <div className="rounded-xl border border-red-700/40 bg-red-950/20 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!resolvedLesson) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(`/${role}/my-courses/${courseId}`)}
          className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a]"
        >
          Quay lai khoa hoc
        </button>

        <div className="rounded-xl border border-dashed border-[#2f3652] bg-[#151925] p-6 text-center text-slate-400">
          Khong tim thay bai hoc.
        </div>
      </div>
    );
  }

  const isCompleted = completedLessons.has(resolvedLesson.id);

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

  const navigateToLesson = (targetLessonId) => {
    if (!targetLessonId) return;
    navigate(`/${role}/my-courses/${courseId}/lessons/${targetLessonId}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-xl border border-[#23263a] bg-[#151925] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(`/${role}/my-courses/${courseId}`)}
                className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a]"
              >
                Quay lai khoa hoc
              </button>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Progress {completedCount}/{allLessons.length}
              </p>
            </div>

            <div className="mt-3 h-2 rounded-full bg-[#0f1320]">
              <div
                className="h-2 rounded-full bg-cyan-600 transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, progressPercent))}%`,
                }}
              />
            </div>
          </section>

          <section className="min-w-0 rounded-xl border border-[#23263a] bg-[#151925] p-5">
            <h1 className="text-2xl font-bold text-slate-100">
              {resolvedLesson.title}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              {resolvedLesson.type} · {formatDuration(resolvedLesson.duration)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleToggleCompleted}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                  isCompleted
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-cyan-600 hover:bg-cyan-500"
                } ${isSaving ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {isSaving
                  ? "Dang luu..."
                  : isCompleted
                    ? "Danh dau chua hoan thanh"
                    : "Danh dau hoan thanh"}
              </button>

              <button
                type="button"
                disabled={!previousLesson}
                onClick={() => navigateToLesson(previousLesson?.id)}
                className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Bài trước
              </button>

              <button
                type="button"
                disabled={!nextLesson}
                onClick={() => navigateToLesson(nextLesson?.id)}
                className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Bài tiếp
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
            {isLessonLoading ? (
              <p className="rounded-lg border border-dashed border-[#2f3652] bg-[#0f1320] p-4 text-sm text-slate-400">
                Dang tai video bai hoc...
              </p>
            ) : resolvedLesson.type === "VIDEO" ? (
              resolvedLesson.videoUrl ? (
                <VideoPlayer
                  videoUrl={resolvedLesson.videoUrl}
                  onEnded={handleVideoEnded}
                />
              ) : (
                <p className="rounded-lg border border-dashed border-[#2f3652] bg-[#0f1320] p-4 text-sm text-slate-400">
                  Bai hoc video chua co duong dan video.
                </p>
              )
            ) : (
              <div className="min-w-0 overflow-hidden rounded-lg border border-[#23263a] bg-[#0f1320] p-4">
                <HtmlRenderer
                  htmlContent={
                    resolvedLesson.content ||
                    "<p>Bai hoc text chua co noi dung.</p>"
                  }
                />
              </div>
            )}
          </section>
        </div>

        <aside className="rounded-xl border border-[#23263a] bg-[#101626] p-4 xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-100">
            {courseDetail?.course?.title || "Course"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {progressPercent}% hoan thanh
          </p>

          <div className="mt-4 space-y-3">
            {(courseDetail?.course?.sections || []).map((section) => (
              <div
                key={section.id}
                className="rounded-lg border border-[#23263a] bg-[#0d1322] p-3"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="mb-2 flex w-full items-center justify-between rounded-md border border-transparent px-1 py-1 text-left transition hover:border-[#2f3652]"
                >
                  <p className="text-sm font-semibold text-slate-100">
                    {section.title}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#1d263f] px-2 py-0.5 text-[11px] text-slate-300">
                      {(section.lessons || []).length}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${
                        expandedSectionIds.has(section.id) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {expandedSectionIds.has(section.id) && (
                  <div className="space-y-2">
                    {(section.lessons || []).map((lesson) => {
                      const lessonCompleted = completedLessons.has(lesson.id);
                      const isCurrent = lesson.id === resolvedLesson.id;

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() =>
                            navigate(
                              `/${role}/my-courses/${courseId}/lessons/${lesson.id}`,
                            )
                          }
                          className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                            isCurrent
                              ? "border-cyan-500 bg-cyan-600/20"
                              : "border-[#23263a] bg-[#111a2e] hover:bg-[#18233d]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm font-medium text-slate-100">
                              {lesson.order}. {lesson.title}
                            </p>
                            <span
                              className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                                lessonCompleted
                                  ? "bg-emerald-400"
                                  : "bg-slate-500"
                              }`}
                            />
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {lesson.type} · {formatDuration(lesson.duration)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LessonDetailPage;
