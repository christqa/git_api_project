export interface IGetStoolDataResponseDto {
  date: number | string;
  consistency?: number;
  color?: number;
  hasBlood?: boolean;
  durationInSeconds?: number;
  frequency?: number;
  consistencyData?: {
    constipatedCount: number;
    normalCount: number;
    diarrheaCount: number;
    total: number;
  };
}
