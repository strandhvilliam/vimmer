export type ToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<ToCamelCase<U>>}`
  : S;

export type ToCamelCaseObject<T> =
  T extends Array<infer U>
    ? Array<ToCamelCaseObject<U>>
    : T extends object
      ? {
          [K in keyof T as K extends string
            ? ToCamelCase<K>
            : K]: ToCamelCaseObject<T[K]>;
        }
      : T;
