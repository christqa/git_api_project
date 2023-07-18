import EventEmitter from 'events';
import { func } from 'joi';
import * as uclient from 'unleash-client';
import ToggleManager from './togglemanager';
import config from '@core/enviroment-variable-config';

jest.mock('unleash-client', () => ({
  startUnleash: jest.fn(),
  InMemStorageProvider: jest.fn(),
  getFeatureToggleDefinitions: jest.fn(),
}));

describe('ToggleManager', () => {
  let toggleManager: ToggleManager;

  beforeEach(() => {
    toggleManager = new ToggleManager(
      'http://localhost:4242',
      'test-app',
      'test',
      'test-auth-token'
    );
  });

  describe('constructor', () => {
    it('should set the url, appName, environment, and authToken properties', () => {
      expect(toggleManager.url).toBe('http://localhost:4242');
      expect(toggleManager.appName).toBe('test-app');
      expect(toggleManager.enviromnent).toBe('test');
      expect(toggleManager.authToken).toBe('test-auth-token');
    });
  });

  describe('getDomain', () => {
    it('should return the concatenation of the url, appName, and environment properties', () => {
      expect(toggleManager.getDomain()).toBe(
        'http://localhost:4242test-apptest'
      );
    });
  });

  describe('getUpdatedToggleDefinitions', () => {
    it('should return the toggleDefinitions property', () => {
      toggleManager.toggleDefinitions = { foo: 'bar' };
      expect(toggleManager.getUpdatedToggleDefinitions()).toEqual({
        foo: 'bar',
      });
    });
  });

  describe('getUpdatedBlacklistDefinitionsByURI', () => {
    it('should return the blacklistDefinitionsByURI property', () => {
      toggleManager.blacklistDefinitionsByURI = { foo: 'bar' };
      expect(toggleManager.getUpdatedBlacklistDefinitionsByURI()).toEqual({
        foo: 'bar',
      });
    });
  });

  describe('getUnleashInstance', () => {
    it('should return the existing unleash instance if it exists in the unleashInstance property', async () => {
      const mockUnleashInstance = {
        isEnabled: () => false,
        getVariant: () => '',
      };
      ToggleManager.unleashInstance[toggleManager.getDomain()] =
        mockUnleashInstance;
      const unleashInst = await toggleManager.getUnleashInstance();
      console.log('UNLEASH INST ', JSON.stringify(unleashInst));
      console.log('MOCK UIN ', JSON.stringify(mockUnleashInstance));
      expect(JSON.stringify(unleashInst)).toEqual(
        JSON.stringify(mockUnleashInstance)
      );
    });

    it('should create a new unleash instance if it does not exist in the unleashInstance property', async () => {
      const mockStartUnleash = uclient.startUnleash as jest.Mock;
      const mockUnleashInstance = {
        isEnabled: () => false,
        getVariant: () => '',
        // eslint-disable-next-line
        on: function () {},
      };
      config.toggleUnleashEnabled = true;
      const mockFeatureToggleDefs =
        uclient.getFeatureToggleDefinitions as jest.Mock;
      mockFeatureToggleDefs.mockReturnValue(undefined);
      mockStartUnleash.mockReturnValue(Promise.resolve(mockUnleashInstance));
      toggleManager = new ToggleManager(
        'http://localhost:4243',
        'test-app',
        'test',
        'test-auth-token'
      );
      const unleashInst = await toggleManager.getUnleashInstance();
      expect(JSON.stringify(unleashInst)).toBe(
        JSON.stringify(mockUnleashInstance)
      );
      expect(uclient.startUnleash).toHaveBeenCalledWith({
        url: 'http://localhost:4243',
        appName: 'test-app',
        environment: 'test',
        refreshInterval: 300,
        storageProvider: new uclient.InMemStorageProvider(),
        customHeaders: { Authorization: 'test-auth-token' },
      });
    });

    it('should initialize the toggleDefinitions and blacklistDefinitionsByURI properties with the feature toggle definitions', async () => {
      const mockStartUnleash = uclient.startUnleash as jest.Mock;
      const mockUnleashInstance = { on: jest.fn() };

      mockStartUnleash.mockReturnValue(Promise.resolve(mockUnleashInstance));
      const mockGetFeatureToggleDefinitions =
        uclient.getFeatureToggleDefinitions as jest.Mock;
      mockGetFeatureToggleDefinitions.mockReturnValue([
        {
          name: 'toggle1',
          enabled: true,
          variants: [
            {
              name: 'endpoints',
              payload: {
                value: JSON.stringify({ endpoints: ['foo', 'bar'] }),
              },
            },
          ],
        },
        {
          name: 'toggle2',
          enabled: false,
          variants: [
            {
              name: 'endpoints',
              payload: {
                value: JSON.stringify({ endpoints: ['baz', 'qux'] }),
              },
            },
          ],
        },
      ]);
      await toggleManager.getUnleashInstance();
      expect(toggleManager.toggleDefinitions).toEqual({
        toggle1: {
          name: 'toggle1',
          enabled: true,
          variants: [
            {
              name: 'endpoints',
              payload: {
                value: JSON.stringify({ endpoints: ['foo', 'bar'] }),
              },
            },
          ],
        },
        toggle2: {
          name: 'toggle2',
          enabled: false,
          variants: [
            {
              name: 'endpoints',
              payload: {
                value: JSON.stringify({ endpoints: ['baz', 'qux'] }),
              },
            },
          ],
        },
      });
      expect(toggleManager.blacklistDefinitionsByURI).toEqual({
        '0': {
          methods: ['q'],
          toggleDef: {
            name: 'toggle2',
            enabled: false,
            variants: [
              {
                name: 'endpoints',
                payload: {
                  value: JSON.stringify({
                    endpoints: ['baz', 'qux'],
                  }),
                },
              },
            ],
          },
        },
      });
    });
  });

  describe('isToggleEnabled', () => {
    it('should return the result of calling isEnabled on the unleash instance', async () => {
      const toggleName = 'toggle1';
      const context = {};
      const isEnabledResult = true;
      const unleashInstance = {
        isEnabled: jest.fn().mockResolvedValue(isEnabledResult),
      };
      ToggleManager.unleashInstance[toggleManager.getDomain()] =
        unleashInstance;
      const result = await toggleManager.isToggleEnabled(toggleName, context);
      expect(unleashInstance.isEnabled).toHaveBeenCalledWith(
        toggleName,
        context
      );
      expect(result).toBe(isEnabledResult);
    });
  });

  describe('getVariant', () => {
    it('should return the variant with the given name from the unleash instance', async () => {
      const variantName = 'variant1';
      const variant = { name: variantName };
      const unleashInstance = {
        getVariant: jest.fn().mockResolvedValue(variant),
      };
      ToggleManager.unleashInstance[toggleManager.getDomain()] =
        unleashInstance;
      const result = await toggleManager.getVariant(variantName);
      expect(unleashInstance.getVariant).toHaveBeenCalledWith(variantName);
      expect(result).toBe(variant);
    });
  });
});
