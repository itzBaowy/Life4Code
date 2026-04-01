import prisma from '../prisma/connect.prisma.js';
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '../common/helpers/exception.helper.js';

const isObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ''));

const isAdmin = (user) => String(user?.role?.name || '').toLowerCase() === 'admin';

const ensureAdmin = (user) => {
    if (!isAdmin(user)) {
        throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
};

const normalizeSlug = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

export const courseService = {
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

    async getCatalog() {
        return prisma.course.findMany({
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
    },

    async createCourse(req) {
        ensureAdmin(req.user);

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
        ensureAdmin(req.user);

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
        ensureAdmin(req.user);

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
