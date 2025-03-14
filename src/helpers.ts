export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type RequiredOnly<T> = Pick<T, RequiredKeys<T>>;

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type OptionalOnly<T> = Pick<T, OptionalKeys<T>>;
