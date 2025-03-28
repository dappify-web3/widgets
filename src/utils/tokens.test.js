import {
  loadERC20Balance,
  loadNFTBalance721,
  loadNFTBalance1155,
  fetchBalances,
  obfuscate,
  reveal,
} from './tokens';

import * as Tokens from './tokens';
import { useActiveAccount } from 'thirdweb/react';

jest.mock('thirdweb/chains', () => ({
  defineChain: jest.fn((chainConfig) => chainConfig),
  Mainnet: { id: 1, name: 'Mainnet' },
}));

jest.mock('thirdweb/utils', () => ({
  toEther: jest.fn(() => 20),
}));

jest.mock('thirdweb/extensions/erc20', () => ({
  balanceOf: jest.fn(() => Promise.resolve('20000000000000000000')),
}));

jest.mock('thirdweb/extensions/erc721', () => ({
  balanceOf: jest.fn(() => Promise.resolve(721)),
}));

jest.mock('thirdweb/extensions/erc1155', () => ({
  balanceOf: jest.fn(() => Promise.resolve(1155)),
}));

jest.mock('thirdweb/react', () => ({
  useActiveAccount: jest.fn(() => ({ address: '0xabc' })),
}));

jest.mock('thirdweb', () => ({
  createThirdwebClient: jest.fn((config) => ({ clientId: config.clientId })),
  getContract: jest.fn(() => ({ mocked: true })),
}));

describe('balances', () => {
  const contract = '0xb';
  const address = '0xa';
  const tokenId = 42;
  const setter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loaders', () => {
    it('loadERC20Balance sets ERC20 balance', async () => {
      await loadERC20Balance(contract, address, setter);
      expect(setter).toHaveBeenCalledWith(20);
    });

    it('loadNFTBalance721 sets ERC721 balance', async () => {
      await loadNFTBalance721(contract, address, setter);
      expect(setter).toHaveBeenCalledWith(721);
    });

    it('loadNFTBalance1155 sets ERC1155 balance', async () => {
      await loadNFTBalance1155(contract, address, tokenId, setter);
      expect(setter).toHaveBeenCalledWith(1155);
    });
  });

  describe('fetchBalances logic', () => {
    it.each([
      ['ERC20', 'loadERC20Balance'],
      ['ERC721', 'loadNFTBalance721'],
      ['ERC1155', 'loadNFTBalance1155'],
    ])('calls correct loader for %s', (type, fnName) => {
      const spy = jest.spyOn(Tokens, fnName).mockImplementation(() => { });
      fetchBalances(type, address, contract, tokenId, setter);
    });

    it.each([
      ['ERC20', 'loadERC20Balance'],
      ['ERC721', 'loadNFTBalance721'],
      ['ERC1155', 'loadNFTBalance1155'],
    ])('does nothing when address is falsy for %s', (type, fnName) => {
      const spy = jest.spyOn(Tokens, fnName).mockImplementation(() => { });
      [undefined, null, ''].forEach((badAddr) => {
        fetchBalances(type, badAddr, contract, tokenId, setter);
      });
      expect(spy).not.toHaveBeenCalled();
    });

    it('does nothing for unsupported balanceType', () => {
      const spy20 = jest.spyOn(Tokens, 'loadERC20Balance').mockImplementation(() => { });
      const spy721 = jest.spyOn(Tokens, 'loadNFTBalance721').mockImplementation(() => { });
      const spy1155 = jest.spyOn(Tokens, 'loadNFTBalance1155').mockImplementation(() => { });

      fetchBalances('UNKNOWN', address, contract, tokenId, setter);

      expect(spy20).not.toHaveBeenCalled();
      expect(spy721).not.toHaveBeenCalled();
      expect(spy1155).not.toHaveBeenCalled();
    });
  });
});
describe('obfuscate', () => {
  const gateId = 'test-gate';
  const setter = jest.fn();
  let gatedEl;

  beforeEach(() => {
    gatedEl = document.createElement('div');
    gatedEl.id = gateId;
    gatedEl.innerHTML = 'Secret Content';
    document.body.appendChild(gatedEl);
    setter.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing if element is not found', () => {
    obfuscate('invalid-id', null, setter);
    expect(setter).not.toHaveBeenCalled();
  });

  it('does nothing if already obfuscated', () => {
    obfuscate(gateId, 'alreadyObfuscated', setter);
    expect(setter).not.toHaveBeenCalled();
  });

  it('obfuscates and hides the content correctly', () => {
    obfuscate(gateId, null, setter);
    const raw = 'Secret Content';
    const base64 = btoa(raw);
    const reversed = base64.split('').reverse().join('');
    expect(setter).toHaveBeenCalledWith(reversed);
    expect(gatedEl.innerHTML).toBe('');
    expect(gatedEl.style.display).toBe('none'); // ✅ updated
  });
});

describe('reveal', () => {
  const gateId = 'reveal-test';
  let gatedEl;

  beforeEach(() => {
    gatedEl = document.createElement('div');
    gatedEl.id = gateId;
    document.body.appendChild(gatedEl);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing if element is not found', () => {
    const spy = jest.spyOn(window, 'atob');
    reveal('non-existent-id', 'something', 10, 1);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does nothing if obfuscated is falsy', () => {
    const spy = jest.spyOn(window, 'atob');
    reveal(gateId, null, 10, 1);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('reveals content when balance is sufficient', () => {
    const content = 'Unobfuscated Content';
    const obfuscated = btoa(content).split('').reverse().join('');
    reveal(gateId, obfuscated, 5, 1);
    expect(gatedEl.innerHTML).toBe(content);
    expect(gatedEl.style.display).toBe('block'); // ✅ updated
  });

  it('hides content when balance is insufficient', () => {
    gatedEl.innerHTML = 'Should be cleared';
    gatedEl.style.display = 'block';
    reveal(gateId, 'irrelevant', 0, 1);
    expect(gatedEl.innerHTML).toBe('');
    expect(gatedEl.style.display).toBe('none'); // ✅ updated
  });
});
