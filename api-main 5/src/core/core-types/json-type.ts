interface JsonArray extends Array<JsonValue> {}
type JsonObject = { [Key in string]?: JsonValue };
export type JsonValue =
  | string
  | number
  | boolean
  | JsonObject
  | JsonArray
  | null;

export type InputJsonObject = {
  readonly [Key in string]?: InputJsonValue | null;
};
export interface InputJsonArray extends Array<InputJsonValue | null> {}
export type InputJsonValue =
  | string
  | number
  | boolean
  | InputJsonObject
  | InputJsonArray;
