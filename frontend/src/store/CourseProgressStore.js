import { create } from 'zustand';

export const useCourseProgressStore = create((set) => ({
    progressByCourseId: {},

    setCourseProgress: (courseId, progress) => {
        if (!courseId) return;

        set((state) => ({
            progressByCourseId: {
                ...state.progressByCourseId,
                [courseId]: Number(progress || 0),
            },
        }));
    },

    syncCourseProgresses: (items) => {
        if (!Array.isArray(items)) return;

        set((state) => {
            const nextMap = { ...state.progressByCourseId };

            items.forEach((item) => {
                const courseId = item?.course?.id;
                if (!courseId) return;
                nextMap[courseId] = Number(item?.progress || 0);
            });

            return { progressByCourseId: nextMap };
        });
    },
}));
