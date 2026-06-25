/* eslint-disable no-console */
import { PrismaClient, type LessonType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// NOTE: This sample data is for testing only. Replace it with your own content
// from the Admin dashboard (or by editing this file and re-seeding).

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

async function main() {
  console.log("🌱 Seeding database…");

  // Clean (order matters due to FKs; cascades handle children).
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.note.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.order.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.user.deleteMany();

  // ---- Users ----
  const adminPass = await bcrypt.hash("admin1234", 12);
  const studentPass = await bcrypt.hash("student1234", 12);

  const admin = await prisma.user.create({
    data: { name: "Platform Admin", email: "admin@edu.test", passwordHash: adminPass, role: "ADMIN", locale: "EN" },
  });
  const student = await prisma.user.create({
    data: { name: "Sara Ahmed", email: "student@edu.test", passwordHash: studentPass, role: "STUDENT", locale: "AR" },
  });
  await prisma.user.create({
    data: { name: "Omar Khaled", email: "omar@edu.test", passwordHash: studentPass, role: "STUDENT", locale: "EN" },
  });

  // ---- Categories ----
  const catData = [
    { slug: "development", nameEn: "Development", nameAr: "البرمجة", icon: "Code", descEn: "Programming & software", descAr: "البرمجة والبرمجيات" },
    { slug: "design", nameEn: "Design", nameAr: "التصميم", icon: "Palette", descEn: "UX, UI & graphics", descAr: "تجربة وواجهة المستخدم والجرافيك" },
    { slug: "business", nameEn: "Business", nameAr: "الأعمال", icon: "Briefcase", descEn: "Management & strategy", descAr: "الإدارة والاستراتيجية" },
    { slug: "marketing", nameEn: "Marketing", nameAr: "التسويق", icon: "Megaphone", descEn: "Digital marketing", descAr: "التسويق الرقمي" },
    { slug: "languages", nameEn: "Languages", nameAr: "اللغات", icon: "Languages", descEn: "Learn new languages", descAr: "تعلّم لغات جديدة" },
    { slug: "data", nameEn: "Data Science", nameAr: "علم البيانات", icon: "BarChart3", descEn: "Data & analytics", descAr: "البيانات والتحليلات" },
  ];
  const categories = await Promise.all(
    catData.map((c, i) => prisma.category.create({ data: { ...c, order: i } }))
  );
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // ---- Helper to build a course ----
  type LessonSpec = { en: string; ar: string; type: LessonType; url?: string; bodyEn?: string; bodyAr?: string; preview?: boolean; min?: number };
  type ModuleSpec = { en: string; ar: string; lessons: LessonSpec[] };

  async function buildCourse(spec: {
    slug: string; titleEn: string; titleAr: string;
    shortEn: string; shortAr: string; descEn: string; descAr: string;
    catSlug: string; level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    isFree: boolean; price?: number; instructor: string; featured?: boolean;
    thumbnail: string; objectives: { en: string; ar: string }[]; requirements: { en: string; ar: string }[];
    modules: ModuleSpec[]; withQuiz?: boolean;
  }) {
    const duration = spec.modules.flatMap((m) => m.lessons).reduce((s, l) => s + (l.min ?? 8), 0);
    const course = await prisma.course.create({
      data: {
        slug: spec.slug,
        titleEn: spec.titleEn, titleAr: spec.titleAr,
        shortDescEn: spec.shortEn, shortDescAr: spec.shortAr,
        descriptionEn: spec.descEn, descriptionAr: spec.descAr,
        thumbnailUrl: spec.thumbnail,
        level: spec.level, status: "PUBLISHED", publishedAt: new Date(),
        durationMinutes: duration,
        instructorName: spec.instructor,
        isFree: spec.isFree, price: spec.isFree ? 0 : (spec.price ?? 4900), currency: "USD",
        categoryId: catBySlug[spec.catSlug].id,
        featured: spec.featured ?? false,
        objectives: spec.objectives, requirements: spec.requirements,
        authorId: admin.id,
      },
    });

    let firstQuizLessonId: string | null = null;
    for (let mi = 0; mi < spec.modules.length; mi++) {
      const m = spec.modules[mi];
      const module = await prisma.module.create({
        data: { courseId: course.id, titleEn: m.en, titleAr: m.ar, order: mi },
      });
      for (let li = 0; li < m.lessons.length; li++) {
        const l = m.lessons[li];
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: module.id, titleEn: l.en, titleAr: l.ar, type: l.type,
            contentUrl: l.url ?? null, bodyEn: l.bodyEn ?? null, bodyAr: l.bodyAr ?? null,
            durationMinutes: l.min ?? 8, isPreview: l.preview ?? (mi === 0 && li === 0), order: li,
          },
        });
        if (spec.withQuiz && mi === 0 && li === m.lessons.length - 1 && !firstQuizLessonId) {
          firstQuizLessonId = lesson.id;
        }
        // Add a sample attachment to the first lesson of each module.
        if (li === 0) {
          await prisma.attachment.create({
            data: {
              lessonId: lesson.id,
              titleEn: "Lesson resources (PDF)", titleAr: "موارد الدرس (PDF)",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              fileType: "application/pdf", isExternal: true,
            },
          });
        }
      }
    }

    if (spec.withQuiz && firstQuizLessonId) {
      const o = (en: string, ar: string) => ({ id: uid("opt"), en, ar });
      const q1a = [o("To structure content", "لهيكلة المحتوى"), o("To style content", "لتنسيق المحتوى"), o("To run scripts", "لتشغيل السكربتات")];
      const q2a = [o("True", "صحيح"), o("False", "خطأ")];
      await prisma.quiz.create({
        data: {
          courseId: course.id, lessonId: firstQuizLessonId,
          titleEn: "Module 1 check", titleAr: "اختبار الوحدة الأولى",
          passingScore: 60, maxAttempts: 0,
          questions: {
            create: [
              {
                type: "MULTIPLE_CHOICE", order: 0, points: 1,
                promptEn: "What is the main purpose covered in module 1?",
                promptAr: "ما الهدف الرئيسي الذي تناولته الوحدة الأولى؟",
                options: q1a, correctOptionIds: [q1a[0].id],
                explanationEn: "Module 1 focuses on structuring the fundamentals.",
                explanationAr: "تركّز الوحدة الأولى على هيكلة الأساسيات.",
              },
              {
                type: "TRUE_FALSE", order: 1, points: 1,
                promptEn: "You can switch the interface between Arabic and English at any time.",
                promptAr: "يمكنك تبديل الواجهة بين العربية والإنجليزية في أي وقت.",
                options: q2a, correctOptionIds: [q2a[0].id],
                explanationEn: "Yes — use the language switcher in the top menu.",
                explanationAr: "نعم — استخدم مبدّل اللغة في القائمة العلوية.",
              },
            ],
          },
        },
      });
    }

    return course;
  }

  // ---- Courses ----
  const webDev = await buildCourse({
    slug: "web-development-fundamentals",
    titleEn: "Web Development Fundamentals",
    titleAr: "أساسيات تطوير الويب",
    shortEn: "Build modern websites from scratch with HTML, CSS and JavaScript.",
    shortAr: "ابنِ مواقع حديثة من الصفر باستخدام HTML وCSS وJavaScript.",
    descEn: "A complete beginner-friendly path into web development. You'll learn how the web works, structure pages with HTML, style them with CSS, and add interactivity with JavaScript — finishing with a small project.",
    descAr: "مسار متكامل وملائم للمبتدئين في تطوير الويب. ستتعلّم كيف يعمل الويب، وهيكلة الصفحات باستخدام HTML، وتنسيقها بـ CSS، وإضافة التفاعل باستخدام JavaScript — وتنتهي بمشروع صغير.",
    catSlug: "development", level: "BEGINNER", isFree: true, featured: true,
    instructor: "Omar Khaled",
    thumbnail: "/thumbnails/web-development-fundamentals.svg",
    objectives: [
      { en: "Understand how the web works", ar: "فهم كيفية عمل الويب" },
      { en: "Structure pages with semantic HTML", ar: "هيكلة الصفحات باستخدام HTML الدلالي" },
      { en: "Style responsive layouts with CSS", ar: "تنسيق تخطيطات متجاوبة باستخدام CSS" },
      { en: "Add interactivity with JavaScript", ar: "إضافة التفاعل باستخدام JavaScript" },
    ],
    requirements: [
      { en: "A computer with internet access", ar: "جهاز كمبيوتر متصل بالإنترنت" },
      { en: "No prior coding experience needed", ar: "لا حاجة لخبرة برمجية سابقة" },
    ],
    withQuiz: true,
    modules: [
      {
        en: "Getting Started", ar: "البداية",
        lessons: [
          { en: "How the web works", ar: "كيف يعمل الويب", type: "VIDEO_EMBED", url: "https://www.youtube.com/watch?v=hJHvdBlSxug", preview: true, min: 10 },
          { en: "Setting up your editor", ar: "إعداد محرّر الأكواد", type: "TEXT", bodyEn: "Install a code editor like VS Code and create your first project folder.", bodyAr: "ثبّت محرّر أكواد مثل VS Code وأنشئ أول مجلّد لمشروعك.", min: 6 },
          { en: "Your first HTML page", ar: "أول صفحة HTML", type: "VIDEO_EMBED", url: "https://www.youtube.com/watch?v=qz0aGYrrlhU", min: 12 },
        ],
      },
      {
        en: "Styling with CSS", ar: "التنسيق باستخدام CSS",
        lessons: [
          { en: "CSS basics", ar: "أساسيات CSS", type: "VIDEO_EMBED", url: "https://www.youtube.com/watch?v=1PnVor36_40", min: 14 },
          { en: "Responsive layouts", ar: "التخطيطات المتجاوبة", type: "TEXT", bodyEn: "Use flexbox and grid to build layouts that adapt to any screen.", bodyAr: "استخدم flexbox وgrid لبناء تخطيطات تتكيّف مع أي شاشة.", min: 12 },
        ],
      },
      {
        en: "Interactivity with JavaScript", ar: "التفاعل باستخدام JavaScript",
        lessons: [
          { en: "JS fundamentals", ar: "أساسيات JavaScript", type: "VIDEO_EMBED", url: "https://www.youtube.com/watch?v=W6NZfCO5SIk", min: 16 },
          { en: "Building a small project", ar: "بناء مشروع صغير", type: "TEXT", bodyEn: "Put it all together by building an interactive to-do list.", bodyAr: "اجمع كل ما تعلّمته ببناء قائمة مهام تفاعلية.", min: 18 },
        ],
      },
    ],
  });

  await buildCourse({
    slug: "ui-ux-design-essentials",
    titleEn: "UI/UX Design Essentials",
    titleAr: "أساسيات تصميم واجهات وتجربة المستخدم",
    shortEn: "Design beautiful, usable interfaces your users will love.",
    shortAr: "صمّم واجهات جميلة وسهلة الاستخدام يحبّها مستخدموك.",
    descEn: "Learn the principles of user-centered design, from research and wireframing to visual design and prototyping.",
    descAr: "تعلّم مبادئ التصميم المتمحور حول المستخدم، من البحث والتخطيط الهيكلي إلى التصميم البصري والنماذج الأولية.",
    catSlug: "design", level: "INTERMEDIATE", isFree: false, price: 5900, featured: true,
    instructor: "Sara Ahmed",
    thumbnail: "/thumbnails/ui-ux-design-essentials.svg",
    objectives: [
      { en: "Apply user-centered design principles", ar: "تطبيق مبادئ التصميم المتمحور حول المستخدم" },
      { en: "Create wireframes and prototypes", ar: "إنشاء النماذج الهيكلية والأولية" },
      { en: "Build a consistent design system", ar: "بناء نظام تصميم متسق" },
    ],
    requirements: [
      { en: "Interest in design", ar: "اهتمام بالتصميم" },
      { en: "Any design tool (Figma recommended)", ar: "أي أداة تصميم (يُفضّل Figma)" },
    ],
    withQuiz: true,
    modules: [
      {
        en: "Design Foundations", ar: "أسس التصميم",
        lessons: [
          { en: "What is UX?", ar: "ما هي تجربة المستخدم؟", type: "VIDEO_EMBED", url: "https://www.youtube.com/watch?v=v6FwUMjnpvw", preview: true, min: 9 },
          { en: "Color & typography", ar: "الألوان والطباعة", type: "TEXT", bodyEn: "Choosing palettes and type scales that communicate clearly.", bodyAr: "اختيار لوحات الألوان ومقاييس الخطوط التي تتواصل بوضوح.", min: 11 },
        ],
      },
      {
        en: "From Idea to Prototype", ar: "من الفكرة إلى النموذج الأولي",
        lessons: [
          { en: "Wireframing", ar: "التخطيط الهيكلي", type: "TEXT", bodyEn: "Sketch low-fidelity layouts before adding visual detail.", bodyAr: "ارسم تخطيطات منخفضة الدقة قبل إضافة التفاصيل البصرية.", min: 10 },
          { en: "Prototyping basics", ar: "أساسيات النماذج الأولية", type: "VIDEO_EMBED", url: "https://www.youtube.com/watch?v=jwCmIBJ8Jtc", min: 13 },
        ],
      },
    ],
  });

  await buildCourse({
    slug: "digital-marketing-101",
    titleEn: "Digital Marketing 101",
    titleAr: "مقدمة في التسويق الرقمي",
    shortEn: "Grow any brand online with proven marketing strategies.",
    shortAr: "نمِّ أي علامة تجارية عبر الإنترنت باستراتيجيات تسويق مُثبتة.",
    descEn: "From SEO and content to social media and analytics, learn how to attract and convert customers online.",
    descAr: "من تحسين محركات البحث والمحتوى إلى وسائل التواصل والتحليلات، تعلّم كيف تجذب العملاء وتحوّلهم عبر الإنترنت.",
    catSlug: "marketing", level: "BEGINNER", isFree: true,
    instructor: "Layla Mansour",
    thumbnail: "/thumbnails/digital-marketing-101.svg",
    objectives: [
      { en: "Understand the marketing funnel", ar: "فهم قمع التسويق" },
      { en: "Run basic SEO and content campaigns", ar: "تشغيل حملات أساسية لـ SEO والمحتوى" },
    ],
    requirements: [{ en: "No experience required", ar: "لا حاجة لخبرة سابقة" }],
    modules: [
      {
        en: "Marketing Foundations", ar: "أسس التسويق",
        lessons: [
          { en: "The marketing funnel", ar: "قمع التسويق", type: "TEXT", bodyEn: "Awareness, consideration, conversion, retention.", bodyAr: "الوعي، الاهتمام، التحويل، الاحتفاظ.", preview: true, min: 8 },
          { en: "SEO basics", ar: "أساسيات SEO", type: "VIDEO_EMBED", url: "https://www.youtube.com/watch?v=xsVTqzratPs", min: 12 },
        ],
      },
    ],
  });

  await buildCourse({
    slug: "data-analysis-with-python",
    titleEn: "Data Analysis with Python",
    titleAr: "تحليل البيانات باستخدام بايثون",
    shortEn: "Turn raw data into insights using Python and pandas.",
    shortAr: "حوّل البيانات الخام إلى رؤى باستخدام بايثون وpandas.",
    descEn: "Hands-on introduction to data analysis: loading data, cleaning, exploring, and visualizing with Python.",
    descAr: "مقدمة عملية لتحليل البيانات: تحميل البيانات وتنظيفها واستكشافها وتمثيلها بصرياً باستخدام بايثون.",
    catSlug: "data", level: "ADVANCED", isFree: false, price: 7900,
    instructor: "Omar Khaled",
    thumbnail: "/thumbnails/data-analysis-with-python.svg",
    objectives: [
      { en: "Load and clean datasets", ar: "تحميل مجموعات البيانات وتنظيفها" },
      { en: "Explore data with pandas", ar: "استكشاف البيانات باستخدام pandas" },
      { en: "Visualize results", ar: "تمثيل النتائج بصرياً" },
    ],
    requirements: [{ en: "Basic Python knowledge", ar: "معرفة أساسية ببايثون" }],
    modules: [
      {
        en: "Getting Started with pandas", ar: "البدء مع pandas",
        lessons: [
          { en: "Installing the tools", ar: "تثبيت الأدوات", type: "TEXT", bodyEn: "Set up Python, pip, and Jupyter.", bodyAr: "إعداد بايثون وpip وJupyter.", preview: true, min: 7 },
          { en: "DataFrames intro", ar: "مقدمة إلى DataFrames", type: "VIDEO_EMBED", url: "https://www.youtube.com/watch?v=vmEHCJofslg", min: 15 },
        ],
      },
    ],
  });

  // ---- Sample enrollment + progress for the demo student ----
  const enrollment = await prisma.enrollment.create({
    data: { userId: student.id, courseId: webDev.id, lastLessonId: null },
  });
  await prisma.order.create({
    data: { userId: student.id, courseId: webDev.id, amount: 0, currency: "USD", status: "FREE", provider: "free" },
  });

  // Complete the first two lessons to show partial progress.
  const firstLessons = await prisma.lesson.findMany({
    where: { module: { courseId: webDev.id } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    take: 2,
  });
  for (const l of firstLessons) {
    await prisma.lessonProgress.create({
      data: { userId: student.id, lessonId: l.id, completed: true, completedAt: new Date() },
    });
  }
  const totalLessons = await prisma.lesson.count({ where: { module: { courseId: webDev.id } } });
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { progress: Math.round((firstLessons.length / totalLessons) * 100), lastLessonId: firstLessons[1]?.id },
  });

  console.log("✅ Seed complete.");
  console.log("   Admin:   admin@edu.test / admin1234");
  console.log("   Student: student@edu.test / student1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
