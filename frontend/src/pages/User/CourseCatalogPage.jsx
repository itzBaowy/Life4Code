import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCourseCatalogService,
  enrollCourseService,
  getMyCoursesService,
} from "../../services/Course/CourseService";
import { useNotification } from "../../components/common/NotificationStack";

const CourseCatalogPage = () => {
  const navigate = useNavigate();
  const { role = "user" } = useParams();
  const { showSuccess, showError } = useNotification();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [enrollingId, setEnrollingId] = useState(null);
  const [myEnrolledCourses, setMyEnrolledCourses] = useState([]);

  const PAGE_SIZE = 9;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount || 0));

  const loadCatalog = async (targetPage = 1, searchKeyword = keyword) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getCourseCatalogService({
        page: targetPage,
        pageSize: PAGE_SIZE,
        keyword: searchKeyword || undefined,
        isPublished: true,
      });

      const payload = response?.data?.data ?? response?.data?.content;
      const nextCourses = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];

      setCourses(nextCourses);
      setPage(payload?.page || targetPage);
      setTotalPage(payload?.totalPage || 1);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Không thể tải danh sách khóa học. Vui lòng thử lại sau.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog(1, "");
  }, []);

  useEffect(() => {
    const loadMyEnrolledCourses = async () => {
      try {
        const response = await getMyCoursesService();
        const payload = response?.data?.data ?? response?.data?.content;
        const items = Array.isArray(payload) ? payload : [];

        const normalized = items
          .map((item) => ({
            enrollmentId: item.enrollmentId,
            progress: Number(item.progress || 0),
            ...(item.course || {}),
            isEnrolled: true,
          }))
          .filter((course) => course.id);

        setMyEnrolledCourses(normalized);
      } catch (_) {
        setMyEnrolledCourses([]);
      }
    };

    loadMyEnrolledCourses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCatalog(1, keyword);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPage) return;
    setPage(newPage);
    loadCatalog(newPage, keyword);
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      await enrollCourseService(courseId);
      showSuccess("Đăng ký khóa học thành công!");
      let enrolledCourse = null;
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === courseId) {
            enrolledCourse = { ...c, isEnrolled: true, progress: 0 };
            return enrolledCourse;
          }
          return c;
        }),
      );

      if (enrolledCourse) {
        setMyEnrolledCourses((prev) => {
          if (prev.some((c) => c.id === enrolledCourse.id)) {
            return prev;
          }
          return [enrolledCourse, ...prev];
        });
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Đăng ký khóa học thất bại.";
      showError(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const handleGoToCheckout = (course) => {
    navigate(`/${role}/checkout/${course.id}`, {
      state: { course },
    });
  };

  const enrolledCourseIdSet = new Set([
    ...myEnrolledCourses.map((course) => course.id),
    ...courses.filter((course) => course.isEnrolled).map((course) => course.id),
  ]);

  const availableCourses = courses.filter(
    (course) => !enrolledCourseIdSet.has(course.id),
  );

  const mergedEnrolledMap = new Map();
  myEnrolledCourses.forEach((course) => {
    mergedEnrolledMap.set(course.id, { ...course, isEnrolled: true });
  });
  courses
    .filter((course) => enrolledCourseIdSet.has(course.id))
    .forEach((course) => {
      if (!mergedEnrolledMap.has(course.id)) {
        mergedEnrolledMap.set(course.id, { ...course, isEnrolled: true });
      }
    });
  const enrolledCourses = Array.from(mergedEnrolledMap.values());

  const renderCourseCard = (course, options = {}) => {
    const { showPrice = true } = options;

    return (
    <article
      key={course.id}
      className="flex flex-col rounded-xl border border-[#23263a] bg-[#151925] p-4 shadow-sm"
    >
      <img
        src={course.thumbnail || "https://placehold.co/600x340?text=Course"}
        alt={course.title || "Course"}
        className="h-36 w-full rounded-lg object-cover"
      />

      <h3 className="mt-3 line-clamp-2 text-base font-semibold text-slate-100">
        {course.title || "Untitled course"}
      </h3>

      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
        {course.description || "Chưa có mô tả."}
      </p>

      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <span>{course._count?.sections || 0} chương</span>
        <span>•</span>
        <span>{course._count?.enrollments || 0} học viên</span>
      </div>

      {showPrice ? (
        <div className="mt-2 text-sm font-semibold text-cyan-400">
          {formatCurrency(course.price)}
        </div>
      ) : null}

      <div className="mt-auto pt-4">
        {course.isEnrolled ? (
          <button
            type="button"
            onClick={() => navigate(`/${role}/my-courses/${course.id}`)}
            className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Vào học
          </button>
        ) : Number(course.price || 0) > 0 ? (
          <button
            type="button"
            onClick={() => handleGoToCheckout(course)}
            className="w-full rounded-lg bg-[#A50064] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#8f0058]"
          >
            Mua khoá học
          </button>
        ) : (
          <button
            type="button"
            disabled={enrollingId === course.id}
            onClick={() => handleEnroll(course.id)}
            className="w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {enrollingId === course.id ? "Đang đăng ký..." : "Đăng ký học"}
          </button>
        )}
      </div>
    </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <h1 className="text-2xl font-bold text-slate-100">
          Khám phá khoá học
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Danh sách các khóa học đang mở. Tìm khóa học phù hợp và bắt đầu hành
          trình học tập!
        </p>
      </section>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm khóa học..."
          className="flex-1 rounded-lg border border-[#23263a] bg-[#151925] px-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-600"
        />
        <button
          type="submit"
          className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-xl border border-[#23263a] bg-[#151925] p-8 text-center text-slate-400">
          Đang tải danh sách khóa học...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-red-700/40 bg-red-950/20 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2f3652] bg-[#151925] p-8 text-center text-slate-400">
          Không tìm thấy khóa học nào.
        </div>
      ) : (
        <>
          <section className="space-y-6">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-100">
                Khóa học chưa đăng ký
              </h2>
              {availableCourses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#2f3652] bg-[#151925] p-6 text-sm text-slate-400">
                  Bạn đã đăng ký tất cả khóa học trong danh sách đang hiển thị.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {availableCourses.map((course) =>
                    renderCourseCard(course, { showPrice: true }),
                  )}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-100">
                Khóa học đã đăng ký
              </h2>
              {enrolledCourses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#2f3652] bg-[#151925] p-6 text-sm text-slate-400">
                  Bạn chưa đăng ký khóa học nào.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {enrolledCourses.map((course) =>
                    renderCourseCard(course, { showPrice: false }),
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="rounded-lg border border-[#23263a] bg-[#151925] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[#23263a] disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-sm text-slate-400">
                Trang {page} / {totalPage}
              </span>
              <button
                type="button"
                disabled={page >= totalPage}
                onClick={() => handlePageChange(page + 1)}
                className="rounded-lg border border-[#23263a] bg-[#151925] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[#23263a] disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCatalogPage;
