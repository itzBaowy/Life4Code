import React, { useEffect, useState } from "react";
import { getMyCoursesService } from "../../services/Course/CourseService";

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadMyCourses = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getMyCoursesService();
        const payload = response?.data?.data ?? response?.data?.content;
        setCourses(Array.isArray(payload) ? payload : []);
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
            "Không thể tải danh sách khóa học của bạn. Vui lòng thử lại sau.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMyCourses();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <h1 className="text-2xl font-bold text-slate-100">Khoá học của tôi</h1>
        <p className="mt-1 text-sm text-slate-400">
          Danh sách các khóa học mà bạn đã đăng ký. Hãy tiếp tục học tập và hoàn
          thành chúng để nâng cao kỹ năng lập trình của bạn!
        </p>
      </section>

      {isLoading ? (
        <div className="rounded-xl border border-[#23263a] bg-[#151925] p-8 text-center text-slate-400">
          Dang tai khoa hoc...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-red-700/40 bg-red-950/20 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2f3652] bg-[#151925] p-8 text-center text-slate-400">
          Ban chua dang ky khoa hoc nao.
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((item) => {
            const progress = Number(item?.progress || 0);
            const course = item?.course || {};

            return (
              <article
                key={item.enrollmentId}
                className="rounded-xl border border-[#23263a] bg-[#151925] p-4 shadow-sm"
              >
                <img
                  src={
                    course.thumbnail ||
                    "https://placehold.co/600x340?text=Course"
                  }
                  alt={course.title || "Course"}
                  className="h-36 w-full rounded-lg object-cover"
                />

                <h3 className="mt-3 line-clamp-2 text-base font-semibold text-slate-100">
                  {course.title || "Untitled course"}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  /{course.slug || "no-slug"}
                </p>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Tien do</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#23263a]">
                    <div
                      className="h-2 rounded-full bg-cyan-600 transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, progress))}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default MyCoursesPage;
