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

export const getCourseLessonsService = (courseId) =>
    api.get(`/api/course/catalog/${courseId}/lessons`);

export const getCourseSectionsService = (courseId) =>
    api.get(`/api/course/catalog/${courseId}/sections`);

export const createSectionService = (courseId, payload) =>
    api.post(`/api/course/catalog/${courseId}/sections`, payload);

export const updateSectionService = (courseId, sectionId, payload) =>
    api.patch(`/api/course/catalog/${courseId}/sections/${sectionId}`, payload);

export const deleteSectionService = (courseId, sectionId) =>
    api.delete(`/api/course/catalog/${courseId}/sections/${sectionId}`);

export const createLessonService = (courseId, payload) =>
    api.post(`/api/course/catalog/${courseId}/lessons`, payload);

export const updateLessonService = (courseId, lessonId, payload) =>
    api.patch(`/api/course/catalog/${courseId}/lessons/${lessonId}`, payload);

export const deleteLessonService = (courseId, lessonId) =>
    api.delete(`/api/course/catalog/${courseId}/lessons/${lessonId}`);
