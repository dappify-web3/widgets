import React, { Suspense, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { getRegisteredWidgets } from "./registry.js";

const AsyncPropsWrapper = ({ element, Component }) => {
  const [props, setProps] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.resolve(getRegisteredWidgets()[element.dataset.widget].getProps(element))
      .then((resolvedProps) => {
        if (mounted) setProps(resolvedProps);
      })
      .catch((err) => console.error(`Error loading props for ${element.dataset.widget}:`, err));
    return () => {
      mounted = false;
    };
  }, [element, Component]);

  if (!props) return <div>Loading props...</div>;
  return <Component {...props} />;
};

const WidgetWrapper = ({ element }) => {
  const widgetName = element.dataset.widget;
  const widget = getRegisteredWidgets()[widgetName];
  if (!widget) {
    console.warn(`Unknown widget: ${widgetName}`);
    return null;
  }

  const { component: Component } = widget;
  return createPortal(
    <Suspense fallback={<div>Loading widget...</div>}>
      <AsyncPropsWrapper element={element} Component={Component} />
    </Suspense>,
    element
  );
};

export const renderProvider = (root, widgetElements) => {
  if (!widgetElements || widgetElements.length === 0) {
    console.error("No widget elements provided to renderProvider.");
    return;
  }

  const firstElement = widgetElements[0];
  if (!firstElement || !firstElement.dataset) {
    console.error("First widget element is invalid or lacks dataset:", firstElement);
    return;
  }

  const { clientId, chains } = firstElement.dataset;
  if (!clientId) {
    console.error("Missing clientId in widget dataset:", firstElement);
    return;
  }

  const enabledChains = chains
    ?.split(",")
    .map((id) => defineChain({ id: parseInt(id) }))
    .filter(Boolean);
  const defaultChain = enabledChains?.[0];

  root.render(
    <ThirdwebProvider
      clientId={clientId}
      supportedChains={enabledChains.length ? enabledChains : [defaultChain]}
      activeChain={defaultChain}
    >
      {widgetElements.map((element) => (
        <WidgetWrapper
          key={element.id || Math.random().toString(36).substr(2)}
          element={element}
        />
      ))}
    </ThirdwebProvider>
  );
};