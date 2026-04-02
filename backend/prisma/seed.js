import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/prisma/connect.prisma.js";

const SALT_ROUNDS = 10;

const rolesSeed = [
  {
    name: "Admin",
    description: "Quản trị hệ thống",
    permission: ["dashboard", "course-management", "user-management"],
  },
  {
    name: "User",
    description: "Học viên",
    permission: ["dashboard", "course-catalog", "my-courses"],
  },
];

const usersSeed = [
  {
    userName: "admin.life4code",
    email: "admin@life4code.dev",
    password: "Admin@123",
    name: "System Admin",
    phoneNumber: "0900000001",
    roleName: "Admin",
  },
  {
    userName: "nguyen.an",
    email: "an.nguyen@life4code.dev",
    password: "User@123",
    name: "Nguyen Van An",
    phoneNumber: "0900000002",
    roleName: "User",
  },
  {
    userName: "tran.binh",
    email: "binh.tran@life4code.dev",
    password: "User@123",
    name: "Tran Thi Binh",
    phoneNumber: "0900000003",
    roleName: "User",
  },
  {
    userName: "le.chi",
    email: "chi.le@life4code.dev",
    password: "User@123",
    name: "Le Minh Chi",
    phoneNumber: "0900000004",
    roleName: "User",
  },
];

const coursesSeed = [
  {
    title: "JavaScript Fundamentals 2026",
    slug: "javascript-fundamentals-2026",
    description: "Nắm vững JavaScript từ biến, hàm, object đến async/await.",
    thumbnail: "https://placehold.co/800x450?text=JavaScript+Fundamentals",
    isPublished: true,
    price: 0,
    originalPrice: null,
    sections: [
      {
        title: "Làm quen JavaScript",
        order: 1,
        lessons: [
          {
            title: "Giới thiệu JavaScript",
            slug: "js-fund-2026-intro",
            type: "TEXT",
            content: "<h2>Giới thiệu</h2><p>JavaScript là ngôn ngữ lập trình phổ biến trên web.</p>",
            duration: 300,
            order: 1,
            isPublished: true,
          },
          {
            title: "Biến và kiểu dữ liệu",
            slug: "js-fund-2026-variables",
            type: "VIDEO",
            videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
            duration: 420,
            order: 2,
            isPublished: true,
          },
        ],
      },
      {
        title: "Điều khiển luồng",
        order: 2,
        lessons: [
          {
            title: "If else và switch",
            slug: "js-fund-2026-if-switch",
            type: "TEXT",
            content: "<p>Học cách dùng if/else và switch trong JS.</p>",
            duration: 360,
            order: 1,
            isPublished: true,
          },
          {
            title: "Loop trong JavaScript",
            slug: "js-fund-2026-loop",
            type: "VIDEO",
            videoUrl: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
            duration: 480,
            order: 2,
            isPublished: true,
          },
        ],
      },
    ],
  },
  {
    title: "React Bootcamp 2026",
    slug: "react-bootcamp-2026",
    description: "Xây app React thực tế với Router, State Management và API.",
    thumbnail: "https://placehold.co/800x450?text=React+Bootcamp",
    isPublished: true,
    price: 799000,
    originalPrice: 1299000,
    sections: [
      {
        title: "React Cơ bản",
        order: 1,
        lessons: [
          {
            title: "React là gì",
            slug: "react-bootcamp-2026-what-is-react",
            type: "TEXT",
            content: "<p>React là thư viện UI do Meta phát triển.</p>",
            duration: 300,
            order: 1,
            isPublished: true,
          },
          {
            title: "JSX và Component",
            slug: "react-bootcamp-2026-jsx-component",
            type: "VIDEO",
            videoUrl: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
            duration: 540,
            order: 2,
            isPublished: true,
          },
        ],
      },
      {
        title: "State và Side Effects",
        order: 2,
        lessons: [
          {
            title: "useState thực chiến",
            slug: "react-bootcamp-2026-usestate",
            type: "TEXT",
            content: "<p>Quản lý state cục bộ bằng useState.</p>",
            duration: 480,
            order: 1,
            isPublished: true,
          },
          {
            title: "useEffect và gọi API",
            slug: "react-bootcamp-2026-useeffect-api",
            type: "VIDEO",
            videoUrl: "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
            duration: 660,
            order: 2,
            isPublished: true,
          },
        ],
      },
    ],
  },
  {
    title: "Node.js API Mastery",
    slug: "nodejs-api-mastery-2026",
    description: "Thiết kế REST API với Express, Prisma, bảo mật và deploy.",
    thumbnail: "https://placehold.co/800x450?text=Node.js+API+Mastery",
    isPublished: true,
    price: 999000,
    originalPrice: 1499000,
    sections: [
      {
        title: "Kiến trúc Backend",
        order: 1,
        lessons: [
          {
            title: "RESTful API Design",
            slug: "node-api-2026-restful-design",
            type: "TEXT",
            content: "<p>Nguyên tắc thiết kế API rõ ràng, dễ mở rộng.</p>",
            duration: 420,
            order: 1,
            isPublished: true,
          },
          {
            title: "Express Middleware",
            slug: "node-api-2026-express-middleware",
            type: "VIDEO",
            videoUrl: "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
            duration: 720,
            order: 2,
            isPublished: true,
          },
        ],
      },
      {
        title: "Auth và Authorization",
        order: 2,
        lessons: [
          {
            title: "JWT Authentication",
            slug: "node-api-2026-jwt-auth",
            type: "TEXT",
            content: "<p>Xác thực bằng JWT access và refresh token.</p>",
            duration: 540,
            order: 1,
            isPublished: true,
          },
          {
            title: "Role Based Access Control",
            slug: "node-api-2026-rbac",
            type: "VIDEO",
            videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5mb.mp4",
            duration: 600,
            order: 2,
            isPublished: true,
          },
        ],
      },
    ],
  },
];

