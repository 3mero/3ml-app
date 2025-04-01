// تحسين Service Worker لضمان عمل التطبيق بدون اتصال بالإنترنت
const CACHE_NAME = "work-schedule-cache-v4" // زيادة رقم الإصدار لفرض التحديث
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/globals.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // إضافة المزيد من الموارد الثابتة
  "/_next/static/chunks/main.js",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/pages/_app.js",
  "/_next/static/chunks/pages/index.js",
  "/_next/static/css/",
  // إضافة الصفحات الرئيسية
  "/app/page",
  "/app/layout",
  // إضافة المكونات الأساسية
  "/components/schedule-grid",
  "/components/schedule-view-selector",
  "/components/settings-panel",
  // إضافة الأيقونات
  "/lucide-react",
]

// تثبيت Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: جاري التثبيت...")

  // فرض التنشيط الفوري دون انتظار إغلاق علامات التبويب
  self.skipWaiting()

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: جاري تخزين الملفات")
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error("فشل في تخزين الملفات:", error)
      }),
  )
})

// تخزين واسترجاع الطلبات
self.addEventListener("fetch", (event) => {
  // عدم اعتراض طلبات API أو الموارد الديناميكية
  if (event.request.url.includes("/api/")) {
    return
  }

  // استراتيجية: التخزين المؤقت أولاً، ثم الشبكة
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // إذا وجد في التخزين المؤقت - إرجاع الاستجابة
        if (response) {
          console.log("Service Worker: إرجاع من التخزين المؤقت", event.request.url)
          return response
        }

        // نسخ الطلب لأنه تيار استخدام لمرة واحدة
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest)
          .then((response) => {
            // التحقق مما إذا تلقينا استجابة صالحة
            if (!response || response.status !== 200 || response.type !== "basic") {
              console.log("Service Worker: عدم تخزين استجابة غير صالحة لـ", event.request.url)
              return response
            }

            // نسخ الاستجابة لأنها تيار استخدام لمرة واحدة
            const responseToCache = response.clone()

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                console.log("Service Worker: تخزين مورد جديد", event.request.url)
                cache.put(event.request, responseToCache)
              })
              .catch((error) => {
                console.error("فشل في تخزين الاستجابة:", error)
              })

            return response
          })
          .catch((error) => {
            console.log("Service Worker: فشل الجلب، إرجاع صفحة عدم الاتصال", error)

            // إذا كان طلب صفحة، إرجاع الصفحة الرئيسية
            if (event.request.mode === "navigate") {
              return caches.match("/")
            }

            // بالنسبة للموارد الأخرى، محاولة إرجاع مورد مشابه من التخزين المؤقت
            return caches.match(new URL(event.request.url).pathname)
          })
      })
      .catch((error) => {
        console.error("خطأ في مطابقة التخزين المؤقت:", error)
        // محاولة إرجاع الصفحة الرئيسية في حالة الفشل
        return caches.match("/")
      }),
  )
})

// تحديث Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: جاري التنشيط...")

  // أخذ السيطرة فوراً على جميع الصفحات
  self.clients.claim()

  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log("Service Worker: حذف التخزين المؤقت القديم", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .catch((error) => {
        console.error("خطأ أثناء تنظيف التخزين المؤقت:", error)
      }),
  )
})

// الاستماع للرسائل من التطبيق
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// إضافة معالج للحالة عندما يكون المستخدم غير متصل
self.addEventListener("fetch", (event) => {
  event.respondWith(
    // محاولة مطابقة الطلب في التخزين المؤقت
    caches
      .match(event.request)
      .then((response) => {
        // إرجاع الاستجابة المخزنة مؤقتًا إذا وجدت
        if (response) {
          return response
        }

        // إذا لم يتم العثور على الاستجابة في التخزين المؤقت، محاولة الجلب من الشبكة
        return fetch(event.request)
          .then((response) => {
            // التحقق مما إذا كانت الاستجابة صالحة
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response
            }

            // نسخ الاستجابة لتخزينها في التخزين المؤقت
            var responseToCache = response.clone()

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // إذا فشل الجلب (على سبيل المثال، عدم وجود اتصال بالإنترنت)
            // إرجاع صفحة عدم الاتصال المخزنة مسبقًا
            if (event.request.mode === "navigate") {
              return caches.match("/")
            }

            // للموارد الأخرى، محاولة إرجاع صورة أو أيقونة افتراضية
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match("/icons/icon-192x192.png")
            }
          })
      }),
  )
})

