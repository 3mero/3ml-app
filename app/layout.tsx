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
      </head>
      <body className={cairo.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      // Función para verificar y registrar el Service Worker
      function registerServiceWorker() {
        if ("serviceWorker" in navigator) {
          window.addEventListener("load", function() {
            navigator.serviceWorker.register("/service-worker.js").then(
              function(registration) {
                console.log("Service Worker registration successful with scope: ", registration.scope);
                
                // Verificar si hay una nueva versión del Service Worker
                registration.addEventListener("updatefound", () => {
                  const newWorker = registration.installing;
                  
                  // Cuando el nuevo Service Worker cambie de estado
                  newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                      // Hay una nueva versión lista para usar
                      if (confirm("Hay una nueva versión de la aplicación disponible. ¿Desea actualizar ahora?")) {
                        // Enviar mensaje al Service Worker para que se active inmediatamente
                        newWorker.postMessage({ type: "SKIP_WAITING" });
                        // Recargar la página para usar la nueva versión
                        window.location.reload();
                      }
                    }
                  });
                });
              },
              function(err) {
                console.log("Service Worker registration failed: ", err);
              }
            );
            
            // Verificar el estado de la conexión
            window.addEventListener("online", () => {
              console.log("Conexión restablecida");
              // Opcional: mostrar notificación al usuario
            });
            
            window.addEventListener("offline", () => {
              console.log("Sin conexión");
              // Opcional: mostrar notificación al usuario
            });
          });
        }
      }
      
      // Verificar si localStorage está disponible
      function checkLocalStorage() {
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          console.log("localStorage está disponible");
          return true;
        } catch (e) {
          console.error("localStorage no está disponible:", e);
          alert("Tu navegador no permite almacenamiento local. La aplicación no podrá guardar datos.");
          return false;
        }
      }
      
      // Ejecutar las funciones
      registerServiceWorker();
      checkLocalStorage();
      
      // Verificar si hay datos guardados al cargar la página
      if (typeof localStorage !== "undefined") {
        const hasSchedules = localStorage.getItem("work-schedule-storage");
        const currentScheduleId = localStorage.getItem("current-schedule-id");
        console.log("Stored data check - Has schedules:", !!hasSchedules, "Current schedule ID:", currentScheduleId);
      }

      // أضف هذا الكود في نهاية الـ script في dangerouslySetInnerHTML
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
          console.error("Error applying stored colors:", e);
        }
      }

      // تنفيذ الدالة
      applyStoredColors();
    `,
          }}
        />
      </body>
    </html>
  )
}

