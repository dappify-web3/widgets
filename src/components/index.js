import { getProps as getPropsConnectButton, getComponent as getConnectButtonComponent } from "./connect-button.js";
import { getProps as getPropsClaimButton, getComponent as getClaimButtonComponent } from "./claim-button.js";
import { getProps as getPropsTokenGating, getComponent as getTokenGatingComponent } from "./token-gating.js";

// Call getComponent() to get the actual component functions
const ConnectButton = getConnectButtonComponent();
const ClaimButton = getClaimButtonComponent();
const TokenGating = getTokenGatingComponent();

export const components = [
  { name: "ConnectButton", component: ConnectButton, getProps: getPropsConnectButton },
  { name: "ClaimButton", component: ClaimButton, getProps: getPropsClaimButton },
  { name: "TokenGating", component: TokenGating, getProps: getPropsTokenGating },
  // Add more components here as needed
];