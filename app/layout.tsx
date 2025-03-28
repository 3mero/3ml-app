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
    generator: 'v0.dev'
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
    `,
          }}
        />
      </body>
    </html>
  )
}



import './globals.css'