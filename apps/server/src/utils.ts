import { Repository } from "typeorm";

import { ObjectLiteral } from "typeorm";
import { vi } from "vitest";

export type RequiredKeys<T, K extends keyof T> = {
  [P in K]-?: T[P];
} & Omit<T, K>;

export type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, any>
>;

export const createMockRepository = <
  T extends ObjectLiteral = any
>(): MockRepository<T> => ({
  find: vi.fn(),
  findOne: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  create: vi.fn(),
});
