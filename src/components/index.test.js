// components.test.js
import * as ConnectButtonModule from './connect-button.js';
import * as ClaimButtonModule from './claim-button.js';
import * as TokenGatingModule from './token-gating.js';
import { components } from './index.js';

// src/components/index.test.js
  jest.mock('./connect-button.js', () => ({
    getProps: jest.fn(() => ({ prop1: 'value1' })),
    getComponent: jest.fn(() => jest.fn(() => 'ConnectButtonComponent'))
  }));
  
  jest.mock('./claim-button.js', () => ({
    getProps: jest.fn(() => ({ prop2: 'value2' })),
    getComponent: jest.fn(() => jest.fn(() => 'ClaimButtonComponent'))
  }));

  jest.mock('./token-gating.js', () => ({
    getProps: jest.fn(() => ({ prop2: 'value3' })),
    getComponent: jest.fn(() => jest.fn(() => 'TokenGatingComponent'))
  }));
  
  describe('Components Export', () => {
    let ConnectButtonModule, ClaimButtonModule, TokenGatingModule, components;
  
    beforeEach(() => {
      jest.resetModules(); // Clear module cache
      jest.clearAllMocks(); // Clear mock call counts
      
      // Import modules fresh after mocks are set
      ConnectButtonModule = require('./connect-button.js');
      ClaimButtonModule = require('./claim-button.js');
      TokenGatingModule = require('./token-gating.js');
      ({ components } = require('./index.js'));
    });
  
    it('exports the correct number of components with expected structure', () => {
      expect(components).toHaveLength(3);
  
      // Test ConnectButton
      expect(components[0]).toEqual({
        name: 'ConnectButton',
        component: expect.any(Function),
        getProps: ConnectButtonModule.getProps
      });
  
      // Test ClaimButton
      expect(components[1]).toEqual({
        name: 'ClaimButton',
        component: expect.any(Function),
        getProps: ClaimButtonModule.getProps
      });
  
      // Test ClaimButton
      expect(components[2]).toEqual({
        name: 'TokenGating',
        component: expect.any(Function),
        getProps: TokenGatingModule.getProps
      });
            
      // Verify getComponent was called
      expect(ConnectButtonModule.getComponent).toHaveBeenCalledTimes(1);
      expect(ClaimButtonModule.getComponent).toHaveBeenCalledTimes(1);
      expect(TokenGatingModule.getComponent).toHaveBeenCalledTimes(1);
    });
  
    it('component functions return expected values', () => {
      const connectButtonFn = components[0].component;
      const claimButtonFn = components[1].component;
      const tokenGatingFn = components[2].component;
      expect(connectButtonFn()).toBe('ConnectButtonComponent');
      expect(claimButtonFn()).toBe('ClaimButtonComponent');
      expect(tokenGatingFn()).toBe('TokenGatingComponent');
    });
  });