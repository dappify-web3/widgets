
import * as component from "./token-gating.js";
import { Component, getComponent } from "./token-gating.js";
import { useActiveAccount } from "thirdweb/react";
import { fetchBalances, obfuscate, reveal } from '../utils/tokens.js';
import React from 'react';
import { render, act } from '@testing-library/react';

jest.mock('../utils/tokens', () => ({
  fetchBalances: jest.fn(),
  obfuscate: jest.fn(),
  reveal: jest.fn(),
}));

jest.mock('thirdweb/chains', () => ({
  defineChain: jest.fn((chainConfig) => chainConfig), // Mock defineChain to return the config
  Mainnet: { id: 1, name: 'Mainnet' }, // Mock Mainnet as a default chain
}));

jest.mock('thirdweb/utils', () => ({
  toEther: jest.fn((chainConfig) => 20), // Mock defineChain to return the config
}));

jest.mock('thirdweb/extensions/erc20', () => ({
  balanceOf: jest.fn((chainConfig) => 20000), // Mock defineChain to return the config
}));

jest.mock('thirdweb/extensions/erc721', () => ({
  balanceOf: jest.fn((chainConfig) => 721), // Mock defineChain to return the config
}));

jest.mock('thirdweb/extensions/erc1155', () => ({
  balanceOf: jest.fn((chainConfig) => 1155), // Mock defineChain to return the config
}));

jest.mock('thirdweb/react', () => ({
  useActiveAccount: jest.fn(() => ({ address: '0xabc' }))
}));

jest.mock('thirdweb', () => ({
  createThirdwebClient: jest.fn((config) => ({ clientId: config.clientId })), // Mock client creation
  getContract: jest.fn((config) => ({ mocked: true }))
}));

describe('getComponent', () => {
  it('returns the Component', () => {
    expect(getComponent()).toBe(Component);
  });
});

// Test props
describe('getProps', () => {
  test('returns correct props ERC721 Gating', () => {
    const element = {
      dataset: {
        clientId: 'test-client-id',
        chain: '1',
        gateId: 'demo',
        contractAddress: '0x',
        quantity: "1",
        type: 'ERC20'
      },
    };
    const result = component.getProps(element);

    const expectedResult = {
      client: { clientId: 'test-client-id' },
      chain: { id: 1 },
      contract: { mocked: true },
      contractAddress: "0x",
      gateId: "demo",
      quantity: "1",
      tokenId: undefined,
      type: "ERC20"
    }
    expect(result).toEqual(expectedResult);
  });
});

describe('Component', () => {
  const gateId = 'test-gate';
  const address = '0xabc';

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup DOM element for gateId
    const el = document.createElement('div');
    el.id = gateId;
    el.innerHTML = 'Secret';
    document.body.appendChild(el);

    // Mock thirdweb hook
    useActiveAccount.mockReturnValue({ address });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does not call fetchBalances when account is undefined', async () => {
    useActiveAccount.mockReturnValue(undefined); // 👈 simulate not connected

    await act(async () => {
      render(
        <Component
          gateId="test-gate"
          quantity={1}
          contract={{ address: '0xcontract' }}
          type="ERC20"
        />
      );
    });

    expect(fetchBalances).not.toHaveBeenCalled();
    expect(obfuscate).toHaveBeenCalled(); // still called regardless
    expect(reveal).toHaveBeenCalled();    // still called with null
  });

  it('uses default quantity when none is provided', async () => {
    useActiveAccount.mockReturnValue({ address: '0xabc' });
  
    await act(async () => {
      render(
        <Component
          gateId="test-gate"
          contract={{ address: '0xcontract' }}
          type="ERC20"
          // ⛔ quantity not passed!
        />
      );
    });
  
    // ✅ Will default to 1
    expect(reveal).toHaveBeenCalledWith(
      'test-gate',
      null,
      1,  // balance
      1   // quantity defaulted!
    );
  });
  
  it('calls fetchBalances when account exists', async () => {
    useActiveAccount.mockReturnValue({ address: '0xabc' });

    await act(async () => {
      render(
        <Component
          gateId="test-gate"
          quantity={2}
          contract={{ address: '0xcontract' }}
          type="ERC20"
        />
      );
    });

    expect(fetchBalances).toHaveBeenCalledWith(
      'ERC20',
      '0xabc',
      { address: '0xcontract' },
      undefined,
      expect.any(Function)
    );
  });

  it('calls fetchBalances when account exists', async () => {
    useActiveAccount.mockReturnValue({ address: '0xabc' });

    await act(async () => {
      render(
        <Component
          gateId="test-gate"
          quantity={1}
          contract={{ address: '0xcontract' }}
          type="ERC20"
        />
      );
    });

    expect(fetchBalances).toHaveBeenCalledWith(
      'ERC20',
      '0xabc',
      { address: '0xcontract' },
      undefined,
      expect.any(Function)
    );
  });

  it('does not call fetchBalances when account is undefined', async () => {
    useActiveAccount.mockReturnValue(undefined);

    await act(async () => {
      render(
        <Component
          gateId="test-gate"
          quantity={1}
          contract={{ address: '0xcontract' }}
          type="ERC20"
        />
      );
    });

    expect(fetchBalances).not.toHaveBeenCalled(); // ✅ Forces address = undefined path
  });

  it('does not call fetchBalances when account is undefined', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => { });
    useActiveAccount.mockReturnValue(undefined);

    await act(async () => {
      render(
        <Component
          gateId="test-gate"
          quantity={1}
          contract={{ address: '0xcontract' }}
          type="ERC20"
        />
      );
    });

    expect(fetchBalances).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith("No address, skipping fetchBalances.");
    spy.mockRestore();
  });

  it('calls fetchBalances, obfuscate, and reveal', async () => {
    await act(async () => {
      render(
        <Component
          gateId={gateId}
          quantity={1}
          contract={{ address: '0xcontract' }}
          type="ERC20"
        />
      );
    });

    expect(fetchBalances).toHaveBeenCalledWith(
      'ERC20',
      address,
      { address: '0xcontract' },
      undefined,
      expect.any(Function)
    );

    expect(obfuscate).toHaveBeenCalledWith(
      gateId,
      null,
      expect.any(Function)
    );

    expect(reveal).toHaveBeenCalledWith(
      gateId,
      null,
      1,
      1
    );
  });
});