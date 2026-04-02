import prisma from '../prisma/connect.prisma.js';
import { buildQueryPrisma } from '../common/helpers/build_query_prisma.js';
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '../common/helpers/exception.helper.js';

const isObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ''));

const isAdmin = (user) => String(user?.role?.name || '').toLowerCase() === 'admin';

const normalizeSlug = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

export const courseService = {
    async getMyCourseDetail(req) {
        const userId = req.user.id;
        const { courseId } = req.params;

        if (!isObjectId(userId)) {
            throw new BadRequestException('userId không hợp lệ');
        }

        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            select: {
                id: true,
                progress: true,
                updatedAt: true,
            },
        });

        if (!enrollment) {
            throw new ForbiddenException('Bạn chưa đăng ký khóa học này');
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                thumbnail: true,
                sections: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        lessons: {
                            where: { isPublished: true },
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                type: true,
                                content: true,
                                videoUrl: true,
                                duration: true,
                                order: true,
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!course) {
            throw new NotFoundException('Không tìm thấy khóa học');
        }

        return {
            enrollmentId: enrollment.id,
            progress: enrollment.progress,
            updatedAt: enrollment.updatedAt,
            course,
        };
    },

    async enrollCourse(req) {
        const userId = req.user.id;
        const { courseId } = req.params;

        if (!isObjectId(userId)) {
            throw new BadRequestException('userId không hợp lệ');
        }

        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                slug: true,
                isPublished: true,
            },
        });

        if (!course) {
            throw new NotFoundException('Không tìm thấy khóa học');
        }

        if (!course.isPublished && !isAdmin(req.user)) {
            throw new ForbiddenException('Khóa học này chưa được mở đăng ký');
        }

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (existingEnrollment) {
            throw new BadRequestException('Bạn đã tham gia khóa học này rồi');
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId,
                courseId,
                progress: 0,
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                        slug: true,
                    },
                },
            },
        });

        return {
            enrollmentId: enrollment.id,
            progress: enrollment.progress,
            updatedAt: enrollment.updatedAt,
            course: enrollment.course,
        };
    },

    async getMyCourses(userId) {
        if (!isObjectId(userId)) {
            throw new BadRequestException('userId không hợp lệ');
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            select: {
                id: true,
                progress: true,
                updatedAt: true,
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                        slug: true,
                        description: true,
                        _count: {
                            select: {
                                sections: true,
                                enrollments: true,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Flatten output để payload nhẹ và FE dễ dùng.
        return enrollments.map((item) => ({
            enrollmentId: item.id,
            progress: item.progress,
            updatedAt: item.updatedAt,
            course: item.course,
        }));
    },

    async getCatalog(req) {
        const { page, pageSize, where, index } = buildQueryPrisma(req.query);

        if (req.query.keyword) {
            const keyword = String(req.query.keyword).trim();
            if (keyword) {
                where.OR = [
                    { title: { contains: keyword, mode: 'insensitive' } },
                    { slug: { contains: keyword, mode: 'insensitive' } },
                    { description: { contains: keyword, mode: 'insensitive' } },
                ];
            }
        }

        if (req.query.isPublished !== undefined) {
            where.isPublished = String(req.query.isPublished) === 'true';
        }

        const itemsPromise = prisma.course.findMany({
            where,
            skip: index,
            take: pageSize,
            select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                description: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        sections: true,
                        enrollments: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const totalItemPromise = prisma.course.count({ where });

        const [items, totalItem] = await Promise.all([itemsPromise, totalItemPromise]);

        // Đánh dấu khóa học nào user đã enroll
        const userId = req.user?.id;
        let enrolledCourseIds = new Set();
        if (userId) {
            const enrollments = await prisma.enrollment.findMany({
                where: { userId },
                select: { courseId: true },
            });
            enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
        }

        const itemsWithEnrollment = items.map((item) => ({
            ...item,
            isEnrolled: enrolledCourseIds.has(item.id),
        }));

        return {
            page,
            pageSize,
            totalItem,
            totalPage: Math.ceil(totalItem / pageSize),
            items: itemsWithEnrollment,
        };
    },

    async createCourse(req) {
        const { title, slug, description, thumbnail, isPublished } = req.body;
        if (!title || !String(title).trim()) {
            throw new BadRequestException('title không được để trống');
        }

        const nextSlug = normalizeSlug(slug || title);
        if (!nextSlug) {
            throw new BadRequestException('slug không hợp lệ');
        }

        const duplicated = await prisma.course.findUnique({
            where: { slug: nextSlug },
        });
        if (duplicated) {
            throw new BadRequestException('slug đã tồn tại');
        }

        return prisma.course.create({
            data: {
                title: String(title).trim(),
                slug: nextSlug,
                description: description ? String(description).trim() : null,
                thumbnail: thumbnail ? String(thumbnail).trim() : null,
                isPublished: Boolean(isPublished),
            },
        });
    },

    async updateCourse(req) {
        const { courseId } = req.params;
        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        const existing = await prisma.course.findUnique({ where: { id: courseId } });
        if (!existing) {
            throw new NotFoundException('Không tìm thấy khóa học');
        }

        const { title, slug, description, thumbnail, isPublished } = req.body;
        const data = {};

        if (title !== undefined) data.title = String(title).trim();
        if (description !== undefined) data.description = description ? String(description).trim() : null;
        if (thumbnail !== undefined) data.thumbnail = thumbnail ? String(thumbnail).trim() : null;
        if (isPublished !== undefined) data.isPublished = Boolean(isPublished);

        if (slug !== undefined || title !== undefined) {
            const nextSlug = normalizeSlug(slug || title || existing.slug);
            if (!nextSlug) {
                throw new BadRequestException('slug không hợp lệ');
            }

            const duplicated = await prisma.course.findFirst({
                where: {
                    slug: nextSlug,
                    NOT: { id: courseId },
                },
            });
            if (duplicated) {
                throw new BadRequestException('slug đã tồn tại');
            }

            data.slug = nextSlug;
        }

        return prisma.course.update({
            where: { id: courseId },
            data,
        });
    },

    async deleteCourse(req) {
        const { courseId } = req.params;
        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        const existing = await prisma.course.findUnique({ where: { id: courseId } });
        if (!existing) {
            throw new NotFoundException('Không tìm thấy khóa học');
        }

        await prisma.course.delete({ where: { id: courseId } });
        return { courseId };
    },

    async getCourseLessons(req) {
        const { courseId } = req.params;
        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                title: true,
                sections: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        lessons: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                type: true,
                                content: true,
                                videoUrl: true,
                                duration: true,
                                order: true,
                                isPublished: true,
                                createdAt: true,
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!course) {
            throw new NotFoundException('Không tìm thấy khóa học');
        }

        return course;
    },

    async getCourseSections(req) {
        const { courseId } = req.params;
        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        const sections = await prisma.section.findMany({
            where: { courseId },
            select: {
                id: true,
                title: true,
                order: true,
                _count: {
                    select: {
                        lessons: true,
                    },
                },
            },
            orderBy: { order: 'asc' },
        });

        return sections;
    },

    async createSection(req) {
        const { courseId } = req.params;
        const { title, order } = req.body;

        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        if (!title || !String(title).trim()) {
            throw new BadRequestException('title không được để trống');
        }

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            throw new NotFoundException('Không tìm thấy khóa học');
        }

        const sectionOrder =
            order !== undefined && order !== null
                ? Number(order)
                : Number(
                    ((
                        await prisma.section.findFirst({
                            where: { courseId },
                            orderBy: { order: 'desc' },
                            select: { order: true },
                        })
                    )?.order || 0) + 1,
                );

        if (!Number.isInteger(sectionOrder) || sectionOrder <= 0) {
            throw new BadRequestException('order phải là số nguyên dương');
        }

        return prisma.section.create({
            data: {
                courseId,
                title: String(title).trim(),
                order: sectionOrder,
            },
        });
    },

    async updateSection(req) {
        const { courseId, sectionId } = req.params;
        const { title, order } = req.body;

        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        if (!isObjectId(sectionId)) {
            throw new BadRequestException('sectionId không hợp lệ');
        }

        const section = await prisma.section.findUnique({ where: { id: sectionId } });
        if (!section || section.courseId !== courseId) {
            throw new NotFoundException('Không tìm thấy section trong khóa học này');
        }

        const data = {};
        if (title !== undefined) {
            if (!String(title).trim()) {
                throw new BadRequestException('title không được để trống');
            }
            data.title = String(title).trim();
        }

        if (order !== undefined) {
            const sectionOrder = Number(order);
            if (!Number.isInteger(sectionOrder) || sectionOrder <= 0) {
                throw new BadRequestException('order phải là số nguyên dương');
            }
            data.order = sectionOrder;
        }

        return prisma.section.update({
            where: { id: sectionId },
            data,
        });
    },

    async deleteSection(req) {
        const { courseId, sectionId } = req.params;

        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        if (!isObjectId(sectionId)) {
            throw new BadRequestException('sectionId không hợp lệ');
        }

        const section = await prisma.section.findUnique({ where: { id: sectionId } });
        if (!section || section.courseId !== courseId) {
            throw new NotFoundException('Không tìm thấy section trong khóa học này');
        }

        await prisma.section.delete({ where: { id: sectionId } });
        return { sectionId };
    },

    async createLesson(req) {
        const { courseId } = req.params;
        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        const { sectionId, title, slug, type, content, videoUrl, duration, order, isPublished } = req.body;

        if (!title || !String(title).trim()) {
            throw new BadRequestException('title không được để trống');
        }

        if (!isObjectId(sectionId)) {
            throw new BadRequestException('sectionId không hợp lệ');
        }

        const lessonType = String(type || 'TEXT').toUpperCase();
        if (!['TEXT', 'VIDEO'].includes(lessonType)) {
            throw new BadRequestException('type chỉ nhận TEXT hoặc VIDEO');
        }

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            throw new NotFoundException('Không tìm thấy khóa học');
        }

        const section = await prisma.section.findUnique({ where: { id: sectionId } });
        if (!section || section.courseId !== courseId) {
            throw new NotFoundException('Không tìm thấy section trong khóa học này');
        }

        const nextSlug = normalizeSlug(slug || title);
        if (!nextSlug) {
            throw new BadRequestException('slug không hợp lệ');
        }

        const duplicated = await prisma.lesson.findUnique({ where: { slug: nextSlug } });
        if (duplicated) {
            throw new BadRequestException('slug bài học đã tồn tại');
        }

        const currentMaxOrderLesson = await prisma.lesson.findFirst({
            where: { sectionId: section.id },
            orderBy: { order: 'desc' },
            select: { order: true },
        });

        return prisma.lesson.create({
            data: {
                title: String(title).trim(),
                slug: nextSlug,
                type: lessonType,
                content: lessonType === 'TEXT' ? String(content || '') : null,
                videoUrl: lessonType === 'VIDEO' ? String(videoUrl || '') : null,
                duration: duration !== undefined ? Number(duration) : null,
                order:
                    order !== undefined
                        ? Number(order)
                        : Number((currentMaxOrderLesson?.order || 0) + 1),
                isPublished: Boolean(isPublished),
                sectionId: section.id,
            },
            include: {
                section: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                    },
                },
            },
        });
    },

    async updateLesson(req) {
        const { courseId, lessonId } = req.params;

        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        if (!isObjectId(lessonId)) {
            throw new BadRequestException('lessonId không hợp lệ');
        }

        const existingLesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                section: {
                    select: {
                        courseId: true,
                    },
                },
            },
        });

        if (!existingLesson || existingLesson.section.courseId !== courseId) {
            throw new NotFoundException('Không tìm thấy bài học trong khóa học này');
        }

        const { sectionId, title, slug, type, content, videoUrl, duration, order, isPublished } = req.body;
        const data = {};

        if (title !== undefined) data.title = String(title).trim();
        if (duration !== undefined) data.duration = duration === null ? null : Number(duration);
        if (order !== undefined) data.order = Number(order);
        if (isPublished !== undefined) data.isPublished = Boolean(isPublished);

        const nextType = type !== undefined ? String(type).toUpperCase() : existingLesson.type;
        if (!['TEXT', 'VIDEO'].includes(nextType)) {
            throw new BadRequestException('type chỉ nhận TEXT hoặc VIDEO');
        }

        data.type = nextType;
        if (nextType === 'TEXT') {
            if (content !== undefined) data.content = String(content || '');
            if (videoUrl !== undefined) data.videoUrl = null;
        }
        if (nextType === 'VIDEO') {
            if (videoUrl !== undefined) data.videoUrl = String(videoUrl || '');
            if (content !== undefined) data.content = null;
        }

        if (slug !== undefined || title !== undefined) {
            const nextSlug = normalizeSlug(slug || title || existingLesson.slug);
            if (!nextSlug) {
                throw new BadRequestException('slug không hợp lệ');
            }

            const duplicated = await prisma.lesson.findFirst({
                where: {
                    slug: nextSlug,
                    NOT: { id: lessonId },
                },
            });
            if (duplicated) {
                throw new BadRequestException('slug bài học đã tồn tại');
            }

            data.slug = nextSlug;
        }

        if (sectionId !== undefined) {
            if (!isObjectId(sectionId)) {
                throw new BadRequestException('sectionId không hợp lệ');
            }

            const section = await prisma.section.findUnique({ where: { id: sectionId } });
            if (!section || section.courseId !== courseId) {
                throw new NotFoundException('Không tìm thấy section trong khóa học này');
            }

            data.sectionId = sectionId;
        }

        return prisma.lesson.update({
            where: { id: lessonId },
            data,
            include: {
                section: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                    },
                },
            },
        });
    },

    async deleteLesson(req) {
        const { courseId, lessonId } = req.params;

        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        if (!isObjectId(lessonId)) {
            throw new BadRequestException('lessonId không hợp lệ');
        }

        const existingLesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                section: {
                    select: {
                        courseId: true,
                    },
                },
            },
        });

        if (!existingLesson || existingLesson.section.courseId !== courseId) {
            throw new NotFoundException('Không tìm thấy bài học trong khóa học này');
        }

        await prisma.lesson.delete({ where: { id: lessonId } });
        return { lessonId };
    },

    async updateLessonProgress(req) {
        const userId = req.user.id;
        const { lessonId } = req.params;
        const { isCompleted } = req.body;

        if (!isObjectId(lessonId)) {
            throw new BadRequestException('lessonId không hợp lệ');
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                section: {
                    select: {
                        courseId: true,
                    },
                },
            },
        });

        if (!lesson) {
            throw new NotFoundException('Không tìm thấy bài học');
        }

        const completedValue = isCompleted === undefined ? true : Boolean(isCompleted);

        const lessonProgress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
            create: {
                userId,
                lessonId,
                isCompleted: completedValue,
            },
            update: {
                isCompleted: completedValue,
            },
        });

        const courseId = lesson.section.courseId;

        const totalLessons = await prisma.lesson.count({
            where: {
                section: {
                    courseId,
                },
                isPublished: true,
            },
        });

        const completedLessons = await prisma.lessonProgress.count({
            where: {
                userId,
                isCompleted: true,
                lesson: {
                    section: {
                        courseId,
                    },
                },
            },
        });

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        const enrollment = await prisma.enrollment.upsert({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            create: {
                userId,
                courseId,
                progress,
            },
            update: {
                progress,
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                        slug: true,
                    },
                },
            },
        });

        return {
            lessonProgress,
            enrollment: {
                enrollmentId: enrollment.id,
                progress: enrollment.progress,
                course: enrollment.course,
                completedLessons,
                totalLessons,
            },
        };
    },

    async getCourseLessonProgress(req) {
        const userId = req.user.id;
        const { courseId } = req.params;

        if (!isObjectId(courseId)) {
            throw new BadRequestException('courseId không hợp lệ');
        }

        const lessonProgress = await prisma.lessonProgress.findMany({
            where: {
                userId,
                lesson: {
                    section: {
                        courseId,
                    },
                },
            },
            select: {
                lessonId: true,
                isCompleted: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        return lessonProgress;
    },
};
