# 2. Sitemap

All routes are locale-prefixed: `/{en|ar}/...`. The root `/` redirects to the visitor's locale.

## Public (Guest)
```
/{locale}                         Homepage (hero, featured, categories, benefits,
                                  how-it-works, testimonials, FAQ, CTA)
/{locale}/courses                 Catalog with search + category/level filters
/{locale}/courses/[slug]          Course detail (overview, objectives, curriculum,
                                  requirements, enroll/buy card)
/{locale}/about                   About
/{locale}/contact                 Contact (form)
/{locale}/faq                     FAQ
/{locale}/terms                   Terms & Conditions
/{locale}/privacy                 Privacy Policy
```

## Auth
```
/{locale}/login
/{locale}/register
/{locale}/forgot-password
/{locale}/reset-password?token=…
```

## Student (auth required)
```
/{locale}/dashboard               Overview (stats, continue learning, my courses)
/{locale}/dashboard/courses       All enrolled courses + progress
/{locale}/dashboard/certificates  Earned certificates
/{locale}/dashboard/profile       Profile editing
/{locale}/dashboard/settings      Language preference + change password
/{locale}/learn/[slug]?lesson=…   Course player
/{locale}/quiz/[id]               Quiz runner + results
/{locale}/certificate/[serial]    Certificate view + public verification (public URL)
```

## Admin (ADMIN role required)
```
/{locale}/admin                   Analytics overview
/{locale}/admin/courses           Course list (publish/unpublish/delete)
/{locale}/admin/courses/new       Create course
/{locale}/admin/courses/[id]      Edit course + content manager (modules/lessons/
                                  attachments/quizzes)
/{locale}/admin/users             User management (role/active)
/{locale}/admin/certificates      Issued certificates
/{locale}/admin/payments          Orders / revenue
/{locale}/admin/settings          Platform + language management
```

## API (REST, under `/api`)
```
POST   /api/register
GET/POST /api/auth/[...nextauth]            NextAuth (credentials)
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
PATCH  /api/profile                          update profile / language
PUT    /api/profile                          change password
POST   /api/courses/[slug]/enroll
POST   /api/lessons/[id]/complete
PUT    /api/lessons/[id]/note
POST   /api/quizzes/[id]/attempt
# Admin
POST   /api/admin/courses
PATCH/DELETE /api/admin/courses/[id]
POST   /api/admin/courses/[id]/status
POST   /api/admin/modules · PATCH/DELETE /api/admin/modules/[id]
POST   /api/admin/lessons · PATCH/DELETE /api/admin/lessons/[id]
POST   /api/admin/attachments · DELETE /api/admin/attachments/[id]
POST   /api/admin/quizzes · DELETE /api/admin/quizzes/[id]
PATCH  /api/admin/users/[id]
POST   /api/admin/upload
```
