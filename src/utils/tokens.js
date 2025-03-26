import { balanceOf as balanceOf721 } from "thirdweb/extensions/erc721";
import { balanceOf as balanceOf1155 } from "thirdweb/extensions/erc1155";
import { balanceOf as balanceOf20 } from "thirdweb/extensions/erc20";
import { toEther } from "thirdweb/utils";

export const loadERC20Balance = async (contract, address, setBalance) => {
    const personalBalance = await balanceOf20({ contract, address });
    const formattedPersonalBalance = toEther(personalBalance);
    setBalance(Number(formattedPersonalBalance))
}

export const loadNFTBalance721 = async (contract, address, setBalance) => {
    const personalBalance = await balanceOf721({ contract, owner: address });
    setBalance(personalBalance)
}

export const loadNFTBalance1155 = async (contract, address, tokenId, setBalance) => {
    const personalBalance = await balanceOf1155({ contract, owner: address, tokenId });
    setBalance(personalBalance)
}

export const fetchBalances = (balanceType, address, contract, tokenId, setBalance) => {
    if (!address) return;

    if (balanceType === "ERC20") {
      loadERC20Balance(contract, address, setBalance);
    } else if (balanceType === "ERC721") {
      loadNFTBalance721(contract, address, setBalance);
    } else if (balanceType === "ERC1155") {
      loadNFTBalance1155(contract, address, tokenId, setBalance);
    }
}

export const obfuscate = (gateId, obfuscated, setter) => {
    const gatedEl = document.getElementById(gateId);
    if (!gatedEl || obfuscated) return;

    const rawHtml = gatedEl.innerHTML.trim();
    const base64 = btoa(rawHtml);
    const reversed = base64.split("").reverse().join("");

    setter(reversed);
    gatedEl.innerHTML = '';
    gatedEl.classList.add("token-gated"); // ✅ Ensure it's hidden
}

export const reveal = (gateId, obfuscated, balance, quantity) => {
    const gatedEl = document.getElementById(gateId);
    if (!gatedEl || !obfuscated) return;

    if (balance >= parseInt(quantity)) {
        const decoded = atob(obfuscated.split("").reverse().join(""));
        gatedEl.innerHTML = decoded;
        gatedEl.classList.remove("token-gated"); // ✅ Reveal gated section
    } else {
        gatedEl.innerHTML = '';
        gatedEl.classList.add("token-gated"); // Just in case
    }
}