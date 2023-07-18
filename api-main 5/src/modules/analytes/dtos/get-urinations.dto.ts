import { Decimal } from '@prisma/client/runtime';
import { IColor } from '../analytes.type';

export interface IGetUrineResponseDto {
  date: number | string;
  color?: number;
  colorData?: IColor;
  durationInSeconds?: number;
  concentration?: Decimal | number;
  frequency?: number;
}
