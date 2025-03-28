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
  defineChain: jest.fn((chainConfig) => chainConfig),
  Mainnet: { id: 1, name: 'Mainnet' },
}));

jest.mock('thirdweb/utils', () => ({
  toEther: jest.fn(() => 20),
}));

jest.mock('thirdweb/extensions/erc20', () => ({
  balanceOf: jest.fn(() => 20000),
}));

jest.mock('thirdweb/extensions/erc721', () => ({
  balanceOf: jest.fn(() => 721),
}));

jest.mock('thirdweb/extensions/erc1155', () => ({
  balanceOf: jest.fn(() => 1155),
}));

jest.mock('thirdweb/react', () => ({
  useActiveAccount: jest.fn(() => ({ address: '0xabc' })),
}));

jest.mock('thirdweb', () => ({
  createThirdwebClient: jest.fn((config) => ({ clientId: config.clientId })),
  getContract: jest.fn(() => ({ mocked: true })),
}));

describe('getComponent', () => {
  it('returns the Component', () => {
    expect(getComponent()).toBe(Component);
  });
});

describe('getProps', () => {
  test('returns correct props ERC721 Gating', () => {
    const element = {
      dataset: {
        clientId: 'test-client-id',
        chain: '1',
        gateId: 'demo',
        contractAddress: '0x',
        quantity: "1",
        type: 'ERC20',
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
    };

    expect(result).toEqual(expectedResult);
  });
});

describe('Component', () => {
  const gateId = 'test-gate';
  const address = '0xabc';

  beforeEach(() => {
    jest.clearAllMocks();

    const el = document.createElement('div');
    el.id = gateId;
    el.innerHTML = 'Secret';
    document.body.appendChild(el);

    obfuscate.mockImplementation((_, __, setter) => setter("mocked-obfuscated-value"));
    fetchBalances.mockImplementation((_, __, ___, ____, setBalance) => setBalance(1));
    useActiveAccount.mockReturnValue({ address });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does not call fetchBalances when account is undefined', async () => {
    useActiveAccount.mockReturnValue(undefined);

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

    expect(fetchBalances).not.toHaveBeenCalled();
    expect(obfuscate).toHaveBeenCalled();
    expect(reveal).toHaveBeenCalledWith(gateId, "mocked-obfuscated-value", 0, 1);
  });

  it('uses default quantity when none is provided', async () => {
    await act(async () => {
      render(
        <Component
          gateId={gateId}
          contract={{ address: '0xcontract' }}
          type="ERC20"
        />
      );
    });

    expect(reveal).toHaveBeenCalledWith(gateId, "mocked-obfuscated-value", 1, 1);
  });

  it('calls fetchBalances when account exists', async () => {
    await act(async () => {
      render(
        <Component
          gateId={gateId}
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

    expect(fetchBalances).toHaveBeenCalled();
    expect(obfuscate).toHaveBeenCalledWith(
      gateId,
      null,
      expect.any(Function)
    );
    expect(reveal).toHaveBeenCalledWith(
      gateId,
      "mocked-obfuscated-value",
      1,
      1
    );
  });

  it('calls reveal with balance = 0 when disconnected', async () => {
    useActiveAccount.mockReturnValue(undefined);
    fetchBalances.mockImplementation(); // should not be called

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

    expect(fetchBalances).not.toHaveBeenCalled();
    expect(reveal).toHaveBeenCalledWith(gateId, "mocked-obfuscated-value", 0, 1);
  });
});

describe('Component when disconnected', () => {
  beforeEach(() => {
    jest.resetModules(); // Clears require cache to allow remocking
    jest.clearAllMocks();

    // Reset DOM
    document.body.innerHTML = '';

    // Mock the DOM element
    const el = document.createElement('div');
    el.id = 'test-gate';
    el.innerHTML = 'Secret';
    document.body.appendChild(el);

    // Mock obfuscate to always set a value
    obfuscate.mockImplementation((_, __, setter) => setter("mocked-obfuscated-value"));
  });

  it('logs when no account is present', async () => {
    // Mock console.log
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
    // Override useActiveAccount to simulate disconnect
    useActiveAccount.mockImplementation(() => undefined);
  
    // Ensure balance doesn't get set
    fetchBalances.mockImplementation(() => {}); // should not be called
    obfuscate.mockImplementation((_, __, setter) => setter("mocked-obfuscated-value"));
  
    const el = document.createElement('div');
    el.id = 'test-gate';
    el.innerHTML = 'Secret';
    document.body.appendChild(el);
  
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
    expect(reveal).toHaveBeenCalledWith('test-gate', 'mocked-obfuscated-value', 0, 1);
    spy.mockRestore();
  });
  
});
