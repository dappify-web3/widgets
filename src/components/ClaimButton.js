import * as availableChains from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { ClaimButton as ThirdwebComponent } from "thirdweb/react";

export const getProps = (element) => {
  const {
    // Mandatory
    clientId,
    chains,
    contractAddress,
    type, // ERC1155, ERC20, ERC721...
    // Optional
    theme,
    quantity, 
    tokenId,
    label
  } = element.dataset;
  const enabledChains = chains?.split(",").map((id) => availableChains.defineChain({ id: parseInt(id) })).filter(Boolean);
  return {
    client: createThirdwebClient({ clientId }),
    theme: theme || "light",
    chains: enabledChains,
    chain: enabledChains[0],
    contractAddress,
    claimParams: {
      type,
      quantity: BigInt(quantity || 1),
      // tokenId: tokenId ? BigInt(tokenId) : undefined,
    },
    children: label || "Claim"
  };
};

export const getComponent = () => ThirdwebComponent;