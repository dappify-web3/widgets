import * as component from "./direct-payment.js"; // Adjust the path to your module file
import * as availableChains from 'thirdweb/chains';
import { createThirdwebClient } from 'thirdweb';
import { PayEmbed as Component } from 'thirdweb/react';

// Mock the external dependencies
jest.mock('thirdweb/chains', () => ({
  defineChain: jest.fn((chainConfig) => chainConfig), // Mock defineChain to return the config
  Mainnet: { id: 1, name: 'Mainnet' },
}));

jest.mock('thirdweb', () => ({
  createThirdwebClient: jest.fn((config) => ({ clientId: config.clientId })),
}));

jest.mock('thirdweb/react', () => ({
  PayEmbed: jest.fn(() => 'MockedPayEmbedComponent'),
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns correct props with mandatory attributes', () => {
    const element = {
      dataset: {
        clientId: 'test-client-id',
        chains: '1,2',
        amount: '100',
        name: 'Test Product',
        sellerAddress: '0xSellerAddress',
      },
    };

    const result = component.getProps(element);

    expect(result).toEqual({
      client: { clientId: 'test-client-id' },
      theme: 'light',
      payOptions: {
        metadata: {
          name: 'Test Product',
          image: undefined
        },
        mode: 'direct_payment',
        paymentInfo: {
          chain: { id: 1 },
          sellerAddress: '0xSellerAddress',
          amount: '100'
        }
      }
    });

    expect(createThirdwebClient).toHaveBeenCalledWith({ clientId: 'test-client-id' });
    expect(availableChains.defineChain).toHaveBeenCalledTimes(2);
  });

  test('returns correct props with all attributes', () => {
    const element = {
      dataset: {
        clientId: 'full-client-id',
        chains: '137',
        amount: '50',
        name: 'Full Product',
        sellerAddress: '0xFullSeller',
        theme: 'dark',
        image: 'https://example.com/image.png'
      },
    };

    const result = component.getProps(element);

    expect(result).toEqual({
      client: { clientId: 'full-client-id' },
      theme: 'dark',
      payOptions: {
        metadata: {
          name: 'Full Product',
          image: 'https://example.com/image.png'
        },
        mode: 'direct_payment',
        paymentInfo: {
          chain: { id: 137 },
          sellerAddress: '0xFullSeller',
          amount: '50'
        }
      }
    });

    expect(createThirdwebClient).toHaveBeenCalledWith({ clientId: 'full-client-id' });
    expect(availableChains.defineChain).toHaveBeenCalledTimes(1);
  });
});
