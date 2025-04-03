import { defineChain } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { PayEmbed as ThirdwebComponent } from "thirdweb/react";

export const getProps = (element) => {
  const { clientId, chains, amount, name, sellerAddress, theme, image } = element.dataset;
  const enabledChains = chains?.split(",").map((id) => defineChain({ id: parseInt(id) })).filter(Boolean);
  const props = {
    client: createThirdwebClient({ clientId }),
    theme: theme || "light",
    payOptions: {
      metadata: {
        name,
        image
      },
      mode: "direct_payment",
      paymentInfo: {
        chain: enabledChains[0],
        sellerAddress,
        amount,
      },
    }
  }
  return props;
};

export const getComponent = () => ThirdwebComponent;