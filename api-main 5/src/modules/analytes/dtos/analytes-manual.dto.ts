/**
 * @example "{\"beginning\": \"2022-06-10T08:00:00Z\", \"end\": \"2022-06-10T09:00:00Z\", \"isUrine\": true, \"isStool\": true}"
 */
export interface IAnalyteManualCreateRequestDto {
  beginning: Date;
  end: Date;
  isUrine: boolean;
  isStool: boolean;
}

export interface IAnalyteManualSNSMessage {
  data: IAnalyteManualCreateRequestDto;
}

export interface IAnalyteManualCreateInternalRequestDto {
  profileId: number;
  isUrine: boolean;
  isStool: boolean;
  date: Date;
  start: Date;
  end: Date;
}
