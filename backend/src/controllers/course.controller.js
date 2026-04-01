import { responseSuccess } from '../common/helpers/function.helper.js';
import { courseService } from '../services/course.service.js';

export const courseController = {
    async getCourseLessons(req, res, next) {
        const result = await courseService.getCourseLessons(req);
        const response = responseSuccess(result, 'Get course lessons successfully');
        res.status(response.statusCode).json(response);
    },

    async createLesson(req, res, next) {
        const result = await courseService.createLesson(req);
        const response = responseSuccess(result, 'Create lesson successfully', 201);
        res.status(response.statusCode).json(response);
    },

    async updateLesson(req, res, next) {
        const result = await courseService.updateLesson(req);
        const response = responseSuccess(result, 'Update lesson successfully');
        res.status(response.statusCode).json(response);
    },

    async deleteLesson(req, res, next) {
        const result = await courseService.deleteLesson(req);
        const response = responseSuccess(result, 'Delete lesson successfully');
        res.status(response.statusCode).json(response);
    },

    async getMyCourseDetail(req, res, next) {
        const result = await courseService.getMyCourseDetail(req);
        const response = responseSuccess(result, 'Get my course detail successfully');
        res.status(response.statusCode).json(response);
    },

    async enrollCourse(req, res, next) {
        const result = await courseService.enrollCourse(req);
        const response = responseSuccess(result, 'Enroll course successfully', 201);
        res.status(response.statusCode).json(response);
    },

    async getMyCourses(req, res, next) {
        const result = await courseService.getMyCourses(req.user.id);
        const response = responseSuccess(result, 'Get my courses successfully');
        res.status(response.statusCode).json(response);
    },

    async getCatalog(req, res, next) {
        const result = await courseService.getCatalog(req);
        const response = responseSuccess(result, 'Get course catalog successfully');
        res.status(response.statusCode).json(response);
    },

    async createCourse(req, res, next) {
        const result = await courseService.createCourse(req);
        const response = responseSuccess(result, 'Create course successfully', 201);
        res.status(response.statusCode).json(response);
    },

    async updateCourse(req, res, next) {
        const result = await courseService.updateCourse(req);
        const response = responseSuccess(result, 'Update course successfully');
        res.status(response.statusCode).json(response);
    },

    async deleteCourse(req, res, next) {
        const result = await courseService.deleteCourse(req);
        const response = responseSuccess(result, 'Delete course successfully');
        res.status(response.statusCode).json(response);
    },

    async updateLessonProgress(req, res, next) {
        const result = await courseService.updateLessonProgress(req);
        const response = responseSuccess(result, 'Update lesson progress successfully');
        res.status(response.statusCode).json(response);
    },

    async getCourseLessonProgress(req, res, next) {
        const result = await courseService.getCourseLessonProgress(req);
        const response = responseSuccess(result, 'Get course lesson progress successfully');
        res.status(response.statusCode).json(response);
    },
};
