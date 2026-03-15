import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado:", registration.scope);

      // Revisar actualización apenas carga
      await registration.update();

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("Nueva versión disponible, recargando...");
            window.location.reload();
          }
        });
      });

      // Revisar actualizaciones cada 60 segundos
      setInterval(async () => {
        try {
          await registration.update();
        } catch (error) {
          console.error("Error buscando actualización del Service Worker:", error);
        }
      }, 60000);
    } catch (error) {
      console.error("Error registrando Service Worker:", error);
    }
  });
}