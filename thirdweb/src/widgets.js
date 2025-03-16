import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { ThirdwebProvider } from "thirdweb/react";
import * as availableChains from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

// Lazy-loaded widget components
const ConnectButton = lazy(() => import("thirdweb/react").then((mod) => ({ default: mod.ConnectButton })));
const ClaimButton = lazy(() => import("thirdweb/react").then((mod) => ({ default: mod.ClaimButton })));

// Map of widget names to their components
const widgetComponents = {
  ConnectButton,
  ClaimButton,
};

// Singleton ThirdwebProvider management
let providerRoot = null;
let providerContainer = null;

// Function to parse widget props from data attributes
const getWidgetProps = (element) => {
  const {
    clientId,
    theme,
    locale,
    chains,
    abstractionEnabled,
    abstractionSponsorGas,
    contractAddress,
    type,
    claimQuantity,
    tokenId,
    disabled,
  } = element.dataset;

  const enabledChains = chains
    ?.split(",")
    .map((id) => availableChains.defineChain({ id: parseInt(id) }))
    .filter(Boolean);
  const defaultChain = enabledChains?.[0] || availableChains.Mainnet;

  const accountAbstraction = abstractionEnabled === "true" ? {
    chain: defaultChain,
    sponsorGas: abstractionSponsorGas === "true",
  } : undefined;

  const baseProps = {
    locale: locale || "en_US",
    theme: theme || "light",
    accountAbstraction,
    client: createThirdwebClient({ clientId }),
    chains: enabledChains.length ? enabledChains : [defaultChain],
    chain: defaultChain,
    disabled: disabled === "false" ? false : undefined,
  };

  if (element.dataset.widget === "ClaimButton") {
    return {
      ...baseProps,
      contractAddress,
      claimParams: {
        type: type || "ERC721",
        quantity: claimQuantity ? BigInt(claimQuantity) : BigInt(1),
        tokenId: tokenId ? BigInt(tokenId) : undefined,
      },
    };
  }

  return baseProps;
};

// Widget wrapper component using Portal
const WidgetWrapper = ({ element }) => {
  const widgetName = element.dataset.widget;
  const Component = widgetComponents[widgetName];
  if (!Component) {
    console.warn(`Unknown widget: ${widgetName}`);
    return null;
  }

  const props = getWidgetProps(element);
  return createPortal(
    <Suspense fallback={<div>Loading...</div>}>
      <Component {...props}>
        {widgetName === "ClaimButton" ? "Claim Now" : null}
      </Component>
    </Suspense>,
    element
  );
};

// Main widget initialization
const initWidgets = () => {
  const widgetElements = Array.from(document.querySelectorAll("[data-widget]"));
  if (widgetElements.length === 0) {
    console.warn("No widgets found on the page");
    return;
  }

  // Initialize singleton ThirdwebProvider if not already done
  if (!providerRoot) {
    providerContainer = document.createElement("div");
    providerContainer.style.display = "none"; // Hidden container for provider root
    document.body.appendChild(providerContainer);
    providerRoot = createRoot(providerContainer);

    const { clientId, chains } = widgetElements[0].dataset;
    const enabledChains = chains
      ?.split(",")
      .map((id) => availableChains.defineChain({ id: parseInt(id) }))
      .filter(Boolean);
    const defaultChain = enabledChains?.[0] || availableChains.Mainnet;

    providerRoot.render(
      <ThirdwebProvider
        clientId={clientId}
        supportedChains={enabledChains.length ? enabledChains : [defaultChain]}
        activeChain={defaultChain}
      >
        {widgetElements.map((element) => (
          <WidgetWrapper key={element.id || Math.random().toString(36).substr(2)} element={element} />
        ))}
      </ThirdwebProvider>
    );
  } else {
    // Update existing provider with new widgets if more are added dynamically
    providerRoot.render(
      <ThirdwebProvider
        clientId={widgetElements[0].dataset.clientId}
        supportedChains={
          widgetElements[0].dataset.chains
            ?.split(",")
            .map((id) => availableChains.defineChain({ id: parseInt(id) }))
            .filter(Boolean) || [availableChains.Mainnet]
        }
        activeChain={
          widgetElements[0].dataset.chains
            ?.split(",")
            .map((id) => availableChains.defineChain({ id: parseInt(id) }))
            .filter(Boolean)?.[0] || availableChains.Mainnet
        }
      >
        {widgetElements.map((element) => (
          <WidgetWrapper key={element.id || Math.random().toString(36).substr(2)} element={element} />
        ))}
      </ThirdwebProvider>
    );
  }
};

// Run initialization
if (document.readyState === "complete") {
  initWidgets();
} else {
  window.addEventListener("load", initWidgets);
}

// Export for ESM
export { initWidgets as ThirdwebWidgets };
window.ThirdwebWidgets = { init: initWidgets };