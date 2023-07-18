import { NextFunction, Request, Response } from 'express';
import ToggleManager from '@modules/toggles/togglemanager';
import config from '@core/enviroment-variable-config';

const togglemanager: ToggleManager = new ToggleManager(
  config.toggleUnleashDomain,
  config.toggleUnleashAppName,
  config.env,
  config.toggleUnleashAppToken
);

if (config.toggleUnleashEnabled) {
  togglemanager
    .getUnleashInstance()
    .then(() => {
      console.log('Got unleash instance');
      togglemanager.on('ToggleOn', (data) => {
        console.log('Got data changed ON ', JSON.stringify(data));
      });
      togglemanager.on('ToggleOff', (data) => {
        console.log('Got data changed OFF ', JSON.stringify(data));
      });
    })
    .catch((err) => {
      console.error('Caught error on unleash instance ', err);
    });
}

const toggleFeatureManagementMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uriList = togglemanager.getUpdatedBlacklistDefinitionsByURI();
  if (!Object.keys(uriList).length) {
    next();
    return;
  }

  const base = req.originalUrl.split('?')[0];
  //check if direct match in dictionary

  if (base in uriList) {
    console.error(
      `Found blacklist base ${base} in route for PUT / POST / DELETE method`
    );
    if (
      uriList[base]['methods'].indexOf(req.method.toUpperCase().trim()) != -1
    ) {
      res.status(406).send('Route disabled');
      return;
    }
  }

  // iterate through all keys , maybe it's a regexp
  for (const endpointKey of Object.keys(uriList)) {
    const rex = new RegExp(endpointKey);
    if (rex.test(base)) {
      console.error(
        `Found blacklist base ${base} by regex in route for PUT / POST / DELETE method`
      );
      if (
        uriList[endpointKey]['methods'].indexOf(
          req.method.toUpperCase().trim()
        ) != -1
      ) {
        res.status(406).send('Route disabled (regex)');
        return;
      }
    }
  }
  next();
};

export default toggleFeatureManagementMiddleware;
