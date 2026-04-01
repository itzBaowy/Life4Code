import React from "react";
import {
  learningProgress,
  recentNotifications,
  upcomingDeadlines,
  userOverviewStats,
} from "./Dashboard/mockData";

const toneMap = {
  blue: "border-cyan-700/40 bg-[#151925] text-cyan-300",
  emerald: "border-emerald-700/40 bg-[#151925] text-emerald-300",
  amber: "border-amber-700/40 bg-[#151925] text-amber-300",
  violet: "border-violet-700/40 bg-[#151925] text-violet-300",
};

const priorityMap = {
  Cao: "bg-red-900/40 text-red-300",
  "Trung binh": "bg-amber-900/40 text-amber-300",
  Thap: "bg-slate-700/40 text-slate-200",
};

const UserPage = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-linear-to-r from-cyan-600 to-blue-700 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Tổng Quan Người Dùng</h1>
        <p className="mt-2 text-blue-100">
          Theo dõi tiến độ học tập, deadline và thông báo mới nhất.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {userOverviewStats.map((item) => (
          <article
            key={item.id}
            className={`rounded-xl border p-4 shadow-sm ${toneMap[item.tone]}`}
          >
            <p className="text-sm font-medium opacity-90">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
            <p className="mt-2 text-xs">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-xl border border-[#23263a] bg-[#151925] p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Tiến độ khóa học
          </h2>
          <div className="mt-4 space-y-4">
            {learningProgress.map((course) => (
              <div key={course.id}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-slate-200">{course.name}</p>
                  <p className="text-sm text-slate-400">{course.progress}%</p>
                </div>
                <div className="h-2 rounded-full bg-[#23263a]">
                  <div
                    className="h-2 rounded-full bg-cyan-600 transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Bài tiếp theo: {course.nextLesson}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[#23263a] bg-[#151925] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-100">
            Thông báo gần đây
          </h2>
          <ul className="mt-4 space-y-3">
            {recentNotifications.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-[#23263a] bg-[#0f1320] p-3"
              >
                <p className="text-sm text-slate-200">{item.content}</p>
                <p className="mt-1 text-xs text-slate-400">{item.time}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">
          Deadline sắp tới
        </h2>
        <div className="mt-4 space-y-3">
          {upcomingDeadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#23263a] bg-[#0f1320] p-3"
            >
              <div>
                <p className="font-medium text-slate-200">{deadline.title}</p>
                <p className="text-sm text-slate-400">{deadline.course}</p>
              </div>
              <div className="text-right">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${priorityMap[deadline.priority]}`}
                >
                  {deadline.priority}
                </span>
                <p className="mt-1 text-xs text-slate-400">{deadline.due}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserPage;
