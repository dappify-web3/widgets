import { createRoot } from "react-dom/client";
import { renderProvider } from "./provider.js";
import { getRegisteredWidgets } from "./registry.js";
import "./assets/styles.css";

let providerRoot = null;
let providerContainer = null;

const initWidgets = () => {
  const widgetElements = Array.from(document.querySelectorAll("[data-widget]"));
  console.log("Found widget elements:", widgetElements.map(el => el.outerHTML));
  if (widgetElements.length === 0) {
    console.warn("No widgets found on the page. Ensure elements with 'data-widget' exist.");
    return;
  }

  if (!providerRoot) {
    providerContainer = document.createElement("div");
    providerContainer.style.display = "none";
    document.body.appendChild(providerContainer);
    providerRoot = createRoot(providerContainer);
  }

  renderProvider(providerRoot, widgetElements);
};

const runInit = () => {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initWidgets();
  } else {
    window.addEventListener("DOMContentLoaded", initWidgets, { once: true });
  }
};

runInit();

export { initWidgets as ThirdwebWidgets };
window.ThirdwebWidgets = { init: initWidgets };