import api from '../../configs/axiosConfig';

export const getCourseCatalogService = () => api.get('/api/course/catalog');

export const getMyCoursesService = () => api.get('/api/course/my-courses');

export const getMyCourseDetailService = (courseId) =>
    api.get(`/api/course/my-courses/${courseId}`);

export const getCourseLessonProgressService = (courseId) =>
    api.get(`/api/course/my-courses/${courseId}/lesson-progress`);

export const updateLessonProgressService = (lessonId, payload) =>
    api.patch(`/api/course/lessons/${lessonId}/progress`, payload);

export const createCourseService = (payload) =>
    api.post('/api/course/catalog', payload);

export const updateCourseService = (courseId, payload) =>
    api.patch(`/api/course/catalog/${courseId}`, payload);

export const deleteCourseService = (courseId) =>
    api.delete(`/api/course/catalog/${courseId}`);
