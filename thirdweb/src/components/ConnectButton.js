import * as availableChains from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react";

export const getProps = (element) => {
  const { clientId, theme, chains, disabled } = element.dataset;
  const enabledChains = chains?.split(",").map((id) => availableChains.defineChain({ id: parseInt(id) })).filter(Boolean);
  const defaultChain = enabledChains?.[0] || availableChains.Mainnet;
  return {
    client: createThirdwebClient({ clientId }),
    theme: theme || "light",
    chains: enabledChains.length ? enabledChains : [defaultChain],
    chain: defaultChain,
    disabled: disabled === "false" ? false : undefined,
  };
};

export const getComponent = () => ThirdwebConnectButton;