import { useEffect, useState } from "react";
import * as availableChains from "thirdweb/chains";
import { createThirdwebClient, getContract  } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { obfuscate, reveal, fetchBalances } from "../utils/tokens";


export const Component = ({ gateId, quantity=1, contract, type, tokenId }) => {
    const [balance, setBalance] = useState(1)
    const [obfuscated, setObfuscated] = useState(null);
    const account = useActiveAccount();
    const address = account ? account.address : undefined;

    useEffect(() => {
      obfuscate(gateId, obfuscated, setObfuscated);
      reveal(gateId, obfuscated, balance, quantity);
    }, [balance, gateId, obfuscated]);

    useEffect(() => {
      if (!address) {
        // Explicitly use the falsy branch
        console.log("No address, skipping fetchBalances.");
        return;
      }
      fetchBalances(type, address, contract, tokenId, setBalance);
    }, [account])
  
    return null;
}

export const getProps = (element) => {
  const { clientId, chain, gateId, contractAddress, quantity, type, tokenId } = element.dataset;
  const client = createThirdwebClient({ clientId });
  const selectedChain = availableChains.defineChain({ id: parseInt(chain) });
  const contract = getContract({ client, chain: selectedChain, address: contractAddress, });
  const props = { client, chain: selectedChain, gateId, contractAddress, quantity, type, contract, tokenId }; 
  return props;
};

export const getComponent = () => Component;