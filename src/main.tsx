import React from "react";
import { createRoot } from "react-dom/client";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { Capacitor } from "@capacitor/core";
import App from "./App";

// Initialize custom elements
defineCustomElements(window);

// Wait for device ready on native platforms
const initApp = () => {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
};

if (Capacitor.isNativePlatform()) {
  // Wait for the deviceready event for native platforms
  document.addEventListener("deviceready", initApp, false);
} else {
  // Web platform, initialize immediately
  initApp();
}
