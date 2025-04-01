import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "نظام إدارة جداول العمل",
  description: "تطبيق لإدارة جداول العمل وتنظيم الورديات للموظفين",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="جداول العمل" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cairo.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      // دالة للتحقق وتسجيل Service Worker
      function registerServiceWorker() {
        if ("serviceWorker" in navigator) {
          window.addEventListener("load", function() {
            navigator.serviceWorker.register("/service-worker.js").then(
              function(registration) {
                console.log("تم تسجيل Service Worker بنجاح مع النطاق: ", registration.scope);
                
                // التحقق مما إذا كان هناك إصدار جديد من Service Worker
                registration.addEventListener("updatefound", () => {
                  const newWorker = registration.installing;
                  
                  // عندما يتغير حالة Service Worker الجديد
                  newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                      // هناك إصدار جديد جاهز للاستخدام
                      if (confirm("هناك إصدار جديد من التطبيق متاح. هل ترغب في التحديث الآن؟")) {
                        // إرسال رسالة إلى Service Worker لتنشيطه فوراً
                        newWorker.postMessage({ type: "SKIP_WAITING" });
                        // إعادة تحميل الصفحة لاستخدام الإصدار الجديد
                        window.location.reload();
                      }
                    }
                  });
                });
              },
              function(err) {
                console.log("فشل تسجيل Service Worker: ", err);
              }
            );
            
            // التحقق من حالة الاتصال
            window.addEventListener("online", () => {
              console.log("تم استعادة الاتصال");
              document.getElementById("offline-indicator")?.classList.add("hidden");
              // اختياري: عرض إشعار للمستخدم
            });
            
            window.addEventListener("offline", () => {
              console.log("لا يوجد اتصال");
              document.getElementById("offline-indicator")?.classList.remove("hidden");
              // اختياري: عرض إشعار للمستخدم
            });
          });
        }
      }
      
      // التحقق مما إذا كان localStorage متاحًا
      function checkLocalStorage() {
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          console.log("localStorage متاح");
          return true;
        } catch (e) {
          console.error("localStorage غير متاح:", e);
          alert("متصفحك لا يسمح بالتخزين المحلي. لن يتمكن التطبيق من حفظ البيانات.");
          return false;
        }
      }
      
      // تنفيذ الدوال
      registerServiceWorker();
      checkLocalStorage();
      
      // التحقق مما إذا كانت هناك بيانات محفوظة عند تحميل الصفحة
      if (typeof localStorage !== "undefined") {
        const hasSchedules = localStorage.getItem("work-schedule-storage");
        const currentScheduleId = localStorage.getItem("current-schedule-id");
        console.log("فحص البيانات المخزنة - يوجد جداول:", !!hasSchedules, "معرف الجدول الحالي:", currentScheduleId);
      }

      // إضافة كود لتطبيق الألوان عند تحميل الصفحة
      function applyStoredColors() {
        try {
          const mainBgColor = localStorage.getItem("main-bg-color") || "#ffffff";
          const scheduleBgColor = localStorage.getItem("schedule-bg-color") || "#ffffff";
          const settingsBgColor = localStorage.getItem("settings-bg-color") || "#ffffff";
          const notesBgColor = localStorage.getItem("notes-bg-color") || "#ffffff";
          const monthCardsBgColor = localStorage.getItem("month-cards-bg-color") || "#ffffff";
          
          // تطبيق الألوان على متغيرات CSS
          document.documentElement.style.setProperty("--main-bg-color", mainBgColor);
          document.documentElement.style.setProperty("--schedule-bg-color", scheduleBgColor);
          document.documentElement.style.setProperty("--settings-bg-color", settingsBgColor);
          document.documentElement.style.setProperty("--notes-bg-color", notesBgColor);
          document.documentElement.style.setProperty("--month-cards-bg-color", monthCardsBgColor);
          
          // تطبيق الألوان على العناصر بعد تحميل الصفحة
          window.addEventListener("load", function() {
            setTimeout(function() {
              document.getElementById("schedule-container")?.style.setProperty("background-color", mainBgColor);
              document.querySelectorAll(".schedule-grid-container, .schedule-cards").forEach(function(el) {
                el.style.setProperty("background-color", scheduleBgColor);
              });
              document.querySelectorAll(".settings-panel").forEach(function(el) {
                el.style.setProperty("background-color", settingsBgColor);
              });
              document.querySelectorAll(".notes-popup, .comment-modal").forEach(function(el) {
                el.style.setProperty("background-color", notesBgColor);
              });
              document.querySelectorAll(".month-card").forEach(function(el) {
                el.style.setProperty("background-color", monthCardsBgColor);
              });
            }, 500);
          });
        } catch (e) {
          console.error("خطأ في تطبيق الألوان المخزنة:", e);
        }
      }

      // تنفيذ الدالة
      applyStoredColors();

      // إضافة كود للتحقق من تغير الشهر عند تحميل الصفحة
      function checkMonthChange() {
        try {
          const currentMonth = new Date().getMonth();
          const storedMonth = localStorage.getItem("current-month");
          
          if (storedMonth && Number(storedMonth) !== currentMonth) {
            console.log("تم اكتشاف تغيير الشهر عند تحميل الصفحة");
            localStorage.setItem("current-month", currentMonth.toString());
            
            // إضافة علامة لإعادة تحميل الجدول
            localStorage.setItem("reload-schedule", "true");
          }
          
          // التحقق من علامة إعادة التحميل
          const reloadSchedule = localStorage.getItem("reload-schedule");
          if (reloadSchedule === "true") {
            localStorage.removeItem("reload-schedule");
            
            // إعادة تحميل الجدول بعد تأخير قصير
            setTimeout(function() {
              // إرسال حدث مخصص لتحديث الجدول
              window.dispatchEvent(new CustomEvent("month-changed"));
            }, 1000);
          }
        } catch (e) {
          console.error("خطأ في التحقق من تغيير الشهر:", e);
        }
      }

      // تنفيذ الدالة
      checkMonthChange();

      // إضافة كود للتعامل مع وضع عدم الاتصال
      function setupOfflineMode() {
        // إنشاء مؤشر عدم الاتصال
        const offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offline-indicator';
        offlineIndicator.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50 hidden';
        offlineIndicator.textContent = 'أنت حاليًا في وضع عدم الاتصال. سيتم حفظ التغييرات محليًا.';
        document.body.appendChild(offlineIndicator);
        
        // التحقق من حالة الاتصال الحالية
        if (!navigator.onLine) {
          offlineIndicator.classList.remove('hidden');
        }
        
        // تخزين البيانات المحلية بشكل دوري
        setInterval(function() {
          if (typeof localStorage !== "undefined") {
            // محاولة تخزين البيانات الحالية في IndexedDB أو localStorage
            try {
              const currentData = localStorage.getItem("work-schedule-storage");
              if (currentData) {
                localStorage.setItem("work-schedule-backup", currentData);
                console.log("تم عمل نسخة احتياطية من البيانات");
              }
            } catch (e) {
              console.error("فشل في عمل نسخة احتياطية:", e);
            }
          }
        }, 60000); // كل دقيقة
      }
      
      // تنفيذ إعداد وضع عدم الاتصال
      setupOfflineMode();
    `,
          }}
        />
      </body>
    </html>
  )
}

