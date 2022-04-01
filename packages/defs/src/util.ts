export type OverrideProperties<
  T extends Record<string, any>,
  U extends Partial<Record<keyof T, any>>
> = { [K in keyof T]: K extends keyof U ? U[K] : T[K] };
