import { components } from "./components/index.js";

const widgetCache = new Map();

const widgetComponents = {};
const widgetPropsMap = {};
components.forEach(({ name, component, getProps }) => {
  widgetComponents[name] = component; // Use the explicit name field
  widgetPropsMap[name] = getProps;
});

const registerWidget = (widgetName) => {
  if (widgetCache.has(widgetName)) return widgetCache.get(widgetName);

  const widget = {
    component: widgetComponents[widgetName] || (() => <div>Unknown Widget: {widgetName}</div>),
    getProps: widgetPropsMap[widgetName] || (() => {
      console.warn(`No getProps found for ${widgetName}`);
      return {};
    }),
  };

  widgetCache.set(widgetName, widget);
  return widget;
};

export const getRegisteredWidgets = () => {
  const widgetElements = Array.from(document.querySelectorAll("[data-widget]"));
  const widgetNames = [...new Set(widgetElements.map((el) => el.dataset.widget))];
  console.log("Registered widget names:", widgetNames);

  const widgets = {};
  widgetNames.forEach((name) => {
    widgets[name] = registerWidget(name);
  });

  return widgets;
};