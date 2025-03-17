import * as availableChains from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { ClaimButton as ThirdwebClaimButton } from "thirdweb/react";

export const getProps = (element) => {
  const { clientId, theme, chains, contractAddress, type, claimQuantity, tokenId } = element.dataset;
  const enabledChains = chains?.split(",").map((id) => availableChains.defineChain({ id: parseInt(id) })).filter(Boolean);
  const defaultChain = enabledChains?.[0] || availableChains.Mainnet;
  return {
    client: createThirdwebClient({ clientId }),
    theme: theme || "light",
    chains: enabledChains.length ? enabledChains : [defaultChain],
    chain: defaultChain,
    contractAddress,
    claimParams: {
      type: type || "ERC721",
      quantity: claimQuantity ? BigInt(claimQuantity) : BigInt(1),
      tokenId: tokenId ? BigInt(tokenId) : undefined,
    },
    children: "Claim Now",
  };
};

export const getComponent = () => ThirdwebClaimButton;