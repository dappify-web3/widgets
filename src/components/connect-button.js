import * as availableChains from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton as ThirdwebComponent } from "thirdweb/react";

export const getProps = (element) => {
  const { 
    // Mandatory
    clientId, 
    chains, 
    // Optional
    theme,
    locale
  } = element.dataset;
  const enabledChains = chains?.split(",").map((id) => availableChains.defineChain({ id: parseInt(id) })).filter(Boolean);
  return {
    client: createThirdwebClient({ clientId }),
    theme: theme || "light",
    chains: enabledChains,
    chain: enabledChains[0],
    locale
  };
};

export const getComponent = () => ThirdwebComponent;