export interface IGetReferenceDataResponseDto {
  version: number;
  data: {
    [key: string]: {
      [key: string]: {
        type: string;
        values: Value[] | Value;
      };
    };
  };
}

type Value = {
  id?: number;
  text?: string;
  version?: number;
  value?: string;
  short?: string;
  url?: string;
};