const enrollmentSeedByEmailAndSlug = [
  { email: "an.nguyen@life4code.dev", courseSlug: "javascript-fundamentals-2026", progress: 50 },
  { email: "an.nguyen@life4code.dev", courseSlug: "react-bootcamp-2026", progress: 25 },
  { email: "binh.tran@life4code.dev", courseSlug: "javascript-fundamentals-2026", progress: 75 },
  { email: "chi.le@life4code.dev", courseSlug: "nodejs-api-mastery-2026", progress: 20 },
];

const lessonProgressSeedByEmailAndSlug = [
  { email: "an.nguyen@life4code.dev", lessonSlug: "js-fund-2026-intro", isCompleted: true },
  { email: "an.nguyen@life4code.dev", lessonSlug: "js-fund-2026-variables", isCompleted: true },
  { email: "an.nguyen@life4code.dev", lessonSlug: "react-bootcamp-2026-what-is-react", isCompleted: true },
  { email: "binh.tran@life4code.dev", lessonSlug: "js-fund-2026-intro", isCompleted: true },
  { email: "binh.tran@life4code.dev", lessonSlug: "js-fund-2026-variables", isCompleted: true },
  { email: "binh.tran@life4code.dev", lessonSlug: "js-fund-2026-if-switch", isCompleted: true },
  { email: "chi.le@life4code.dev", lessonSlug: "node-api-2026-restful-design", isCompleted: true },
];

const hashPassword = (password) => bcrypt.hashSync(password, SALT_ROUNDS);

async function seedRoles() {
  const roleMap = new Map();

  for (const role of rolesSeed) {
    const upserted = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        permission: role.permission,
      },
      create: role,
    });

    roleMap.set(role.name, upserted);
  }

  return roleMap;
}

async function seedUsers(roleMap) {
  const userMap = new Map();

  for (const user of usersSeed) {
    const role = roleMap.get(user.roleName);
    if (!role) {
      throw new Error(`Role ${user.roleName} not found`);
    }

    const hashedPassword = hashPassword(user.password);

    const upserted = await prisma.users.upsert({
      where: { email: user.email },
      update: {
        userName: user.userName,
        password: hashedPassword,
        name: user.name,
        phoneNumber: user.phoneNumber,
        roleId: role.id,
      },
      create: {
        userName: user.userName,
        email: user.email,
        password: hashedPassword,
        name: user.name,
        phoneNumber: user.phoneNumber,
        roleId: role.id,
      },
    });

    userMap.set(user.email, upserted);
  }

  return userMap;
}

async function seedCoursesSectionsLessons() {
  const courseMap = new Map();
  const lessonMap = new Map();

  for (const courseSeed of coursesSeed) {
    const { sections, ...courseData } = courseSeed;

    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        isPublished: courseData.isPublished,
        price: courseData.price,
        originalPrice: courseData.originalPrice,
      },
      create: courseData,
    });

    await prisma.section.deleteMany({ where: { courseId: course.id } });

    for (const sectionSeed of sections) {
      const { lessons, ...sectionData } = sectionSeed;

      const section = await prisma.section.create({
        data: {
          ...sectionData,
          courseId: course.id,
        },
      });

      for (const lessonSeed of lessons) {
        const lesson = await prisma.lesson.create({
          data: {
            ...lessonSeed,
            sectionId: section.id,
          },
        });

        lessonMap.set(lesson.slug, lesson);
      }
    }

    courseMap.set(course.slug, course);
  }

  return { courseMap, lessonMap };
}

async function seedEnrollments(userMap, courseMap) {
  for (const item of enrollmentSeedByEmailAndSlug) {
    const user = userMap.get(item.email);
    const course = courseMap.get(item.courseSlug);

    if (!user || !course) continue;

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      update: {
        progress: item.progress,
      },
      create: {
        userId: user.id,
        courseId: course.id,
        progress: item.progress,
      },
    });
  }
}

async function seedLessonProgress(userMap, lessonMap) {
  for (const item of lessonProgressSeedByEmailAndSlug) {
    const user = userMap.get(item.email);
    const lesson = lessonMap.get(item.lessonSlug);

    if (!user || !lesson) continue;

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lesson.id,
        },
      },
      update: {
        isCompleted: item.isCompleted,
      },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        isCompleted: item.isCompleted,
      },
    });
  }
}

async function recalculateEnrollmentProgress(userMap, courseMap) {
  for (const item of enrollmentSeedByEmailAndSlug) {
    const user = userMap.get(item.email);
    const course = courseMap.get(item.courseSlug);

    if (!user || !course) continue;

    const lessons = await prisma.lesson.findMany({
      where: {
        section: {
          courseId: course.id,
        },
      },
      select: { id: true },
    });

    const lessonIds = lessons.map((l) => l.id);
    if (!lessonIds.length) continue;

    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        lessonId: { in: lessonIds },
        isCompleted: true,
      },
    });

    const progress = Math.round((completedCount / lessonIds.length) * 100);

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      data: { progress },
    });
  }
}

async function main() {
  console.log("Start seeding Life4Code data...");

  const roleMap = await seedRoles();
  const userMap = await seedUsers(roleMap);
  const { courseMap, lessonMap } = await seedCoursesSectionsLessons();

  await seedEnrollments(userMap, courseMap);
  await seedLessonProgress(userMap, lessonMap);
  await recalculateEnrollmentProgress(userMap, courseMap);

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
