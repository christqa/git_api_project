import { AnalyteTypes } from '../../analytes/analytes.type';

export interface IAnalytesCombinedResponseDTO {
  count: number;
  data: IAnalyteDataType[];
}

export interface IAnalyteDataType {
  type: AnalyteTypes;
  durationInSeconds: number;
  startDate: Date;
  endDate: Date;
}
