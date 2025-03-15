export type FixedArray<T, L extends number> = [T, ...T[]] & { length: L };
