import express from 'express';
import { protect } from '../common/middlewares/protect.middleware.js';
import { courseController } from '../controllers/course.controller.js';

const courseRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Course
 *   description: API quản lý khóa học và tiến độ học
 */

/**
 * @swagger
 * /api/course/catalog/{courseId}/enroll:
 *   post:
 *     summary: User đăng ký tham gia khóa học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khóa học
 *     responses:
 *       201:
 *         description: Đăng ký khóa học thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc đã enroll
 *       403:
 *         description: Khóa học chưa được publish
 *       404:
 *         description: Không tìm thấy khóa học
 */
courseRouter.post('/catalog/:courseId/enroll', protect, courseController.enrollCourse);

/**
 * @swagger
 * /api/course/catalog:
 *   get:
 *     summary: Lấy danh sách Course catalog
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách khóa học thành công
 */
courseRouter.get('/catalog', protect, courseController.getCatalog);

/**
 * @swagger
 * /api/course/catalog:
 *   post:
 *     summary: Tạo khóa học mới (Admin)
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Frontend React
 *               slug:
 *                 type: string
 *                 example: frontend-react
 *               description:
 *                 type: string
 *                 example: Hoc React tu co ban den nang cao
 *               thumbnail:
 *                 type: string
 *                 example: https://placehold.co/600x340?text=React
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo khóa học thành công
 *       403:
 *         description: Không có quyền admin
 */
courseRouter.post('/catalog', protect, courseController.createCourse);

/**
 * @swagger
 * /api/course/catalog/{courseId}:
 *   patch:
 *     summary: Cập nhật khóa học (Admin)
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khóa học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật khóa học thành công
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy khóa học
 */
courseRouter.patch('/catalog/:courseId', protect, courseController.updateCourse);

/**
 * @swagger
 * /api/course/catalog/{courseId}:
 *   delete:
 *     summary: Xóa khóa học (Admin)
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khóa học
 *     responses:
 *       200:
 *         description: Xóa khóa học thành công
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy khóa học
 */
courseRouter.delete('/catalog/:courseId', protect, courseController.deleteCourse);

courseRouter.get('/catalog/:courseId/lessons', protect, courseController.getCourseLessons);
courseRouter.post('/catalog/:courseId/lessons', protect, courseController.createLesson);
courseRouter.patch('/catalog/:courseId/lessons/:lessonId', protect, courseController.updateLesson);
courseRouter.delete('/catalog/:courseId/lessons/:lessonId', protect, courseController.deleteLesson);

/**
 * @swagger
 * /api/course/my-courses:
 *   get:
 *     summary: Lấy danh sách khóa học user đang học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách khóa học của user thành công
 */
courseRouter.get('/my-courses', protect, courseController.getMyCourses);

/**
 * @swagger
 * /api/course/my-courses/{courseId}:
 *   get:
 *     summary: Lấy chi tiết khóa học user đang học (sections và lessons)
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khóa học
 *     responses:
 *       200:
 *         description: Lấy chi tiết khóa học thành công
 *       403:
 *         description: User chưa enroll khóa học
 *       404:
 *         description: Không tìm thấy khóa học
 */
courseRouter.get('/my-courses/:courseId', protect, courseController.getMyCourseDetail);

/**
 * @swagger
 * /api/course/lessons/{lessonId}/progress:
 *   patch:
 *     summary: Cập nhật tiến độ hoàn thành của một bài học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isCompleted:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Cập nhật lesson progress thành công
 *       404:
 *         description: Không tìm thấy lesson
 */
courseRouter.patch('/lessons/:lessonId/progress', protect, courseController.updateLessonProgress);

/**
 * @swagger
 * /api/course/my-courses/{courseId}/lesson-progress:
 *   get:
 *     summary: Lấy tiến độ các bài học của user trong một khóa học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khóa học
 *     responses:
 *       200:
 *         description: Lấy danh sách lesson progress thành công
 */
courseRouter.get('/my-courses/:courseId/lesson-progress', protect, courseController.getCourseLessonProgress);

export default courseRouter;
