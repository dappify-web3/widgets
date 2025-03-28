import { useEffect, useState } from "react";
import { defineChain } from "thirdweb/chains";
import { createThirdwebClient, getContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { obfuscate, reveal, fetchBalances } from "../utils/tokens";

export const Component = ({ gateId, quantity = 1, contract, type, tokenId }) => {
  const [balance, setBalance] = useState(0);
  const [obfuscated, setObfuscated] = useState(null);
  const account = useActiveAccount();
  const address = account?.address;

  // Step 1: Obfuscate only once on mount
  useEffect(() => {
    obfuscate(gateId, obfuscated, setObfuscated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  // Step 2: Fetch balance or reset on disconnect
  useEffect(() => {
    if (!address) {
      // Wallet disconnected: reset balance
      setBalance(0);
      return;
    }

    // Wallet connected: fetch balance
    fetchBalances(type, address, contract, tokenId, setBalance);
  }, [address, type, contract, tokenId]);

  // Step 3: Reveal or hide content based on balance
  useEffect(() => {
    if (obfuscated) {
      reveal(gateId, obfuscated, balance, quantity);
    }
  }, [obfuscated, balance, gateId, quantity]);

  return null;
};

export const getProps = (element) => {
  const { clientId, chain, gateId, contractAddress, quantity, type, tokenId } = element.dataset;
  const client = createThirdwebClient({ clientId });
  const selectedChain = defineChain({ id: parseInt(chain) });
  const contract = getContract({ client, chain: selectedChain, address: contractAddress });

  return {
    client,
    chain: selectedChain,
    gateId,
    contractAddress,
    quantity,
    type,
    contract,
    tokenId,
  };
};

export const getComponent = () => Component;
