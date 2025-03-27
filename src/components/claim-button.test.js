// // module.test.js
import * as component from "./claim-button.js"; // Adjust the path to your module file
import * as availableChains from 'thirdweb/chains';
import { createThirdwebClient } from 'thirdweb';
import { ClaimButton as Component } from 'thirdweb/react';

// Mock the external dependencies
jest.mock('thirdweb/chains', () => ({
  defineChain: jest.fn((chainConfig) => chainConfig), // Mock defineChain to return the config
  Mainnet: { id: 1, name: 'Mainnet' }, // Mock Mainnet as a default chain
}));

jest.mock('thirdweb', () => ({
  createThirdwebClient: jest.fn((config) => ({ clientId: config.clientId })), // Mock client creation
}));

jest.mock('thirdweb/react', () => ({
  ConnectButton: jest.fn(() => 'MockedConnectButton'), // Mock ConnectButton component
}));

// Test component
describe('getComponent', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks between tests
  });

  test('Exports react component as component', () => {
    expect(component.getComponent()).toEqual(Component);
  });
});

// Test props
describe('getProps', () => {
    test('returns correct props with mandatory attributes', () => {
      const element = {
        dataset: {
          clientId: 'test-client-id',
          chains: '1,2,3',
          contractAddress: '0x',
          type: 'ERC20'
        },
      };
  
      const result = component.getProps(element);
  
      expect(result).toEqual({
        client: { clientId: 'test-client-id' },
        theme: 'light',
        chains: [{ id: 1 }, { id: 2 }, { id: 3 }],
        chain: { id: 1 },
        contractAddress: '0x',
        claimParams: {
            quantity: 1n,
            type: 'ERC20'
        }
      });
      expect(createThirdwebClient).toHaveBeenCalledWith({ clientId: 'test-client-id' });
      expect(availableChains.defineChain).toHaveBeenCalledTimes(3);
    });
  
    test('returns correct props with all attributes', () => {
        const element = {
          dataset: {
            clientId: 'test-client-id',
            chains: '1,2,3',
            theme: 'dark',
            label: 'test',
            contractAddress: '0x',
            quantity: 1n,
            type: 'ERC20'
          },
        };
    
        const result = component.getProps(element);
    
        expect(result).toEqual({
          client: { clientId: 'test-client-id' },
          theme: 'light',
          chains: [{ id: 1 }, { id: 2 }, { id: 3 }],
          chain: { id: 1 },
          theme: 'dark',
          children: 'test',
          contractAddress: '0x',
          claimParams: {
                quantity: 1n,
                type: 'ERC20'
            }
        });
        expect(createThirdwebClient).toHaveBeenCalledWith({ clientId: 'test-client-id' });
        expect(availableChains.defineChain).toHaveBeenCalledTimes(6);
    });
});