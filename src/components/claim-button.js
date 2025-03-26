import * as availableChains from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { ClaimButton as ThirdwebComponent } from "thirdweb/react";

export const getProps = (element) => {
  const { clientId, chains, contractAddress, type, theme, quantity, tokenId, label } = element.dataset;
  const enabledChains = chains?.split(",").map((id) => availableChains.defineChain({ id: parseInt(id) })).filter(Boolean);
  const props = {
    client: createThirdwebClient({ clientId }),
    theme: theme || "light",
    chains: enabledChains,
    chain: enabledChains[0],
    contractAddress,
    claimParams: {
      type,
      quantity: type === "ERC20" ? quantity : BigInt(quantity || 1),
      ...(tokenId !== undefined && { tokenId: BigInt(tokenId) })
    },
    children: label || "Claim"
  };
  return props;
};

export const getComponent = () => ThirdwebComponent;