import { GroupByFilter } from '@modules/user-configuration/dtos/user-configuration.index.dto';
import { AnalyteTypes } from '../analytes.type';

export interface IAnalyteRemoveRequestDto {
  userEmail: string;
  date: number;
}

export interface IAnalyteRequestDto {
  userEmail: string;
  groupBy: GroupByFilter;
  date?: number;
  type?: AnalyteTypes;
  startDate: number | Date;
  endDate: number | Date;
}

export interface IAnalyteFileDto {
  userEmail: string;
  deleteData?: boolean;
  file: Express.Multer.File;
}
