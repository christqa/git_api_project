import EventEmitter from 'events';
import config from '@core/enviroment-variable-config';

import {
  startUnleash,
  InMemStorageProvider,
  getFeatureToggleDefinitions,
  Unleash,
} from 'unleash-client';

class ToggleManager extends EventEmitter {
  public static unleashInstance: Record<string, any> = {};
  public url = '';
  public appName = '';
  public enviromnent = '';
  public authToken = '';
  public toggleDefinitions: Record<string, any> = {};
  public blacklistDefinitionsByURI: Record<string, any> = {};

  constructor(
    url: string,
    appName: string,
    environment: string,
    authToken: string
  ) {
    super();
    this.url = url;
    this.appName = appName;
    this.enviromnent = environment;
    this.authToken = authToken;
  }

  static async connectToUnleash(
    url: string,
    appName: string,
    environment: string,
    authToken: string
  ): Promise<Unleash> {
    return await startUnleash({
      url,
      appName,
      environment,
      refreshInterval: 300,
      storageProvider: new InMemStorageProvider(),
      customHeaders: { Authorization: authToken },
    });
  }

  getDomain() {
    return this.url + this.appName + this.enviromnent;
  }

  getUpdatedToggleDefinitions() {
    return this.toggleDefinitions;
  }

  getUpdatedBlacklistDefinitionsByURI() {
    return this.blacklistDefinitionsByURI;
  }

  checkToggleDefs() {
    const toggleDefs = getFeatureToggleDefinitions();
    if (!toggleDefs) {
      return;
    }

    for (const toggleDef of toggleDefs) {
      this.toggleDefinitions[toggleDef.name] = toggleDef;
      for (const variant of toggleDef.variants) {
        if (variant.name !== 'endpoints') {
          continue;
        }
        const parsedEndpointsJson = JSON.parse(variant.payload['value'])[
          'endpoints'
        ];
        for (const endpointDict of parsedEndpointsJson) {
          const endpoint = Object.keys(endpointDict)[0];
          const httpMethodValues = endpointDict[endpoint]
            .split(',')
            .map((x: string) => x.trim());
          if (!toggleDef.enabled) {
            this.blacklistDefinitionsByURI[endpoint] = {
              toggleDef,
              methods: httpMethodValues,
            };
          } else {
            delete this.blacklistDefinitionsByURI[endpoint];
          }
        }
      }
    }
  }

  //eslint-disable-next-line
  processVariant(feature: any) {
    for (const variant of feature.variants) {
      if (variant.name !== 'endpoints') {
        continue;
      }
      const parsedEndpointsJson = JSON.parse(variant.payload['value'])[
        'endpoints'
      ];
      for (const endpointDict of parsedEndpointsJson) {
        const endpoint = Object.keys(endpointDict)[0];
        const httpMethodValues = endpointDict[endpoint]
          .split(',')
          .map((x: string) => x.trim());
        if (!feature.enabled) {
          this.blacklistDefinitionsByURI[endpoint] = {
            feature,
            methods: httpMethodValues,
          };
        } else {
          delete this.blacklistDefinitionsByURI[endpoint];
        }
      }
    }
  }

  //eslint-disable-next-line
  onChangedUnleashData(data: any) {
    for (const feature of data) {
      this.processVariant(feature);
      if (this.toggleDefinitions[feature.name].enabled != feature.enabled) {
        //toggle changed
        this.toggleDefinitions[feature.name] = feature;
        this.emit(feature.enabled ? 'ToggleOn' : 'ToggleOff', feature);
      }
    }
  }

  async getUnleashInstance() {
    if (!config.toggleUnleashEnabled) {
      console.log('Unleash is disabled from .env');
      return {
        isEnabled: () => false,
        getVariant: () => '',
      };
    }

    if (this.getDomain() in ToggleManager.unleashInstance) {
      this.checkToggleDefs();
      return ToggleManager.unleashInstance[this.getDomain()];
    }
    ToggleManager.unleashInstance[this.getDomain()] =
      await ToggleManager.connectToUnleash(
        this.url,
        this.appName,
        this.enviromnent,
        this.authToken
      );
    this.checkToggleDefs();
    ToggleManager.unleashInstance[this.getDomain()].on(
      'changed',
      //eslint-disable-next-line
      (data: any) => {
        return this.onChangedUnleashData(data);
      }
    );
    return ToggleManager.unleashInstance[this.getDomain()];
  }

  async isToggleEnabled(toggleName: string, context: any = undefined) {
    const unleashInstance = await this.getUnleashInstance();
    return unleashInstance.isEnabled(toggleName, context);
  }

  getFeatureToggleDefinitions() {
    return getFeatureToggleDefinitions();
  }

  async getVariant(variantName: string) {
    const unleashInstance = await this.getUnleashInstance();
    return unleashInstance.getVariant(variantName);
  }
}

export default ToggleManager;
