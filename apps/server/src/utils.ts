export type RequiredKeys<T, K extends keyof T> = {
  [P in K]-?: T[P];
} & Omit<T, K>;
