import { Prisma, DataStore } from '@prisma/client';

export type IDataStore = DataStore;

export type IDataStoreCreateInput = Prisma.DataStoreUncheckedCreateInput;

/**
 * @example "{\"isBathroomUsageCompleted\": false, \"isLifestyleCompleted\": false, \"isMedicalConditionsCompleted\": true, \"isMedicationsCompleted\": false, \"batteryLevel\": \"high\", \"batteryPercentage\": 100}"
 */
export type IDataStoreKeyValues = {
  [key: string]: string | number | boolean;
};
