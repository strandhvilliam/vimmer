type CamelCase<T> =
  T extends Array<infer U>
    ? Array<CamelCase<U>>
    : T extends object
      ? {
          [K in keyof T as K extends string
            ? K extends `${infer F}_${infer R}`
              ? `${F}${Capitalize<R>}`
              : K
            : K]: CamelCase<T[K]>
        }
      : T

export function toCamelCase<T>(obj: T): CamelCase<T> {
  if (obj === null) return obj as CamelCase<T>
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as CamelCase<T>
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase(),
        )
        acc[camelKey] = toCamelCase(value)
        return acc
      },
      {},
    ) as CamelCase<T>
  }

  return obj as CamelCase<T>
}

type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Uppercase<T>
    ? `_${Lowercase<T>}${SnakeCase<U>}`
    : `${T}${SnakeCase<U>}`
  : S

type DeepSnakeCase<T> =
  T extends Array<infer U>
    ? Array<DeepSnakeCase<U>>
    : T extends object
      ? {
          [K in keyof T as K extends string
            ? SnakeCase<K> extends infer SK
              ? SK extends string
                ? SK
                : never
              : never
            : K]: DeepSnakeCase<T[K]>
        }
      : T

export function toSnakeCase<T>(obj: T): DeepSnakeCase<T> {
  if (obj === null) return obj as DeepSnakeCase<T>
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item)) as DeepSnakeCase<T>
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        const snakeKey = key.replace(
          /[A-Z]/g,
          letter => `_${letter.toLowerCase()}`,
        )
        acc[snakeKey] = toSnakeCase(value)
        return acc
      },
      {},
    ) as DeepSnakeCase<T>
  }
  return obj as DeepSnakeCase<T>
}
