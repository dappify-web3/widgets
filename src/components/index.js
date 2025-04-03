import { getProps as getPropsConnectButton, getComponent as getConnectButtonComponent } from "./connect-button.js";
import { getProps as getPropsClaimButton, getComponent as getClaimButtonComponent } from "./claim-button.js";
import { getProps as getPropsTokenGating, getComponent as getTokenGatingComponent } from "./token-gating.js";
import { getProps as getPropsDirectPayment, getComponent as getDirectPaymentComponent } from "./direct-payment.js";

export const components = [
  { name: "ConnectButton", component: getConnectButtonComponent(), getProps: getPropsConnectButton },
  { name: "ClaimButton", component: getClaimButtonComponent(), getProps: getPropsClaimButton },
  { name: "TokenGating", component: getTokenGatingComponent(), getProps: getPropsTokenGating },
  { name: "DirectPayment", component: getDirectPaymentComponent(), getProps: getPropsDirectPayment },
  // Add more components here as needed
];