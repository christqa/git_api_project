import { badRequestError } from '@core/error-handling/error-list';

const hydrationMustHaveTimeOfDay = () => {
  // internal error no need to translate
  return badRequestError('Hydration score must have time of day');
};

export default { hydrationMustHaveTimeOfDay };
