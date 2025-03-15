import React from "react";
import { createRoot } from "react-dom/client";
import { ThirdwebProvider, ConnectButton, ClaimButton } from "thirdweb/react";
import * as availableChains from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

// Map of widget names to their components
const widgetComponents = {
  ConnectButton,
  ClaimButton,
};

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
    disabled: disabled === "false" ? false : undefined, // Only set if explicitly false
  };

  // Add ClaimButton-specific props
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

// Main widget initialization
const initWidgets = () => {
  const appContainer = document.getElementById("dappify");
  if (!appContainer) {
    console.error("Container #dappify not found");
    return;
  }

  const widgetElements = appContainer.querySelectorAll("[data-widget]");
  if (widgetElements.length === 0) {
    console.warn("No widgets found in #dappify");
    return;
  }

  // Use the first widget's clientId and chains as defaults for the provider
  const { clientId, chains } = widgetElements[0].dataset;
  const enabledChains = chains
    ?.split(",")
    .map((id) => availableChains.defineChain({ id: parseInt(id) }))
    .filter(Boolean);
  const defaultChain = enabledChains?.[0] || availableChains.Mainnet;

  const root = createRoot(appContainer);
  root.render(
    <ThirdwebProvider
      clientId={clientId}
      supportedChains={enabledChains.length ? enabledChains : [defaultChain]}
      activeChain={defaultChain}
    >
      {Array.from(widgetElements).map((element) => {
        const widgetName = element.dataset.widget;
        const Component = widgetComponents[widgetName];
        if (!Component) {
          console.warn(`Unknown widget: ${widgetName}`);
          return null;
        }

        const props = getWidgetProps(element);
        console.log(`Rendering ${widgetName} with props:`, props);

        return (
          <div key={element.id} id={element.id}>
            <Component {...props}>
              {widgetName === "ClaimButton" ? "Claim Now" : null}
            </Component>
          </div>
        );
      })}
    </ThirdwebProvider>
  );
};

// Run initialization
if (document.readyState === "complete") {
  initWidgets();
} else {
  window.addEventListener("load", initWidgets);
}

// Export for ESM (optional, if needed elsewhere)
export { initWidgets as ThirdwebWidgets };
window.ThirdwebWidgets = { init: initWidgets };